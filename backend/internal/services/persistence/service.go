package persistence

import (
	"encoding/json"

	"github.com/api-relationship-core/backend/internal/domain/models/flow"
	flowfieldsresponse "github.com/api-relationship-core/backend/internal/domain/models/flow_fields_response"
	"github.com/api-relationship-core/backend/internal/domain/models/operation"
	operationparameter "github.com/api-relationship-core/backend/internal/domain/models/operation_parameter"
	"github.com/api-relationship-core/backend/internal/domain/models/persistence"
	"github.com/api-relationship-core/backend/internal/domain/models/process"
	"github.com/api-relationship-core/backend/internal/domain/ports"
	"github.com/api-relationship-core/backend/pkg/jsons"

	"github.com/gin-gonic/gin"
)

type PersistenceService[T any] struct {
	schema         string
	fileRepository ports.FileRepository
}

func NewPersistenceService[T any](schema string, fileRepository ports.FileRepository) *PersistenceService[T] {
	return &PersistenceService[T]{
		schema:         schema,
		fileRepository: fileRepository,
	}
}

func (service *PersistenceService[T]) Get(context *gin.Context, id string) (persistence.Item[T], error) {
	object, err := service.fileRepository.Get(context, id, service.schema)
	if err != nil {
		return persistence.Item[T]{}, err
	}

	jsonObj, err := jsons.ParseJson[T](object)
	if err != nil {
		return persistence.Item[T]{}, err
	}

	item := persistence.NewItem[T](*jsonObj)

	return item, nil
}

type PersistenceService2 struct {
	operationRepository       ports.DBRepository
	flowRepository            ports.DBRepository
	processRepository         ports.DBRepository
	fieldResponseRepository   ports.DBRepository
	operationSchemaRepository ports.DBRepository
}

func NewPersistenceService2(operationRepository ports.DBRepository, flowRepository ports.DBRepository, processRepository ports.DBRepository, fieldResponseRepository ports.DBRepository, operationSchemaRepository ports.DBRepository) *PersistenceService2 {
	return &PersistenceService2{
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

func (p *PersistenceService2) InsertOperation(value operation.Operation) (operation.Operation, error) {
	id, err := p.operationRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = &id
	valueBytes, _ := json.Marshal(value)
	err = p.operationRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService2) UpdateOperation(key string, value operation.Operation) error {
	valueBytes, _ := json.Marshal(value)
	return p.operationRepository.Update(key, valueBytes)
}

func (p *PersistenceService2) GetOperation(key string) (operation.Operation, error) {
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

func (p *PersistenceService2) DeleteOperation(key string) error {
	return p.operationRepository.Delete(key)
}

func (p *PersistenceService2) GetAllOperations() ([]operation.Operation, error) {
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

func (p *PersistenceService2) InsertFlow(value flow.Flow) (flow.Flow, error) {
	id, err := p.flowRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = id
	valueBytes, _ := json.Marshal(value)
	err = p.flowRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService2) UpdateFlow(key string, value flow.Flow) error {
	valueBytes, _ := json.Marshal(value)
	return p.flowRepository.Update(key, valueBytes)
}

func (p *PersistenceService2) GetFlow(key string) (flow.Flow, error) {
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

func (p *PersistenceService2) DeleteFlow(key string) error {
	return p.flowRepository.Delete(key)
}

func (p *PersistenceService2) GetAllFlows() ([]flow.Flow, error) {
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

func (p *PersistenceService2) InsertProcess(value process.Process) (process.Process, error) {
	id, err := p.processRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = id
	valueBytes, _ := json.Marshal(value)
	err = p.processRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService2) UpdateProcess(key string, value process.Process) error {
	valueBytes, _ := json.Marshal(value)
	return p.processRepository.Update(key, valueBytes)
}

func (p *PersistenceService2) GetProcess(key string) (process.Process, error) {
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

func (p *PersistenceService2) DeleteProcess(key string) error {
	return p.processRepository.Delete(key)
}

func (p *PersistenceService2) GetAllProcess() ([]process.Process, error) {
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

func (p *PersistenceService2) InsertFieldsResponse(value flowfieldsresponse.FlowFieldsResponse) (flowfieldsresponse.FlowFieldsResponse, error) {
	id, err := p.fieldResponseRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = id
	valueBytes, _ := json.Marshal(value)
	err = p.fieldResponseRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService2) UpdateFieldsResponse(key string, value flowfieldsresponse.FlowFieldsResponse) error {
	valueBytes, _ := json.Marshal(value)
	return p.fieldResponseRepository.Update(key, valueBytes)
}

func (p *PersistenceService2) GetFieldsResponse(key string) (flowfieldsresponse.FlowFieldsResponse, error) {
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

func (p *PersistenceService2) DeleteFieldsResponse(key string) error {
	return p.fieldResponseRepository.Delete(key)
}

func (p *PersistenceService2) GetAllFieldsResponse() ([]flowfieldsresponse.FlowFieldsResponse, error) {
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

func (p *PersistenceService2) InsertOperationSchema(value operationparameter.OperationParameter) (operationparameter.OperationParameter, error) {
	id, err := p.operationSchemaRepository.NextSequence()
	if err != nil {
		return value, err
	}

	value.ID = id
	valueBytes, _ := json.Marshal(value)
	err = p.operationSchemaRepository.Update(id, valueBytes)
	return value, err
}

func (p *PersistenceService2) UpdateOperationSchema(key string, value operationparameter.OperationParameter) error {
	valueBytes, _ := json.Marshal(value)
	return p.operationSchemaRepository.Update(key, valueBytes)
}

func (p *PersistenceService2) GetOperationSchema(key string) (operationparameter.OperationParameter, error) {
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

func (p *PersistenceService2) DeleteOperationSchema(key string) error {
	return p.operationSchemaRepository.Delete(key)
}

func (p *PersistenceService2) GetAllOperationSchema() ([]operationparameter.OperationParameter, error) {
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
