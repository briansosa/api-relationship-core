package startup

import (
	"fmt"

	"github.com/api-relationship-core/backend/cmd/dependencies"
	"github.com/api-relationship-core/backend/internal/domain/models/process"

	"github.com/gin-gonic/gin"
)

func Script(definition dependencies.Definition) {
	fmt.Println("Welcome to api-relationship-engine :D")

	context := gin.Context{}

	request := process.Process{
		Name:             "test-process-1",
		FlowID:           "1",
		Input:            "input-default",
		FieldsResponseID: "2",
	}

	definition.ProcessHandler.Context = &context
	result, err := definition.ProcessHandler.StartProcess(&request)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	definition.FileHandler.Context = &context
	_, err = definition.FileHandler.ParseToCsv(&result.OutputFilename)
	if err != nil {
		fmt.Println(err.Error())
		return
	}

	fmt.Println("Finalizo !")
}
