package configuration

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/api-relationship-core/backend/pkg/files"

	bolt "go.etcd.io/bbolt"
)

type RestConfig struct{}

func InitClientHttp(configuration RestConfig) *http.Client {
	return http.DefaultClient
}

func InitBBoltDB() *bolt.DB {
	options := &bolt.Options{Timeout: 10 * time.Second}
	var mode os.FileMode = 0600
	path := files.GetSchemaPath("db")
	path = filepath.Join(path, fmt.Sprintf("%s.%s", "db_test", "db"))
	storage, err := bolt.Open(path, mode, options)
	if err != nil {
		panic(err.Error())
	}

	buckets := []string{"operations", "flows", "process", "flow_fields_response", "operation_schemas"}

	err = storage.Update(func(tx *bolt.Tx) error {
		for _, bucket := range buckets {
			_, err := tx.CreateBucketIfNotExists([]byte(bucket))
			if err != nil {
				return fmt.Errorf("create bucket: %s", err)
			}
		}

		return nil
	})

	if err != nil {
		panic(err.Error())
	}

	return storage
}
