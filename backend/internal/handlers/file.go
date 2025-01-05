package handlers

import (
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/api-relationship-core/backend/internal/domain/models/file"
	"github.com/api-relationship-core/backend/internal/domain/ports"
	"github.com/api-relationship-core/backend/pkg/files"

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

func (h *FileHandler) ReadFile(filePath string) (string, error) {
	outputPath := files.GetSchemaPath("output")
	filename := fmt.Sprintf("%s.json", filePath)
	outputPath = filepath.Join(outputPath, filename)
	data, err := os.ReadFile(outputPath)
	if err != nil {
		return "", err
	}

	result := base64.StdEncoding.EncodeToString(data)
	return result, nil
}

func (h *FileHandler) GetFilePath() (string, error) {
	result, err := runtime.OpenFileDialog(*h.Context, runtime.OpenDialogOptions{})
	if err != nil {
		return "", err
	}

	return result, nil
}
