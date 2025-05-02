import { Template, TemplateCreate, TemplateUpdate } from '@/types/template'
import { operationparameter } from '../../../wailsjs/go/models'

export const toWailsTemplate = (template: TemplateCreate | (TemplateUpdate & { id: string })): operationparameter.OperationParameter => {
  return operationparameter.OperationParameter.createFrom({
    id: 'id' in template ? template.id : undefined,
    schema_id: template.schema_id,
    name: template.name,
    params: template.params?.map(p => operationparameter.Parameters.createFrom(p)),
    url: template.url,
    method_type: template.method_type,
    request_type: template.request_type,
    query_params: template.query_params,
    headers: template.headers,
    body: template.body,
  })
}

export const fromWailsTemplate = (template: operationparameter.OperationParameter): Template => {
  return {
    id: template.id || '',
    name: template.name || '',
    schema_id: template.schema_id || '',
    method_type: template.method_type || '',
    request_type: template.request_type || '',
    timeout: template.timeout || 0,
    url: template.url || '',
    headers: template.headers,
    body: template.body,
    query_params: template.query_params,
    params: template.params?.map(p => ({
      name: p.name,
      type: p.type,
    })) || [],
  }
} 