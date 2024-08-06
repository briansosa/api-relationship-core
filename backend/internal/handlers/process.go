package handlers

import (
	"context"

	"github.com/api-relationship-core/backend/internal/domain/models/process"
	"github.com/api-relationship-core/backend/internal/domain/ports"
)

type ProcessHandler struct {
	processService ports.ProcessService
	Context        *context.Context
}

func NewProcessHandler(processService ports.ProcessService) *ProcessHandler {
	return &ProcessHandler{
		processService: processService,
	}
}

func (op *ProcessHandler) StartProcess(process *process.Process) (*process.Process, error) {
	result, err := op.processService.Process(process)
	if err != nil {
		return nil, err
	}

	return result, nil
}
