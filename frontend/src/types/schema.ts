export interface Schema {
  id: string
  name: string
  method_type: string
  request_type: string
  timeout: number
  url: string
  headers?: Record<string, string>
  body?: any
  query_params?: Record<string, string>
  schema?: any
  response?: any
  templates_id?: string[]
  favorite?: boolean
  lastUsed?: string
}

export type SchemaCreate = Omit<Schema, 'id'>

export type SchemaUpdate = Partial<Schema>

export type SortField = 'name' | 'method_type' | 'lastUsed'
export type SortOrder = 'asc' | 'desc'
export type SchemaFilter = {
  searchQuery?: string
  methodType?: string[]
  favorite?: boolean
}

export interface SchemaStore {
  // Estado
  schemas: Schema[]
  selectedSchema: Schema | null
  loading: boolean
  error: Error | null
  filter: SchemaFilter
  sortField: SortField
  sortOrder: SortOrder
  
  // Filtrado y ordenamiento
  setFilter: (filter: Partial<SchemaFilter>) => void
  clearFilter: () => void
  setSorting: (field: SortField, order: SortOrder) => void
  getFilteredSchemas: () => Schema[]

  // Acciones básicas
  fetchSchemas: () => Promise<void>
  selectSchema: (id: string) => void
  clearSelection: () => void

  // Operaciones CRUD
  createSchema: (schema: SchemaCreate) => Promise<void>
  updateSchema: (id: string, schema: SchemaUpdate) => Promise<void>
  deleteSchema: (id: string) => Promise<void>
  toggleFavorite: (id: string) => Promise<void>

  // Operaciones especiales
  testOperation: (data: Schema) => Promise<any>
  transformJsonSchema: (json: any) => any
  importFromCurl: (curl: string) => Promise<void>
} 