package operationparameter

import "encoding/json"

type OperationParameter struct {
	ID          *string                 `json:"id"`
	SchemaID    *string                 `json:"schema_id"`
	Name        *string                 `json:"name"`
	Params      *[]Parameters           `json:"params"`
	Url         *string                 `json:"url"`
	MethodType  *string                 `json:"method_type"`
	RequestType *string                 `json:"request_type"`
	Timeout     *int                    `json:"timeout"`
	QueryParams *map[string]interface{} `json:"query_params"`
	Headers     *map[string]interface{} `json:"headers"`
	Body        *json.RawMessage        `json:"body"` // TODO: ver tipo de datos
}

type Parameters struct {
	Name string `json:"name"`
	Type string `json:"type"`
}
