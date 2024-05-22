package file

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"

	"github.com/api-relationship-core/backend/pkg/files"

	"github.com/gin-gonic/gin"
)

type FileRepository struct {
	extension string
}

func NewFileRepository() *FileRepository {
	return &FileRepository{
		extension: "json",
	}
}

func (repository *FileRepository) Get(context *gin.Context, filename, schema string) ([]byte, error) {
	if filename == "" {
		return nil, errors.New("Filename cannot be empty")
	}

	if schema == "" {
		return nil, errors.New("Schema cannot be empty")
	}

	path := files.GetSchemaPath(schema)
	path = filepath.Join(path, fmt.Sprintf("%s.%s", filename, repository.extension))

	bytes, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	return bytes, nil
}
