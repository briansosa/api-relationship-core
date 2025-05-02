import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { persist } from 'zustand/middleware'
import { Schema, SchemaCreate, SchemaFilter, SchemaStore, SchemaUpdate, SortField, SortOrder } from '@/types/schema'
import {
  GetAllOperationSchema,
  UpdateOperationSchema,
  TestRequest,
  GetOperationSchema,
  InsertOperationSchema,
  DeleteOperationSchema,
} from '../../../wailsjs/go/handlers/OperationSchemaHandler'
import { fromWailsSchema, toWailsSchema } from '@/lib/adapters/schema'

export const useSchemaStore = create<SchemaStore>()(
  persist(
    immer((set, get) => ({
      // Estado
      schemas: [],
      selectedSchema: null,
      loading: false,
      error: null,
      filter: {},
      sortField: 'name',
      sortOrder: 'asc',

      // Filtrado y ordenamiento
      setFilter: (filter: Partial<SchemaFilter>) => {
        set(state => {
          state.filter = { ...state.filter, ...filter }
        })
      },

      clearFilter: () => {
        set({ filter: {} })
      },

      setSorting: (field: SortField, order: SortOrder) => {
        set({ sortField: field, sortOrder: order })
      },

      getFilteredSchemas: () => {
        const { schemas, filter, sortField, sortOrder } = get()
        
        // Aplicar filtros
        let filtered = [...schemas]
        
        if (filter.searchQuery) {
          const query = filter.searchQuery.toLowerCase()
          filtered = filtered.filter(schema => 
            schema.name.toLowerCase().includes(query) || 
            schema.url.toLowerCase().includes(query)
          )
        }
        
        if (filter.methodType && filter.methodType.length > 0) {
          filtered = filtered.filter(schema => 
            filter.methodType!.includes(schema.method_type)
          )
        }
        
        if (filter.favorite !== undefined) {
          filtered = filtered.filter(schema => 
            schema.favorite === filter.favorite
          )
        }
        
        // Aplicar ordenamiento
        filtered.sort((a: Schema, b: Schema) => {
          let comparison = 0
          
          switch (sortField) {
            case 'name':
              comparison = a.name.localeCompare(b.name)
              break
            case 'method_type':
              comparison = a.method_type.localeCompare(b.method_type)
              break
            case 'lastUsed':
              // Validar que existan valores para lastUsed
              const dateA = a.lastUsed ? new Date(a.lastUsed).getTime() : 0
              const dateB = b.lastUsed ? new Date(b.lastUsed).getTime() : 0
              comparison = dateA - dateB
              break
          }
          
          return sortOrder === 'asc' ? comparison : -comparison
        })
        
        return filtered
      },

      // Acciones básicas
      fetchSchemas: async () => {
        // Solo cargamos los schemas si aún no hay datos en el store
        if (get().schemas.length === 0) {
          set({ loading: true, error: null })
          try {
            const wailsSchemas = await GetAllOperationSchema()
            const schemas = wailsSchemas.map(fromWailsSchema)
            
            // Asignar fechas y favoritos por defecto (esto debería venir del backend en una implementación real)
            const schemasWithDefaults = schemas.map((schema: Schema) => ({
              ...schema,
              favorite: schema.favorite || false,
              lastUsed: schema.lastUsed || new Date().toISOString()
            }))
            
            set({ schemas: schemasWithDefaults })
          } catch (error) {
            set({ error: error as Error })
          } finally {
            set({ loading: false })
          }
        }
      },

      selectSchema: (id: string) => {
        // Verificar si el schema ya está seleccionado para evitar actualizaciones innecesarias
        if (get().selectedSchema?.id === id) {
          return; // Salir para evitar actualizaciones redundantes
        }
        
        const schema = get().schemas.find(s => s.id === id)
        if (schema) {
          // Actualizar lastUsed cuando se selecciona un schema
          const lastUsed = new Date().toISOString();
          const updatedSchema = {
            ...schema,
            lastUsed
          }
          
          // Actualizar en el estado
          set(state => {
            const index = state.schemas.findIndex(s => s.id === id)
            if (index !== -1) {
              // Solo actualizar lastUsed, no todo el schema
              state.schemas[index] = {
                ...state.schemas[index],
                lastUsed
              }
              state.selectedSchema = updatedSchema
            }
          })
        } else {
          set({ selectedSchema: null })
        }
      },

      clearSelection: () => {
        set({ selectedSchema: null })
      },

      // Operaciones CRUD
      createSchema: async (schema: SchemaCreate) => {
        set({ loading: true, error: null })
        try {
          const wailsSchema = await InsertOperationSchema(toWailsSchema(schema))
          const newSchema = fromWailsSchema(wailsSchema)
          
          // Agregar propiedades adicionales
          const schemaWithDefaults = {
            ...newSchema,
            favorite: schema.favorite || false,
            lastUsed: new Date().toISOString()
          }
          
          set(state => {
            state.schemas.push(schemaWithDefaults)
            // Si estamos creando un nuevo schema, automáticamente lo seleccionamos
            state.selectedSchema = schemaWithDefaults
          })

          return schemaWithDefaults
        } catch (error) {
          set({ error: error as Error })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      duplicateSchema: async (id: string) => {
        set({ loading: true, error: null })
        try {
          const originalSchema = get().schemas.find(s => s.id === id)
          if (!originalSchema) {
            throw new Error("Schema no encontrado")
          }
          
          // Crear una copia del schema con un nuevo nombre
          const schemaCopy: SchemaCreate = {
            name: `${originalSchema.name} (copia)`,
            method_type: originalSchema.method_type,
            request_type: originalSchema.request_type,
            timeout: originalSchema.timeout,
            url: originalSchema.url,
            headers: originalSchema.headers,
            body: originalSchema.body,
            query_params: originalSchema.query_params,
            schema: originalSchema.schema,
            favorite: false // La copia comienza sin ser favorita
          }
          
          // Usar la función createSchema para crear el duplicado
          const duplicatedSchema = await get().createSchema(schemaCopy)
          return duplicatedSchema
        } catch (error) {
          set({ error: error as Error })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      updateSchema: async (id: string, schema: SchemaUpdate) => {
        set({ loading: true, error: null })
        try {
          const wailsSchema = await UpdateOperationSchema(toWailsSchema({ id, ...schema }))
          const updatedSchema = fromWailsSchema(wailsSchema)
          
          // Mantener propiedades adicionales
          const existingSchema = get().schemas.find(s => s.id === id)
          const schemaWithDefaults = {
            ...updatedSchema,
            favorite: schema.favorite !== undefined ? schema.favorite : (existingSchema?.favorite || false),
            lastUsed: schema.lastUsed || existingSchema?.lastUsed || new Date().toISOString()
          }
          
          set(state => {
            const index = state.schemas.findIndex(s => s.id === id)
            if (index !== -1) {
              state.schemas[index] = schemaWithDefaults
              
              // Actualizar también el schema seleccionado si es el mismo ID
              if (state.selectedSchema?.id === id) {
                state.selectedSchema = {...schemaWithDefaults}
              }
            }
          })
        } catch (error) {
          set({ error: error as Error })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      deleteSchema: async (id: string) => {
        set({ loading: true, error: null })
        try {
          await DeleteOperationSchema(id)
          set(state => {
            state.schemas = state.schemas.filter(s => s.id !== id)
            if (state.selectedSchema?.id === id) {
              state.selectedSchema = null
            }
          })
        } catch (error) {
          set({ error: error as Error })
          throw error
        } finally {
          set({ loading: false })
        }
      },
      
      toggleFavorite: async (id: string) => {
        const schema = get().schemas.find(s => s.id === id)
        if (!schema) return

        const updatedSchema = {
          ...schema,
          favorite: !schema.favorite
        }
        
        // En una implementación real, aquí se haría una llamada a la API para 
        // actualizar el estado de favorito en el backend
        set(state => {
          const index = state.schemas.findIndex(s => s.id === id)
          if (index !== -1) {
            state.schemas[index] = updatedSchema
            
            if (state.selectedSchema?.id === id) {
              state.selectedSchema = updatedSchema
            }
          }
        })
      },

      // Operaciones especiales
      testOperation: async (data: Schema) => {
        set({ loading: true, error: null })
        try {
          const response = await TestRequest(toWailsSchema(data))
          
          // Actualizar lastUsed cuando se ejecuta una operación
          const schema = get().schemas.find(s => s.id === data.id)
          if (schema) {
            set(state => {
              const index = state.schemas.findIndex(s => s.id === data.id)
              if (index !== -1) {
                state.schemas[index] = {
                  ...state.schemas[index],
                  lastUsed: new Date().toISOString()
                }
              }
            })
          }
          
          return response
        } catch (error) {
          set({ error: error as Error })
          throw error
        } finally {
          set({ loading: false })
        }
      },

      transformJsonSchema: (json: any) => {
        if (typeof json === "number") {
          return json % 1 === 0 ? 99 : 99.99
        }
        if (typeof json === "string") {
          return "default"
        }
        if (typeof json === "boolean") {
          return false
        }
        if (Array.isArray(json)) {
          return [get().transformJsonSchema(json[0])]
        }
        if (typeof json === "object" && json !== null) {
          return Object.keys(json).reduce((acc, key) => {
            acc[key] = get().transformJsonSchema(json[key])
            return acc
          }, {} as Record<string, any>)
        }
        return json
      },

      importFromCurl: async (curl: string) => {
        // TODO: Implementar importación desde CURL
        throw new Error("Not implemented")
      }
    })),
    {
      name: 'schema-storage', // nombre único para la clave en localStorage
      partialize: (state) => ({ 
        schemas: state.schemas, 
        selectedSchema: state.selectedSchema,
        sortField: state.sortField,
        sortOrder: state.sortOrder,
        filter: state.filter
      }), // Solo persistir estos campos
    }
  )
) 