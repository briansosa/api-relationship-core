package ports

import (
	"github.com/api-relationship-core/backend/internal/domain/models/persistence"

	"github.com/gin-gonic/gin"
)

type FileRepository interface {
	Get(context *gin.Context, filename, schema string) ([]byte, error)
}

type DBRepository interface {
	GetBy(key string) (*persistence.KeyValue, error)
	GetAll() ([]*persistence.KeyValue, error)
	Update(key string, value []byte) error
	Delete(key string) error
	NextSequence() (string, error)
}
