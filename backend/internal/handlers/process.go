package handlers

import (
	"github.com/api-relationship-core/backend/internal/domain/models/process"
	"github.com/api-relationship-core/backend/internal/domain/ports"

	"github.com/gin-gonic/gin"
)

type ProcessHandler struct {
	processService ports.ProcessService
	Context        *gin.Context
}

func NewProcessHandler(processService ports.ProcessService) *ProcessHandler {
	return &ProcessHandler{
		processService: processService,
	}
}

func (op *ProcessHandler) StartProcess(process *process.Process) (*process.Process, error) {
	result, err := op.processService.Process(op.Context, process)
	if err != nil {
		return nil, err
	}

	return result, nil
}
