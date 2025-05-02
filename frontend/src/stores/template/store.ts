import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Template, TemplateCreate, TemplateStore, TemplateUpdate, Parameter } from '@/types/template'
import {
  GetOperationTemplate,
  GetAllKeysOperationTemplates,
  InsertOperationTemplate,
  UpdateOperationTemplate,
  DeleteOperationTemplate
} from '../../../wailsjs/go/handlers/OperationTemplateHandler'
import { fromWailsTemplate, toWailsTemplate } from '@/lib/adapters/template'

export const useTemplateStore = create<TemplateStore>()(
  immer((set, get) => ({
    // Estado
    templates: [],
    selectedTemplate: null,
    loading: false,
    error: null,

    // Acciones básicas
    fetchTemplates: async (schemaId: string) => {
      set({ loading: true, error: null })
      try {
        const wailsTemplates = await GetAllKeysOperationTemplates([schemaId])
        const templates = (wailsTemplates || []).map(fromWailsTemplate)
        set({ templates })
      } catch (error) {
        set({ error: error as Error })
      } finally {
        set({ loading: false })
      }
    },

    selectTemplate: (id: string) => {
      const template = get().templates.find(t => t.id === id)
      set({ selectedTemplate: template || null })
    },

    clearSelection: () => {
      set({ selectedTemplate: null })
    },

    // Operaciones CRUD
    createTemplate: async (template: TemplateCreate) => {
      set({ loading: true, error: null })
      try {
        const wailsTemplate = await InsertOperationTemplate(toWailsTemplate(template))
        const newTemplate = fromWailsTemplate(wailsTemplate)
        set(state => {
          state.templates.push(newTemplate)
        })
      } catch (error) {
        set({ error: error as Error })
        throw error
      } finally {
        set({ loading: false })
      }
    },

    updateTemplate: async (id: string, template: TemplateUpdate) => {
      set({ loading: true, error: null })
      try {
        const wailsTemplate = await UpdateOperationTemplate(toWailsTemplate({ id, ...template }))
        const updatedTemplate = fromWailsTemplate(wailsTemplate)
        set(state => {
          const index = state.templates.findIndex(t => t.id === id)
          if (index !== -1) {
            state.templates[index] = updatedTemplate
          }
        })
      } catch (error) {
        set({ error: error as Error })
        throw error
      } finally {
        set({ loading: false })
      }
    },

    deleteTemplate: async (id: string) => {
      set({ loading: true, error: null })
      try {
        await DeleteOperationTemplate(id)
        set(state => {
          state.templates = state.templates.filter(t => t.id !== id)
          if (state.selectedTemplate?.id === id) {
            state.selectedTemplate = null
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
    syncWithSchema: async (schemaId: string) => {
      // TODO: Implementar sincronización con schema
      throw new Error("Not implemented")
    },

    validateParameters: (params: Parameter[]) => {
      return params.every(param => {
        if (param.required && (param.value === undefined || param.value === null)) {
          return false
        }
        return true
      })
    }
  }))
) 