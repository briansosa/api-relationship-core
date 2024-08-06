package persistence

import (
	"context"
	"encoding/json"

	"github.com/api-relationship-core/backend/internal/domain/models/flow"
	"github.com/api-relationship-core/backend/internal/domain/models/operation"
	"github.com/api-relationship-core/backend/internal/domain/models/process"
	"github.com/api-relationship-core/backend/internal/domain/ports"

	flowfieldsresponse "github.com/api-relationship-core/backend/internal/domain/models/flow_fields_response"
	operationparameter "github.com/api-relationship-core/backend/internal/domain/models/operation_parameter"
)

type PersistenceService struct {
	operationRepository       ports.DBRepository
	flowRepository            ports.DBRepository
	processRepository         ports.DBRepository
	fieldResponseRepository   ports.DBRepository
	operationSchemaRepository ports.DBRepository
}

func NewPersistenceService(operationRepository ports.DBRepository, flowRepository ports.DBRepository, processRepository ports.DBRepository, fieldResponseRepository ports.DBRepository, operationSchemaRepository ports.DBRepository) *PersistenceService {
	return &PersistenceService{
		operationRepository:       operationRepository,
		flowRepository:            flowRepository,
		processRepository:         processRepository,
		fieldResponseRepository:   fieldResponseRepository,
		operationSchemaRepository: operationSchemaRepository,
	}
}

//
// Operation entity
//

func (p *PersistenceService) InsertOperation(value operation.Operation) (operation.Operation, error) {
	id, err := p.operationRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = &id
	valueBytes, _ := json.Marshal(value)
	err = p.operationRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService) UpdateOperation(key string, value operation.Operation) error {
	valueBytes, _ := json.Marshal(value)
	return p.operationRepository.Update(key, valueBytes)
}

func (p *PersistenceService) GetOperation(key string) (operation.Operation, error) {
	result, err := p.operationRepository.GetBy(key)
	if err != nil {
		return operation.Operation{}, err
	}

	var resultValue operation.Operation
	err = json.Unmarshal(result.Value, &resultValue)
	if err != nil {
		return operation.Operation{}, err
	}

	return resultValue, nil
}

func (p *PersistenceService) DeleteOperation(key string) error {
	return p.operationRepository.Delete(key)
}

func (p *PersistenceService) GetAllOperations() ([]operation.Operation, error) {
	results, err := p.operationRepository.GetAll()
	if err != nil {
		return nil, err
	}

	var resultValues []operation.Operation
	for _, value := range results {
		var resultValue operation.Operation
		err = json.Unmarshal(value.Value, &resultValue)
		if err != nil {
			return nil, err
		}

		resultValues = append(resultValues, resultValue)
	}

	return resultValues, nil
}

//
// Flow entity
//

func (p *PersistenceService) InsertFlow(value flow.Flow) (flow.Flow, error) {
	id, err := p.flowRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = id
	valueBytes, _ := json.Marshal(value)
	err = p.flowRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService) UpdateFlow(key string, value flow.Flow) error {
	valueBytes, _ := json.Marshal(value)
	return p.flowRepository.Update(key, valueBytes)
}

func (p *PersistenceService) GetFlow(key string) (flow.Flow, error) {
	result, err := p.flowRepository.GetBy(key)
	if err != nil {
		return flow.Flow{}, err
	}

	var resultValue flow.Flow
	err = json.Unmarshal(result.Value, &resultValue)
	if err != nil {
		return flow.Flow{}, err
	}

	return resultValue, nil
}

func (p *PersistenceService) DeleteFlow(key string) error {
	return p.flowRepository.Delete(key)
}

func (p *PersistenceService) GetAllFlows() ([]flow.Flow, error) {
	results, err := p.flowRepository.GetAll()
	if err != nil {
		return nil, err
	}

	var resultValues []flow.Flow
	for _, value := range results {
		var resultValue flow.Flow
		err = json.Unmarshal(value.Value, &resultValue)
		if err != nil {
			return nil, err
		}

		resultValues = append(resultValues, resultValue)
	}

	return resultValues, nil
}

//
// Process entity
//

func (p *PersistenceService) InsertProcess(value process.Process) (process.Process, error) {
	id, err := p.processRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = id
	valueBytes, _ := json.Marshal(value)
	err = p.processRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService) UpdateProcess(key string, value process.Process) error {
	valueBytes, _ := json.Marshal(value)
	return p.processRepository.Update(key, valueBytes)
}

func (p *PersistenceService) GetProcess(key string) (process.Process, error) {
	result, err := p.processRepository.GetBy(key)
	if err != nil {
		return process.Process{}, err
	}

	var resultValue process.Process
	err = json.Unmarshal(result.Value, &resultValue)
	if err != nil {
		return process.Process{}, err
	}

	return resultValue, nil
}

func (p *PersistenceService) DeleteProcess(key string) error {
	return p.processRepository.Delete(key)
}

func (p *PersistenceService) GetAllProcess() ([]process.Process, error) {
	results, err := p.processRepository.GetAll()
	if err != nil {
		return nil, err
	}

	var resultValues []process.Process
	for _, value := range results {
		var resultValue process.Process
		err = json.Unmarshal(value.Value, &resultValue)
		if err != nil {
			return nil, err
		}

		resultValues = append(resultValues, resultValue)
	}

	return resultValues, nil
}

//
// Fields Response entity
//

func (p *PersistenceService) InsertFieldsResponse(value flowfieldsresponse.FlowFieldsResponse) (flowfieldsresponse.FlowFieldsResponse, error) {
	id, err := p.fieldResponseRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = id
	valueBytes, _ := json.Marshal(value)
	err = p.fieldResponseRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService) UpdateFieldsResponse(key string, value flowfieldsresponse.FlowFieldsResponse) error {
	valueBytes, _ := json.Marshal(value)
	return p.fieldResponseRepository.Update(key, valueBytes)
}

func (p *PersistenceService) GetFieldsResponse(key string) (flowfieldsresponse.FlowFieldsResponse, error) {
	result, err := p.fieldResponseRepository.GetBy(key)
	if err != nil {
		return flowfieldsresponse.FlowFieldsResponse{}, err
	}

	var resultValue flowfieldsresponse.FlowFieldsResponse
	err = json.Unmarshal(result.Value, &resultValue)
	if err != nil {
		return flowfieldsresponse.FlowFieldsResponse{}, err
	}

	return resultValue, nil
}

func (p *PersistenceService) DeleteFieldsResponse(key string) error {
	return p.fieldResponseRepository.Delete(key)
}

func (p *PersistenceService) GetAllFieldsResponse() ([]flowfieldsresponse.FlowFieldsResponse, error) {
	results, err := p.fieldResponseRepository.GetAll()
	if err != nil {
		return nil, err
	}

	var resultValues []flowfieldsresponse.FlowFieldsResponse
	for _, value := range results {
		var resultValue flowfieldsresponse.FlowFieldsResponse
		err = json.Unmarshal(value.Value, &resultValue)
		if err != nil {
			return nil, err
		}

		resultValues = append(resultValues, resultValue)
	}

	return resultValues, nil
}

//
// Operation Schema entity
//

func (p *PersistenceService) InsertOperationSchema(value operationparameter.OperationParameter) (operationparameter.OperationParameter, error) {
	id, err := p.operationSchemaRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = &id
	valueBytes, _ := json.Marshal(value)
	err = p.operationSchemaRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService) UpdateOperationSchema(key string, value operationparameter.OperationParameter) error {
	valueBytes, _ := json.Marshal(value)
	return p.operationSchemaRepository.Update(key, valueBytes)
}

func (p *PersistenceService) GetOperationSchema(key string) (operationparameter.OperationParameter, error) {
	result, err := p.operationSchemaRepository.GetBy(key)
	if err != nil {
		return operationparameter.OperationParameter{}, err
	}

	var resultValue operationparameter.OperationParameter
	err = json.Unmarshal(result.Value, &resultValue)
	if err != nil {
		return operationparameter.OperationParameter{}, err
	}

	return resultValue, nil
}

func (p *PersistenceService) DeleteOperationSchema(key string) error {
	return p.operationSchemaRepository.Delete(key)
}

func (p *PersistenceService) GetAllKeysOperationSchema(context *context.Context, keys []string) ([]operationparameter.OperationParameter, error) {
	results, err := p.operationSchemaRepository.GetAllKeys(keys)
	if err != nil {
		return nil, err
	}

	var resultValues []operationparameter.OperationParameter
	for _, value := range results {
		var resultValue operationparameter.OperationParameter
		err = json.Unmarshal(value.Value, &resultValue)
		if err != nil {
			return nil, err
		}

		resultValues = append(resultValues, resultValue)
	}

	return resultValues, nil
}

func (p *PersistenceService) GetAllOperationSchema() ([]operationparameter.OperationParameter, error) {
	results, err := p.operationSchemaRepository.GetAll()
	if err != nil {
		return nil, err
	}

	var resultValues []operationparameter.OperationParameter
	for _, value := range results {
		var resultValue operationparameter.OperationParameter
		err = json.Unmarshal(value.Value, &resultValue)
		if err != nil {
			return nil, err
		}

		resultValues = append(resultValues, resultValue)
	}

	return resultValues, nil
}
