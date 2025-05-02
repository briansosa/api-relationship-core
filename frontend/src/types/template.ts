export interface Parameter {
  name: string
  type: string
  value?: any
  required?: boolean
  description?: string
}

export interface Template {
  id: string
  name: string
  schema_id: string
  method_type: string
  request_type: string
  timeout: number
  url: string
  headers?: Record<string, string>
  body?: any
  query_params?: Record<string, string>
  params: Parameter[]
}

export type TemplateCreate = Omit<Template, 'id'>

export type TemplateUpdate = Partial<Template>

export interface TemplateStore {
  // Estado
  templates: Template[]
  selectedTemplate: Template | null
  loading: boolean
  error: Error | null

  // Acciones básicas
  fetchTemplates: (schemaId: string) => Promise<void>
  selectTemplate: (id: string) => void
  clearSelection: () => void

  // Operaciones CRUD
  createTemplate: (template: TemplateCreate) => Promise<void>
  updateTemplate: (id: string, template: TemplateUpdate) => Promise<void>
  deleteTemplate: (id: string) => Promise<void>

  // Operaciones especiales
  syncWithSchema: (schemaId: string) => Promise<void>
  validateParameters: (params: Parameter[]) => boolean
} 