package handlers

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	httpclient "github.com/api-relationship-core/backend/internal/domain/models/http_client"
	"github.com/api-relationship-core/backend/internal/domain/models/operation"
	operationparameter "github.com/api-relationship-core/backend/internal/domain/models/operation_parameter"
	"github.com/api-relationship-core/backend/internal/domain/ports"
)

type OperationSchemaHandler struct {
	persistenceService ports.PersistenceService
	httpClientService  ports.HttpClient

	Context *context.Context
}

func NewOperationSchemaHandler(persistenceService ports.PersistenceService, httpClientService ports.HttpClient) *OperationSchemaHandler {
	return &OperationSchemaHandler{
		persistenceService: persistenceService,
		httpClientService:  httpClientService,
	}
}

func (h *OperationSchemaHandler) GetAllOperationSchema() (*[]operation.Operation, error) {
	result, err := h.persistenceService.GetAllOperations()
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *OperationSchemaHandler) GetOperationSchema(id string) (*operation.Operation, error) {
	result, err := h.persistenceService.GetOperation(id)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *OperationSchemaHandler) UpdateOperationSchema(operation operation.Operation) error {
	err := h.persistenceService.UpdateOperation(*operation.ID, operation)
	return err
}

func (h *OperationSchemaHandler) InsertOperationSchema(operation operation.Operation) (*operation.Operation, error) {
	result, err := h.persistenceService.InsertOperation(operation)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *OperationSchemaHandler) GetAllSchemasWithTemplates() (*[]operation.SchemaTemplate, error) {
	var result []operation.SchemaTemplate

	operations, err := h.persistenceService.GetAllOperations()
	if err != nil {
		return nil, err
	}

	for _, operationSchemas := range operations {
		schemaTemplate := operation.SchemaTemplate{
			Operation: operationSchemas,
		}

		listTemplates := make([]operationparameter.OperationParameter, 0)
		if operationSchemas.Templates != nil {
			for _, templateId := range *operationSchemas.Templates {
				templateOperation, errTemplate := h.persistenceService.GetOperationSchema(templateId)
				if errTemplate != nil {
					continue
					//return nil, errTemplate
				}

				listTemplates = append(listTemplates, templateOperation)
			}
		}

		schemaTemplate.ListTemplates = &listTemplates
		result = append(result, schemaTemplate)
	}

	return &result, nil
}

func (h *OperationSchemaHandler) TestRequest(operation operation.Operation) (*json.RawMessage, error) {
	if operation.Timeout == nil || operation.Url == nil || operation.MethodType == nil {
		return nil, fmt.Errorf("Error: Required fields are missing")
	}

	timeoutValue := operation.Timeout
	if *timeoutValue == 0 {
		*timeoutValue = 30 //Default value
	}

	timeout := time.Duration(*timeoutValue) * time.Second

	response, err := h.httpClientService.TestApiCall(httpclient.ClientHttpRequest{
		Transport: httpclient.Transport{
			Url:        *operation.Url,
			Method:     *operation.MethodType,
			Timeout:    &timeout,
			Headers:    operation.Headers,
			QueryParam: operation.QueryParams,
		},
		Body: operation.Body,
	})

	if err != nil {
		return nil, err
	}

	var result json.RawMessage
	err = json.Unmarshal(response.Body, &result)
	if err != nil {
		return nil, err
	}

	return &result, err
}

func (h *OperationSchemaHandler) DeleteOperationSchema(id string) error {
	err := h.persistenceService.DeleteOperation(id)
	return err
}
