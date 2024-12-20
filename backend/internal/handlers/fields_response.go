package handlers

import (
	"context"

	flowfieldsresponse "github.com/api-relationship-core/backend/internal/domain/models/flow_fields_response"
	"github.com/api-relationship-core/backend/internal/domain/ports"
)

type FieldsResponseHandler struct {
	persistenceService ports.PersistenceService
	httpClientService  ports.HttpClient
	Context            *context.Context
}

func NewFieldsResponseHandler(persistenceService ports.PersistenceService, httpClientService ports.HttpClient) *FieldsResponseHandler {
	return &FieldsResponseHandler{
		persistenceService: persistenceService,
		httpClientService:  httpClientService,
	}
}

func (h *FieldsResponseHandler) GetAllFieldsResponses() (*[]flowfieldsresponse.FlowFieldsResponse, error) {
	result, err := h.persistenceService.GetAllFieldsResponse()
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h FieldsResponseHandler) GetFieldsResponse(id string) (*flowfieldsresponse.FlowFieldsResponse, error) {
	result, err := h.persistenceService.GetFieldsResponse(id)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h FieldsResponseHandler) GetFieldsResponseByFlowID(flowID string) (*[]flowfieldsresponse.FlowFieldsResponse, error) {
	flow, err := h.persistenceService.GetFlow(flowID)
	if err != nil {
		return nil, err
	}

	result := make([]flowfieldsresponse.FlowFieldsResponse, 0)
	for _, fieldsResponseID := range flow.FieldsResponseID {
		fieldsResponse, err := h.persistenceService.GetFieldsResponse(fieldsResponseID)
		if err != nil {
			return nil, err
		}
		result = append(result, fieldsResponse)
	}

	return &result, nil
}

func (h FieldsResponseHandler) UpdateFieldsResponse(fieldResponse flowfieldsresponse.FlowFieldsResponse) error {
	err := h.persistenceService.UpdateFieldsResponse(fieldResponse.ID, fieldResponse)
	return err
}

func (h FieldsResponseHandler) InsertFieldsResponse(fieldResponse flowfieldsresponse.FlowFieldsResponse) (*flowfieldsresponse.FlowFieldsResponse, error) {
	result, err := h.persistenceService.InsertFieldsResponse(fieldResponse)
	if err != nil {
		return nil, err
	}

	flow, err := h.persistenceService.GetFlow(fieldResponse.FlowID)
	if err != nil {
		return nil, err
	}

	flow.FieldsResponseID = append(flow.FieldsResponseID, result.ID)

	err = h.persistenceService.UpdateFlow(flow.ID, flow)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (h FieldsResponseHandler) DeleteFieldsResponse(id string) error {
	fieldsResponse, err := h.persistenceService.GetFieldsResponse(id)
	if err != nil {
		return err
	}

	flow, err := h.persistenceService.GetFlow(fieldsResponse.FlowID)
	if err != nil {
		return err
	}

	for index, fieldsResponseID := range flow.FieldsResponseID {
		if fieldsResponseID == id {
			if index+1 < len(flow.FieldsResponseID) {
				flow.FieldsResponseID = append(flow.FieldsResponseID[:index], flow.FieldsResponseID[index+1:]...)
				break
			}

			flow.FieldsResponseID = flow.FieldsResponseID[:index]
			break
		}
	}

	err = h.persistenceService.UpdateFlow(flow.ID, flow)
	if err != nil {
		return err
	}

	err = h.persistenceService.DeleteFieldsResponse(id)
	return err
}
