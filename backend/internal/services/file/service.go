package file

import (
	"github.com/gin-gonic/gin"

	"github.com/api-relationship-core/backend/internal/domain/models/file"

	files_pkg "github.com/api-relationship-core/backend/pkg/files"
)

type FileService struct{}

func NewFileService() *FileService {
	return &FileService{}
}

func (service *FileService) JsonOutputToCsv(context *gin.Context, filename string) (*file.FileOutput, error) {
	err := files_pkg.ConvertOutputJsonToCsv(filename)
	if err != nil {
		return nil, err
	}

	return nil, nil
}
