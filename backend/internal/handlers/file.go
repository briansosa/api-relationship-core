package handlers

import (
	"errors"

	"github.com/api-relationship-core/backend/internal/domain/models/file"
	"github.com/api-relationship-core/backend/internal/domain/ports"

	"github.com/gin-gonic/gin"
)

type FileHandler struct {
	fileService ports.FileService
	Context     *gin.Context
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

	result, err := handler.fileService.JsonOutputToCsv(handler.Context, *filename)
	if err != nil {
		return nil, err
	}

	return result, nil

}
