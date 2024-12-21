package process

import (
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/api-relationship-core/backend/internal/domain/models/flow"
	"github.com/api-relationship-core/backend/internal/domain/models/operation"
	"github.com/api-relationship-core/backend/internal/domain/models/process"
	"github.com/api-relationship-core/backend/internal/domain/ports"
	"github.com/api-relationship-core/backend/pkg/concurrency"
	"github.com/api-relationship-core/backend/pkg/csv"
	"github.com/api-relationship-core/backend/pkg/errorcustom"
	"github.com/api-relationship-core/backend/pkg/files"
	"github.com/api-relationship-core/backend/pkg/jsonmemory"
	"github.com/api-relationship-core/backend/pkg/taskmanager"

	"golang.org/x/exp/slices"

	flowfieldsresponse "github.com/api-relationship-core/backend/internal/domain/models/flow_fields_response"
	httpClientModel "github.com/api-relationship-core/backend/internal/domain/models/http_client"
	operationparameter "github.com/api-relationship-core/backend/internal/domain/models/operation_parameter"
	memory_pkg "github.com/api-relationship-core/backend/pkg/memory"
)

type ProcessService struct {
	persistenceService ports.PersistenceService
	httpClientService  ports.HttpClient
	logSequenceService ports.SecuenceService
	processItems       *processObjects
}

type processObjects struct {
	process                   *process.Process
	flow                      flow.Flow
	flowFieldsResponse        flowfieldsresponse.FlowFieldsResponse
	fieldsResponseByOperation map[string][]string
	headers                   []string
	records                   [][]string
	taskmanager               *taskmanager.TaskManager
	logger                    *files.ErrorLogger
}

func NewProcessService(
	persistenceService ports.PersistenceService,
	httpClientService ports.HttpClient,
	logSequenceService ports.SecuenceService) ports.ProcessService {
	return &ProcessService{
		persistenceService: persistenceService,
		httpClientService:  httpClientService,
		logSequenceService: logSequenceService,
	}
}

func (service *ProcessService) Process(process *process.Process) (*process.Process, error) {
	err := service.initializeProcess(process)
	if err != nil {
		return nil, err
	}

	processObject := service.processItems

	initialOperationSchema, err := service.persistenceService.GetOperationSchema(processObject.flow.OperationSchemaID)
	if err != nil {
		return nil, err
	}

	initialOperationProcess := operation.NewOperationProcess(initialOperationSchema)
	fillOperationProcess(&initialOperationSchema, initialOperationProcess)

	headers := processObject.getHeaders()
	operationsFieldsResponse := processObject.getOperationsFieldsResponse(processObject.flowFieldsResponse)

	records := processObject.getRecords()

	task := processObject.taskmanager.GetInitialOperationPool()
	task.WithResult(len(records))

	for _, value := range records {
		record := value
		memory := memory_pkg.NewMemory()
		task.AddTaskWithResult(func() (interface{}, error) {

			//
			// Save Headers and records to memory
			//
			err := saveHeadersInMemory(&memory, headers, record)
			if err != nil {
				return memory, service.handleError(err, errorcustom.NewSaveHeadersError)
			}

			inicializateOrderMemory(&memory, processObject.flowFieldsResponse)

			//
			// Make initial operation
			//

			// Build Operation Process. Replace parameters and set value record.
			buildInitialOperationProcess(&initialOperationProcess, processObject.flow.RelationFields, &initialOperationSchema, record, headers)

			// Make first Api Call
			response, err := service.MakeOperationHttpRequest(initialOperationProcess)
			if err != nil {
				return memory, service.handleError(err, errorcustom.NewApiCallError, processObject.flow.Name)
			}

			// Save response in memory
			err = saveResponseInMemory(&memory, operationsFieldsResponse, processObject.flow.Name, response)
			if err != nil {
				return memory, service.handleError(err, errorcustom.NewSaveMemoryError, processObject.flow.Name)
			}

			//
			// Make relation operations
			//
			err = service.makeCallsToRelationOperations(processObject.flow.RelationOperations, &memory)
			if err != nil {
				return memory, err
			}

			return memory, nil
		})
	}

	task.Wait()

	task.ResultData(func(value interface{}, err error) {
		memory := value.(memory_pkg.Memory)
		setErrorInMemory(&memory, err)
		err = files.SaveMemoryInFile(process.OutputFilename, memory)
		if err != nil {
			fmt.Println("Error save memory in file. ", err.Error())
		}
	})

	processObject.process.Status = "finish"
	processResult, err := service.persistenceService.InsertProcess(*processObject.process)
	if err != nil {
		return nil, err
	}

	return &processResult, nil
}

func (service *ProcessService) MakeOperationHttpRequest(operation operation.OperationProcess) (string, error) {
	request := httpClientModel.ClientHttpRequest{
		Transport: httpClientModel.Transport{
			Url:        operation.Url,
			Method:     operation.MethodType,
			QueryParam: &operation.QueryParams,
			Timeout:    &operation.Timeout,
		},
	}

	response, err := service.httpClientService.DoApiCall(request)
	if err != nil {
		return "", err
	}

	return string(response), nil
}

func (service *ProcessService) initializeProcess(process *process.Process) error {
	flow, err := service.persistenceService.GetFlow(process.FlowID)
	if err != nil {
		return err
	}

	fieldsResponse, err := service.persistenceService.GetFieldsResponse(process.FieldsResponseID)
	if err != nil {
		return err
	}

	//inputPath := files.GetSchemaPath("input")
	//inputPath = filepath.Join(inputPath, fmt.Sprintf("%s.%s", process.Input, "csv"))
	records, err := csv.ReadCsv(process.Input)
	if err != nil {
		return err
	}

	timeNow := time.Now()
	formattedTime := timeNow.Format("01-02-2006_15:04:05")
	outputFilename := fmt.Sprintf("%s-%s", process.Name, formattedTime)
	process.OutputFilename = outputFilename

	process.Status = "pending"
	processResult, err := service.persistenceService.InsertProcess(*process)
	if err != nil {
		return err
	}

	taskmanager := taskmanager.NewTaskManager()
	fillTaskManager(taskmanager, flow)

	service.processItems = &processObjects{
		process:            &processResult,
		flow:               flow,
		flowFieldsResponse: fieldsResponse,
		headers:            records[0],
		records:            records[1:],
		taskmanager:        taskmanager,
		logger:             files.NewErrorLogger(outputFilename),
	}

	return nil
}

func (service *ProcessService) makeCallsToRelationOperations(relationOperations []flow.Flow, memory *memory_pkg.Memory) error {
	for _, relationOperation := range relationOperations {
		// TODO: falta hacer recursividad por este for, pero hacerlo despues de manejar los errores, asi no es re-trabajo
		operationSchema, err := service.persistenceService.GetOperationSchema(relationOperation.OperationSchemaID)
		if err != nil {
			errCustom := service.handleError(err, errorcustom.NewOperationSchemaError, relationOperation.Name)
			setErrorInMemory(memory, errCustom)
			continue
		}

		operationProcess := operation.NewOperationProcess(operationSchema)
		fillOperationProcess(&operationSchema, operationProcess)

		// Build Operation Process. Replace parameters and set value record.
		operationsProcess, err := buildOperationProcess(&operationProcess, relationOperation.RelationFields, relationOperation.SearchType, &operationSchema, memory)
		if err != nil {
			errCustom := service.handleError(err, errorcustom.NewBuildOperationsProcessError, relationOperation.Name)
			setErrorInMemory(memory, errCustom)
			continue
		}

		lenOperations := len(operationsProcess)
		processor := service.processItems.taskmanager.NewProcessor(relationOperation.Name, lenOperations)
		resultCh := make(chan concurrency.TaskResult, lenOperations)

		for _, operationSafe := range operationsProcess {
			operation := operationSafe
			processor.AddTask(func() {
				response, err := service.MakeOperationHttpRequest(operation)
				if err != nil {
					errCustom := service.handleError(err, errorcustom.NewApiCallError, relationOperation.Name)
					resultCh <- concurrency.TaskResult{Result: memory, Err: errCustom}
				}

				/*
					TODO: ahora que se incluye la misma pegada propiedades tipo lista, no se estan guardando bien en la memoria.
					Se estan pisando las keys. Hay que hacer algo de como que si es simple y ya existe la key, entonces la volvemos
					un multiple value o algo parecido (puede ser un tipo nuevo si es que rompe)
				*/

				// Save response in memory
				operationsFieldsResponse := service.processItems.getOperationsFieldsResponse(service.processItems.flowFieldsResponse)
				err = saveResponseInMemory(memory, operationsFieldsResponse, relationOperation.Name, response)
				if err != nil {
					errCustom := service.handleError(err, errorcustom.NewSaveMemoryError, relationOperation.Name)
					resultCh <- concurrency.TaskResult{Result: memory, Err: errCustom}
				}

				resultCh <- concurrency.TaskResult{Result: memory}
			})
		}

		go func() {
			defer close(resultCh)
			processor.Wait()
		}()

		for value := range resultCh {
			memory := value.Result.(*memory_pkg.Memory)
			setErrorInMemory(memory, value.Err)

			// If have any relation operation then init recursivity
			if len(relationOperation.RelationOperations) != 0 {
				err = service.makeCallsToRelationOperations(relationOperation.RelationOperations, memory)
				if err != nil {
					// TODO: handle error
					return err
				}
			}
		}
	}

	return nil
}

func (service *ProcessService) handleError(err error, funcErr errorcustom.NewErrorCustomFunc, tags ...string) *errorcustom.CustomError {
	logId, _ := service.logSequenceService.GetID()
	customErr := funcErr(logId, err, tags...)
	service.processItems.logger.AsyncLogError(customErr)
	return customErr
}

func (po *processObjects) getHeaders() []string {
	return po.headers
}

func (po *processObjects) getRecords() [][]string {
	return po.records
}

func (po *processObjects) getOperationsFieldsResponse(fieldsResponse flowfieldsresponse.FlowFieldsResponse) map[string][]string {
	if po.fieldsResponseByOperation != nil || len(po.fieldsResponseByOperation) != 0 {
		return po.fieldsResponseByOperation
	}

	operationsFieldsResponse := make(map[string][]string)
	for _, fieldResponse := range fieldsResponse.FieldsResponse {
		value, ok := operationsFieldsResponse[fieldResponse.OperationName]
		if !ok {
			operationsFieldsResponse[fieldResponse.OperationName] = []string{fieldResponse.FieldResponse}
			continue
		}

		operationsFieldsResponse[fieldResponse.OperationName] = append(value, fieldResponse.FieldResponse)
	}

	po.fieldsResponseByOperation = operationsFieldsResponse
	return operationsFieldsResponse
}

func inicializateOrderMemory(memory *memory_pkg.Memory, flowFieldsResponse flowfieldsresponse.FlowFieldsResponse) {
	for _, fieldResponse := range flowFieldsResponse.FieldsResponse {
		key := jsonmemory.GetKey(fieldResponse.OperationName, fieldResponse.FieldResponse)
		memory.Set(key, nil)
	}

	jsonmemory.SavePlaneValue(memory, "error", "false", true)
	memory.Set("error_message", nil)
}

func setErrorInMemory(memory *memory_pkg.Memory, err error) {
	if err != nil {
		jsonmemory.SavePlaneValue(memory, "error", "true", true)
		jsonmemory.SavePlaneValue(memory, "error_message", err.Error(), false)
		return
	}
}

func saveResponseInMemory(memory *memory_pkg.Memory, operationsFieldsResponse map[string][]string, operationName string, httpResponse string) error {
	fieldsResponse := operationsFieldsResponse[operationName]
	for _, field := range fieldsResponse {
		err := jsonmemory.SaveInMemory(memory, operationName, field, httpResponse)
		if err != nil {
			return err
		}
	}

	return nil
}

func saveHeadersInMemory(memory *memory_pkg.Memory, headers, records []string) error {
	for i := 0; i < len(headers); i++ {
		err := jsonmemory.SavePlaneValue(memory, headers[i], records[i], true)
		if err != nil {
			return err
		}
	}

	return nil
}

func buildInitialOperationProcess(operationProcess *operation.OperationProcess, relationFields []flow.RelationField, operationParameter *operationparameter.OperationParameter, record, headers []string) error {
	for _, relationField := range relationFields {
		indexParameter, okChildParameter := containChildParameter(*operationParameter, relationField.ChildParameter)
		if okChildParameter {
			if relationField.Type != "input" {
				// Esta parte es solo para la operacion principal, si o si tiene que decir input
				return fmt.Errorf("los relation field de la operacion principal no son del tipo INPUT")
			}

			valueRecord, err := getValueFromRecord(headers, record, relationField.ParentField)
			if err != nil {
				return err
			}

			params := *operationParameter.Params
			param := params[indexParameter]
			fillOperationWithValue(operationProcess, param, valueRecord)
		}
	}

	return nil
}

func buildOperationProcess(operationProcess *operation.OperationProcess, relationFields []flow.RelationField, searchType string, operationParameter *operationparameter.OperationParameter, memory *memory_pkg.Memory) ([]operation.OperationProcess, error) {
	var operationsProcess []operation.OperationProcess
	var err error

	/*
		Bien ya funciona con los 3 tipos de casos que encontre para el manejo de listas:
		1. Simple: En este modelo solo tomamos el primer dato de las propiedades tipo lista
		2. Direct Product: En este modelo armamos tantas operaciones como el numero mayor de listas. Ejemplo:
			Lista A: [1, 2, 3 , 4]
			Lista B: [A, B]
		   Como resultado tiene que dar este conjunto de datos:
		   	Lista final: [(1, A), (2, B), (3, null), (4, null)]
		3. Cardinal Product: En este modelo se genera un producto cartesiano de operaciones. Ejemplos:
			Lista A: [1, 2, 3]
			Lista B: [A, B]
		   Como resultado tiene que dar este conjunto de datos:
		   	Lista final: [(1;A), (1;B), (2;A), (2;B), (3;A), (3;B)]

		Seguramente tiene muchas mejoras este flujo, pero es bastante complicado de hacer.
		Así que prefiero seguir con el resto y después volverlo a ver cuando tenga ejemplos más reales.
		También se puede implementar el tema de usar los typeof de Simple, etc, que lo deje medio deprecado
	*/

	switch searchType {
	case "simple":
		operationsProcess, err = buildSimpleOperationProcess(operationProcess, relationFields, operationParameter, memory)
	case "direct_product":
		operationsProcess, err = buildDirectProductOperationProcess(*operationProcess, relationFields, operationParameter, memory)
	case "cardinal_product":
		operationsProcess, err = buildMultipleOperationProcess(*operationProcess, relationFields, operationParameter, memory)
	}

	if err != nil {
		return nil, err
	}

	return operationsProcess, nil
}

func buildSimpleOperationProcess(operationProcess *operation.OperationProcess, relationFields []flow.RelationField, operationParameter *operationparameter.OperationParameter, memory *memory_pkg.Memory) ([]operation.OperationProcess, error) {
	for _, relationField := range relationFields {
		indexParameter, okChildParameter := containChildParameter(*operationParameter, relationField.ChildParameter)
		if okChildParameter {
			params := *operationParameter.Params
			param := params[indexParameter]
			values, ok := memory.GetValuesFromKey(relationField.ParentField)
			if !ok {
				return nil, fmt.Errorf("Field no encontrado")
			}

			value := values[0]
			fillOperationWithValue(operationProcess, param, value)
		}
	}

	return []operation.OperationProcess{*operationProcess}, nil
}

func buildMultipleOperationProcess(operationProcess operation.OperationProcess, relationFields []flow.RelationField, operationParameter *operationparameter.OperationParameter, memory *memory_pkg.Memory) ([]operation.OperationProcess, error) {
	var listOfOperationProcess []operation.OperationProcess

	// Función auxiliar para generar el producto cartesiano de los valores de la memoria
	var generateCartesianProduct func(int, map[string]interface{}) error
	generateCartesianProduct = func(index int, currentCombination map[string]interface{}) error {
		if index == len(relationFields) {
			err := fillOperationProcessParams(&operationProcess, *operationParameter.Params, currentCombination)
			if err != nil {
				return err
			}

			clonedOperationProcess := cloneOperationProcess(operationProcess)
			listOfOperationProcess = append(listOfOperationProcess, clonedOperationProcess)
			return nil
		}

		relationField := relationFields[index]
		values, ok := memory.GetValuesFromKey(relationField.ParentField)
		if !ok {
			return fmt.Errorf("No se encontraron valores para el campo %s", relationFields[index].ParentField)
		}

		if !fieldIsList(relationField.ParentField) {
			values = values[:1]
		}

		for _, value := range values {
			nextCombination := make(map[string]interface{}, len(currentCombination)+1)
			for key, val := range currentCombination {
				nextCombination[key] = val
			}
			nextCombination[relationFields[index].ChildParameter] = value

			if err := generateCartesianProduct(index+1, nextCombination); err != nil {
				return err
			}
		}

		return nil
	}

	if err := generateCartesianProduct(0, make(map[string]interface{})); err != nil {
		return nil, err
	}

	return listOfOperationProcess, nil
}

func buildDirectProductOperationProcess(operationProcess operation.OperationProcess, relationFields []flow.RelationField, operationParameter *operationparameter.OperationParameter, memory *memory_pkg.Memory) ([]operation.OperationProcess, error) {
	var listOfOperationProcess []operation.OperationProcess
	var maxLenFieldsLists int = 1
	var indexFieldLists int

	// Función auxiliar para generar el producto cartesiano de los valores de la memoria
	var generateDirectProduct func(int, map[string]interface{}) error
	generateDirectProduct = func(index int, currentCombination map[string]interface{}) error {
		if index == len(relationFields) {
			err := fillOperationProcessParams(&operationProcess, *operationParameter.Params, currentCombination)
			if err != nil {
				return err
			}

			clonedOperationProcess := cloneOperationProcess(operationProcess)
			listOfOperationProcess = append(listOfOperationProcess, clonedOperationProcess)
			return nil
		}

		relationField := relationFields[index]
		values, ok := memory.GetValuesFromKey(relationField.ParentField)
		if !ok {
			return fmt.Errorf("No se encontraron valores para el campo %s", relationFields[index].ParentField)
		}

		var value interface{}
		if !fieldIsList(relationField.ParentField) {
			value = values[0]
		} else {
			lenValues := len(values)
			if lenValues > maxLenFieldsLists {
				maxLenFieldsLists = lenValues
			}

			if indexFieldLists < lenValues {
				value = values[indexFieldLists]
			} else {
				value = nil
			}
		}

		nextCombination := make(map[string]interface{}, len(currentCombination)+1)
		for key, val := range currentCombination {
			nextCombination[key] = val
		}
		nextCombination[relationFields[index].ChildParameter] = value

		if err := generateDirectProduct(index+1, nextCombination); err != nil {
			return err
		}

		return nil
	}

	for i := 1; i <= maxLenFieldsLists; i++ {
		if err := generateDirectProduct(0, make(map[string]interface{})); err != nil {
			return nil, err
		}
		indexFieldLists++
	}

	return listOfOperationProcess, nil
}

func fieldIsList(field string) bool {
	return strings.Contains(field, "#")
}

func cloneOperationProcess(operationProcess operation.OperationProcess) operation.OperationProcess {
	originalJSON, _ := json.Marshal(operationProcess)

	var cloned operation.OperationProcess
	json.Unmarshal(originalJSON, &cloned)

	return cloned
}

// Llena el proceso de operación con los valores de la combinación actual
func fillOperationProcessParams(operationProcess *operation.OperationProcess, params []operationparameter.Parameters, currentCombination map[string]interface{}) error {
	for _, param := range params {
		paramValue, ok := currentCombination[param.Name]
		if !ok {
			return fmt.Errorf("No se encontró valor para el parámetro %s", param.Name)
		}

		fillOperationWithValue(operationProcess, param, paramValue)
	}

	return nil
}

func fillOperationWithValue(operation *operation.OperationProcess, param operationparameter.Parameters, value interface{}) {
	switch param.Type {
	case "query_param":
		operation.QueryParams[param.Name] = value
	case "header":
		operation.Headers[param.Name] = value
	case "path":
		operation.Url = strings.Replace(operation.Url, "{"+param.Name+"}", value.(string), 1)
	case "body":
		// TODO hacer reemplazo de body
	}
}

func getValueFromRecord(headers []string, record []string, headerName string) (string, error) {
	indexHeaderParam := slices.Index(headers, headerName)
	containHeaderParam := indexHeaderParam != -1
	if !containHeaderParam {
		// Aca no se encuentra en los headers del csv, el parametro que necesita para iniciar el proceso
		// Calculo que aca hay que retornar un error y cortar el procesamiento
		return "", fmt.Errorf("los relation field de la operacion principal no estan en el archivo de INPUT")
	}

	valueRecord := record[indexHeaderParam]
	return valueRecord, nil
}

func containChildParameter(operationParameter operationparameter.OperationParameter, childParameter string) (int, bool) {
	indexParameter := slices.IndexFunc(*operationParameter.Params, func(value operationparameter.Parameters) bool {
		return value.Name == childParameter
	})

	containChildParameter := indexParameter != -1
	return indexParameter, containChildParameter
}

// Seteo de query params, headers y body fijos.
func fillOperationProcess(operationParameter *operationparameter.OperationParameter, operationProcess operation.OperationProcess) {
	setQueryParamInOperation(operationParameter, &operationProcess)
	setHeaderInOperation(operationParameter, &operationProcess)

	// TODO: falta hacer algo parecido pero para el body. Pero hay que verlo bien porque es diferente el reemplazo y los campos fijos
	// Falta los parametros en el endpoint?
}

func setHeaderInOperation(operationParameter *operationparameter.OperationParameter, operation *operation.OperationProcess) {
	if operationParameter.Headers != nil {
		for key, value := range *operationParameter.Headers {
			operation.Headers[key] = value
		}
	}
}

func setQueryParamInOperation(operationParameter *operationparameter.OperationParameter, operation *operation.OperationProcess) {
	if operationParameter.QueryParams != nil {
		for key, value := range *operationParameter.QueryParams {
			operation.QueryParams[key] = value
		}
	}
}

func fillTaskManager(taskmanager *taskmanager.TaskManager, flow flow.Flow) {
	maxConcurrency := 1
	if flow.MaxConcurrency != 0 {
		maxConcurrency = flow.MaxConcurrency
	}

	taskmanager.SetInitialOperationPool(maxConcurrency)
	if len(flow.RelationOperations) != 0 {
		fillTaskManagerRelationsOperations(taskmanager, flow.RelationOperations)
	}
}

func fillTaskManagerRelationsOperations(taskmanager *taskmanager.TaskManager, relationOperations []flow.Flow) {
	for _, operation := range relationOperations {
		maxConcurrency := 1
		if operation.MaxConcurrency != 0 {
			maxConcurrency = operation.MaxConcurrency
		}

		taskmanager.AddOperationPool(operation.Name, maxConcurrency)
		if len(operation.RelationOperations) != 0 {
			fillTaskManagerRelationsOperations(taskmanager, operation.RelationOperations)
		}
	}
}

/*
	Bien, ya pude:
		- construir la operación haciendo los reemplazos
		- hacer la api call
		- crear una estructura de memoria donde se pueda guardar ya sea un dato simple o array de datos, manteniendo una key simple como:
			"location|direccionesNormalizadas.#.coordenadas.y"
		  solo utilizando el método "GetValue" que retorna el valor de esa key
		- esta estructura de memoria ya me sirve para pensar a futuro el formateo de los campos para mostrarselos al usuario
		- Primero acomodaria todo este código en funciones o pkgs mas chicos, porque es un quilombo
		  necesito acomodarlo porque va a empezar la recursividad hacia las relation operations que todavia no pense como hacer
		- empezar a pensar como hacer la recursividad e ir desarrollandola
		- ya esta hecha la recursividad a nivel relation operation
		- pensar y hacer la recursividad a nivel lista de resultados
		- esta hecha la recursividad a nivel lista de resultados. Revisar como queda la memoria en estos casos
		  puede que se pisen datos
		- incluir datos del record/headers en el memory
		- escribir el resultado en un archivo de salida, armando el json output
		- ordenar json de salida
		- limpiar json de salida de propiedades internas
		- armar csv ordenado a partir del file de salida
		- go routines
		- manejo de errores
		- reemplazar archivos JSONs por una DB
		Que resta:
		- crear los CRUD para los objetos
		- terminar de armar parte de parámetros, como los parametros del endpoint y el body de la request -> con esto hago un GRAN GRAN HITO, seria la POC del proyecto!!!

		- buscar métodos para ordenamiento de listas en el file csv de salida.
		- pensar como se manejarian los casos de error de las apis

*/
