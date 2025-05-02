import { Schema, SchemaCreate, SchemaUpdate } from '@/types/schema'
import { operation } from '../../../wailsjs/go/models'

export const toWailsSchema = (schema: SchemaCreate | (SchemaUpdate & { id: string })): operation.Operation => {
  return operation.Operation.createFrom({
    id: 'id' in schema ? schema.id : undefined,
    name: schema.name,
    url: schema.url,
    method_type: schema.method_type,
    request_type: schema.request_type,
    timeout: schema.timeout,
    query_params: schema.query_params,
    headers: schema.headers,
    body: schema.body,
    response: schema.response,
    schema: schema.schema,
    templates_id: schema.templates_id,
  })
}

export const fromWailsSchema = (schema: operation.Operation): Schema => {
  return {
    id: schema.id || '',
    name: schema.name || '',
    method_type: schema.method_type || '',
    request_type: schema.request_type || '',
    timeout: schema.timeout || 0,
    url: schema.url || '',
    headers: schema.headers,
    body: schema.body,
    query_params: schema.query_params,
    schema: schema.schema,
    response: schema.response,
    templates_id: schema.templates_id,
  }
} 