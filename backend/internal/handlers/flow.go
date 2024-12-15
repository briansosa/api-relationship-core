package handlers

import (
	"context"

	flow_model "github.com/api-relationship-core/backend/internal/domain/models/flow"
	"github.com/api-relationship-core/backend/internal/domain/ports"
)

type FlowHandler struct {
	persistenceService ports.PersistenceService
	httpClientService  ports.HttpClient
	Context            *context.Context
}

func NewFlowHandler(persistenceService ports.PersistenceService, httpClientService ports.HttpClient) *FlowHandler {
	return &FlowHandler{
		persistenceService: persistenceService,
		httpClientService:  httpClientService,
	}
}

func (h *FlowHandler) GetAllFlows() (*[]flow_model.Flow, error) {
	result, err := h.persistenceService.GetAllFlows()
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *FlowHandler) GetFlow(id string) (*flow_model.Flow, error) {
	result, err := h.persistenceService.GetFlow(id)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *FlowHandler) UpdateFlow(flow flow_model.Flow) error {
	err := h.persistenceService.UpdateFlow(flow.ID, flow)
	return err
}

func (h *FlowHandler) InsertFlow(flow flow_model.Flow) (*flow_model.Flow, error) {
	result, err := h.persistenceService.InsertFlow(flow)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h *FlowHandler) DeleteFlow(id string) error {
	err := h.persistenceService.DeleteFlow(id)
	return err
}
