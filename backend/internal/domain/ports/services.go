package ports

import (
	"github.com/gin-gonic/gin"

	"github.com/api-relationship-core/backend/internal/domain/models/flow"
	"github.com/api-relationship-core/backend/internal/domain/models/operation"
	"github.com/api-relationship-core/backend/internal/domain/models/process"

	fileModel "github.com/api-relationship-core/backend/internal/domain/models/file"
	flowfieldsresponse "github.com/api-relationship-core/backend/internal/domain/models/flow_fields_response"
	httpClientModel "github.com/api-relationship-core/backend/internal/domain/models/http_client"
	operationparameter "github.com/api-relationship-core/backend/internal/domain/models/operation_parameter"
)

type ProcessService interface {
	Process(context *gin.Context, process *process.Process) (*process.Process, error)
}

type PersistenceService interface {
	InsertOperation(value operation.Operation) (operation.Operation, error)
	UpdateOperation(key string, value operation.Operation) error
	GetOperation(key string) (operation.Operation, error)
	DeleteOperation(key string) error
	GetAllOperations() ([]operation.Operation, error)
	InsertFlow(value flow.Flow) (flow.Flow, error)
	UpdateFlow(key string, value flow.Flow) error
	GetFlow(key string) (flow.Flow, error)
	DeleteFlow(key string) error
	GetAllFlows() ([]flow.Flow, error)
	InsertProcess(value process.Process) (process.Process, error)
	UpdateProcess(key string, value process.Process) error
	GetProcess(key string) (process.Process, error)
	DeleteProcess(key string) error
	GetAllProcess() ([]process.Process, error)
	InsertFieldsResponse(value flowfieldsresponse.FlowFieldsResponse) (flowfieldsresponse.FlowFieldsResponse, error)
	UpdateFieldsResponse(key string, value flowfieldsresponse.FlowFieldsResponse) error
	GetFieldsResponse(key string) (flowfieldsresponse.FlowFieldsResponse, error)
	DeleteFieldsResponse(key string) error
	GetAllFieldsResponse() ([]flowfieldsresponse.FlowFieldsResponse, error)
	InsertOperationSchema(value operationparameter.OperationParameter) (operationparameter.OperationParameter, error)
	UpdateOperationSchema(key string, value operationparameter.OperationParameter) error
	GetOperationSchema(key string) (operationparameter.OperationParameter, error)
	DeleteOperationSchema(key string) error
	GetAllOperationSchema() ([]operationparameter.OperationParameter, error)
}

type HttpClient interface {
	DoApiCall(context *gin.Context, httpRequest httpClientModel.ClientHttpRequest) ([]byte, error)
	DoApiCallWithResponse(context *gin.Context, httpRequest httpClientModel.ClientHttpRequest, outResponse interface{}) error
	TestApiCall(context *gin.Context, httpRequest httpClientModel.ClientHttpRequest) (*httpClientModel.ClientHttpResponse, error)
}

type FileService interface {
	JsonOutputToCsv(context *gin.Context, filename string) (*fileModel.FileOutput, error)
}

type SecuenceService interface {
	GetID() (string, error)
}
