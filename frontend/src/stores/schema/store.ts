import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Schema, SchemaCreate, SchemaStore, SchemaUpdate } from '@/types/schema'
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
  immer((set, get) => ({
    // Estado
    schemas: [],
    selectedSchema: null,
    loading: false,
    error: null,

    // Acciones básicas
    fetchSchemas: async () => {
      set({ loading: true, error: null })
      try {
        const wailsSchemas = await GetAllOperationSchema()
        const schemas = wailsSchemas.map(fromWailsSchema)
        set({ schemas })
      } catch (error) {
        set({ error: error as Error })
      } finally {
        set({ loading: false })
      }
    },

    selectSchema: (id: string) => {
      const schema = get().schemas.find(s => s.id === id)
      set({ selectedSchema: schema || null })
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
        set(state => {
          state.schemas.push(newSchema)
        })
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
        set(state => {
          const index = state.schemas.findIndex(s => s.id === id)
          if (index !== -1) {
            state.schemas[index] = updatedSchema
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

    // Operaciones especiales
    testOperation: async (data: Schema) => {
      set({ loading: true, error: null })
      try {
        const response = await TestRequest(toWailsSchema(data))
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
  }))
) 