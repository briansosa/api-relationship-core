package handlers

import (
	"encoding/json"
	"net/http/httptest"
	"time"

	httpclient "github.com/api-relationship-core/backend/internal/domain/models/http_client"
	"github.com/api-relationship-core/backend/internal/domain/models/operation"
	"github.com/api-relationship-core/backend/internal/domain/ports"

	"github.com/gin-gonic/gin"
)

type OperationSchemaHandler struct {
	persistenceService ports.PersistenceService
	httpClientService  ports.HttpClient
	Context            *gin.Context
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

func (h *OperationSchemaHandler) TestRequest(operation operation.Operation) (*map[string]interface{}, error) {
	context, _ := gin.CreateTestContext(httptest.NewRecorder())
	timeoutValue := operation.Timeout
	if *timeoutValue == 0 {
		*timeoutValue = 30 //Default value
	}

	timeout := time.Duration(*timeoutValue) * time.Second

	response, err := h.httpClientService.TestApiCall(context, httpclient.ClientHttpRequest{
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

	var result map[string]interface{}
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
