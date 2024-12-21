package handlers

import (
	"context"
	"errors"

	"github.com/api-relationship-core/backend/internal/domain/models/file"
	"github.com/api-relationship-core/backend/internal/domain/ports"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

type FileHandler struct {
	fileService ports.FileService
	Context     *context.Context
}

func NewFileHandler(fileService ports.FileService) *FileHandler {
	return &FileHandler{
		fileService: fileService,
	}
}

func (handler *FileHandler) ParseToCsv(filename *string) (*file.FileOutput, error) {
	if filename == nil || *filename == "" {
		return nil, errors.New("Name parameter can't be empty")
	}

	result, err := handler.fileService.JsonOutputToCsv(*filename)
	if err != nil {
		return nil, err
	}

	return result, nil

}

func (h *FileHandler) ReadCSVFile(filePath string) (string, error) {
	result, err := runtime.OpenFileDialog(*h.Context, runtime.OpenDialogOptions{})
	if err != nil {
		return "", err
	}

	return result, nil
}
