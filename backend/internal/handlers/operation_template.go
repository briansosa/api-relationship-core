package handlers

import (
	"context"

	operationparameter "github.com/api-relationship-core/backend/internal/domain/models/operation_parameter"
	"github.com/api-relationship-core/backend/internal/domain/ports"
)

type OperationTemplateHandler struct {
	persistenceService ports.PersistenceService
	httpClientService  ports.HttpClient
	Context            *context.Context
}

func NewOperationTemplateHandler(persistenceService ports.PersistenceService, httpClientService ports.HttpClient) *OperationTemplateHandler {
	return &OperationTemplateHandler{
		persistenceService: persistenceService,
		httpClientService:  httpClientService,
	}
}

func (h *OperationTemplateHandler) GetAllOperationTemplates() (*[]operationparameter.OperationParameter, error) {
	result, err := h.persistenceService.GetAllOperationSchema()
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *OperationTemplateHandler) GetAllKeysOperationTemplates(keys []string) (*[]operationparameter.OperationParameter, error) {
	result, err := h.persistenceService.GetAllKeysOperationSchema(h.Context, keys)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *OperationTemplateHandler) GetOperationTemplate(id string) (*operationparameter.OperationParameter, error) {
	result, err := h.persistenceService.GetOperationSchema(id)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *OperationTemplateHandler) UpdateOperationTemplate(template operationparameter.OperationParameter) error {
	err := h.persistenceService.UpdateOperationSchema(*template.ID, template)
	return err
}

func (h *OperationTemplateHandler) InsertOperationTemplate(template operationparameter.OperationParameter) (*operationparameter.OperationParameter, error) {
	result, err := h.persistenceService.InsertOperationSchema(template)
	if err != nil {
		return nil, err
	}

	operation, err := h.persistenceService.GetOperation(*template.SchemaID)
	if err != nil {
		return nil, err
	}

	*operation.Templates = append(*operation.Templates, *result.ID)

	err = h.persistenceService.UpdateOperation(*operation.ID, operation)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *OperationTemplateHandler) DeleteOperationTemplate(id string) error {
	err := h.persistenceService.DeleteOperationSchema(id)
	return err
}
