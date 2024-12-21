package handlers

import (
	"context"

	"github.com/api-relationship-core/backend/internal/domain/models/process"
	"github.com/api-relationship-core/backend/internal/domain/ports"
)

type ProcessHandler struct {
	processService     ports.ProcessService
	persistenceService ports.PersistenceService
	Context            *context.Context
}

func NewProcessHandler(processService ports.ProcessService, persistenceService ports.PersistenceService) *ProcessHandler {
	return &ProcessHandler{
		processService:     processService,
		persistenceService: persistenceService,
	}
}

func (op *ProcessHandler) StartProcess(process *process.Process) (*process.Process, error) {
	result, err := op.processService.Process(process)
	if err != nil {
		return nil, err
	}

	return result, nil
}

func (op *ProcessHandler) GetAllProcesses() (*[]process.Process, error) {
	result, err := op.persistenceService.GetAllProcess()
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (op *ProcessHandler) GetProcess(id string) (*process.Process, error) {
	result, err := op.persistenceService.GetProcess(id)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (op *ProcessHandler) CreateProcess(process process.Process) (*process.Process, error) {
	result, err := op.persistenceService.InsertProcess(process)
	if err != nil {
		return nil, err
	}

	return &result, nil
}

func (op *ProcessHandler) UpdateProcess(process process.Process) error {
	err := op.persistenceService.UpdateProcess(process.ID, process)
	if err != nil {
		return err
	}

	return nil
}

func (op *ProcessHandler) DeleteProcess(id string) error {
	err := op.persistenceService.DeleteProcess(id)
	return err
}
