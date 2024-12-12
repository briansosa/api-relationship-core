package operation

import (
	"encoding/json"
	"time"

	operationparameter "github.com/api-relationship-core/backend/internal/domain/models/operation_parameter"
)

type Operation struct {
	ID          *string                 `json:"id"`
	Name        *string                 `json:"name"`
	Url         *string                 `json:"url"`
	MethodType  *string                 `json:"method_type"`
	RequestType *string                 `json:"request_type"`
	Timeout     *int                    `json:"timeout"`
	QueryParams *map[string]interface{} `json:"query_params,"`
	Headers     *map[string]interface{} `json:"headers,omitempty"`
	Body        *json.RawMessage        `json:"body"`               // TODO: ver tipo de datos
	Response    *json.RawMessage        `json:"response,omitempty"` // TODO: ver tipo de datos
	Schema      *json.RawMessage        `json:"schema,omitempty"`   // TODO: ver tipo de datos
	Templates   *[]string               `json:"templates_id,omitempty"`
}

type OperationProcess struct {
	Url         string                 `json:"url"`
	MethodType  string                 `json:"method_type"`
	RequestType string                 `json:"request_type"`
	Timeout     time.Duration          `json:"timeout"`
	QueryParams map[string]interface{} `json:"query_params"`
	Headers     map[string]interface{} `json:"headers"`
	Body        json.RawMessage        `json:"body"` // TODO: ver tipo de datos
}

type SchemaTemplate struct {
	Operation
	ListTemplates *[]operationparameter.OperationParameter `json:"list_templates"`
}

func NewOperationProcess(operation operationparameter.OperationParameter) OperationProcess {
	return OperationProcess{
		Url:         *operation.Url,
		MethodType:  *operation.MethodType,
		RequestType: *operation.RequestType,
		Timeout:     time.Duration(*operation.Timeout) * time.Second,
		QueryParams: make(map[string]interface{}),
		Headers:     make(map[string]interface{}),
	}
}
