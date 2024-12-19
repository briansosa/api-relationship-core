package dependencies

import (
	"context"

	"github.com/api-relationship-core/backend/cmd/configuration"
	"github.com/api-relationship-core/backend/internal/domain/ports"
	"github.com/api-relationship-core/backend/internal/handlers"
	"github.com/api-relationship-core/backend/pkg/constants"
	"github.com/api-relationship-core/backend/pkg/environment"

	bbolt_repository "github.com/api-relationship-core/backend/internal/repositories/bbolt"
	file_repository "github.com/api-relationship-core/backend/internal/repositories/file"
	file_srv "github.com/api-relationship-core/backend/internal/services/file"
	http_client_srv "github.com/api-relationship-core/backend/internal/services/http_client"
	persistence_srv "github.com/api-relationship-core/backend/internal/services/persistence"
	process_srv "github.com/api-relationship-core/backend/internal/services/process"
	sequence_srv "github.com/api-relationship-core/backend/internal/services/sequence"
)

type Definition struct {

	//
	// Handlers
	//

	ProcessHandler           *handlers.ProcessHandler
	FileHandler              *handlers.FileHandler
	OperationSchemaHandler   *handlers.OperationSchemaHandler
	OperationTemplateHandler *handlers.OperationTemplateHandler
	FlowHandler              *handlers.FlowHandler
	FieldsResponseHandler    *handlers.FieldsResponseHandler

	//
	// Services
	//

	ProcessService     ports.ProcessService
	FileService        ports.FileService
	HttpClientService  ports.HttpClient
	LogSequenceService ports.SecuenceService
	PersistenceService ports.PersistenceService

	//
	// Repositories
	//

	FileRepository              ports.FileRepository
	OperationRepository         ports.DBRepository
	FlowRepository              ports.DBRepository
	ProcessRepository           ports.DBRepository
	FlowFieldResponseRepository ports.DBRepository
	OperationSchemaRepository   ports.DBRepository
}

func NewByEnvironment() Definition {
	env := constants.Local
	definition := initDependencies(env)
	return definition
}

func (d *Definition) Startup(context context.Context) {
	d.OperationSchemaHandler.Context = &context
	d.OperationTemplateHandler.Context = &context
	d.FlowHandler.Context = &context
	d.FieldsResponseHandler.Context = &context
}

func (d *Definition) GetBinds() []interface{} {
	return []interface{}{
		d.OperationSchemaHandler,
		d.OperationTemplateHandler,
		d.FlowHandler,
		d.FieldsResponseHandler,
	}
}

func initDependencies(environment string) Definition {
	var d Definition

	//
	// Clients
	//

	httpClient := configuration.InitClientHttp(configuration.RestConfig{})
	boltDB := configuration.InitBBoltDB()

	//
	// Repositories
	//

	d.FileRepository = file_repository.NewFileRepository()
	d.OperationRepository = bbolt_repository.NewBoltRepository(boltDB, "operations")
	d.FlowRepository = bbolt_repository.NewBoltRepository(boltDB, "flows")
	d.ProcessRepository = bbolt_repository.NewBoltRepository(boltDB, "process")
	d.FlowFieldResponseRepository = bbolt_repository.NewBoltRepository(boltDB, "flow_fields_response")
	d.OperationSchemaRepository = bbolt_repository.NewBoltRepository(boltDB, "operation_schemas")

	//
	// General Services
	//
	d.HttpClientService = http_client_srv.NewClientHttp(httpClient)
	d.LogSequenceService = sequence_srv.NewSequenceService()

	//
	// Persistence Services
	//
	d.PersistenceService = persistence_srv.NewPersistenceService(d.OperationRepository, d.FlowRepository, d.ProcessRepository, d.FlowFieldResponseRepository, d.OperationSchemaRepository)

	//
	// Core Services
	//

	d.ProcessService = process_srv.NewProcessService(d.PersistenceService, d.HttpClientService, d.LogSequenceService)
	d.FileService = file_srv.NewFileService()
	//
	// Handlers
	//

	d.ProcessHandler = handlers.NewProcessHandler(d.ProcessService)
	d.FileHandler = handlers.NewFileHandler(d.FileService)
	d.OperationSchemaHandler = handlers.NewOperationSchemaHandler(d.PersistenceService, d.HttpClientService)
	d.OperationTemplateHandler = handlers.NewOperationTemplateHandler(d.PersistenceService, d.HttpClientService)
	d.FlowHandler = handlers.NewFlowHandler(d.PersistenceService, d.HttpClientService)
	d.FieldsResponseHandler = handlers.NewFieldsResponseHandler(d.PersistenceService, d.HttpClientService)

	return d
}

// TODO: revisar configuraciones por ambiente
func getEnvironment(envManager environment.Environment) string {
	return constants.Local
}
