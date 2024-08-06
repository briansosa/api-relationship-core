package bbolt

import (
	"fmt"

	"github.com/api-relationship-core/backend/internal/domain/models/persistence"

	bolt "go.etcd.io/bbolt"
)

// bolt define bbolt instance
type BoltRepository struct {
	BucketName string
	Storage    *bolt.DB
}

// NewBBolt function set up bbolt local storage
// @param path <string>: creates storage at the given path
// @param bucketName <[]byte>
// @return (BoltDatabase, error)
func NewBoltRepository(storage *bolt.DB, bucketName string) *BoltRepository {
	bolt := &BoltRepository{}
	bolt.Storage = storage
	bolt.BucketName = bucketName
	return bolt
}

// Update create or update key parameter
// @param key <[]byte>
// @param value <[]byte>
// @return error
func (b *BoltRepository) Update(key string, value []byte) error {
	err := b.Storage.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(b.BucketName))
		if bucket == nil {
			err := fmt.Errorf("Bucket %q not found", b.BucketName)
			return err
		}

		err := bucket.Put([]byte(key), value)
		if err != nil {
			return err
		}
		return nil
	})

	return err
}

func (b *BoltRepository) Delete(key string) error {
	err := b.Storage.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(b.BucketName))
		if bucket == nil {
			err := fmt.Errorf("Bucket %q not found", b.BucketName)
			return err
		}

		err := bucket.Delete([]byte(key))
		if err != nil {
			return err
		}
		return nil
	})

	return err
}

// GetBy retrieve data by key
// @param key <[]byte>
// @return error
func (b *BoltRepository) GetBy(key string) (*persistence.KeyValue, error) {
	response := &persistence.KeyValue{}
	var value []byte
	var err error

	b.Storage.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(b.BucketName))
		if bucket == nil {
			err = fmt.Errorf("Bucket %s not found", b.BucketName)
			return err
		}

		value = bucket.Get([]byte(key))
		response.Key = key
		response.Value = value

		return nil
	})

	return response, err
}

// GetAllKeys retrieve data by keys
// @param keys <[]string>
// @return error
func (b *BoltRepository) GetAllKeys(keys []string) ([]*persistence.KeyValue, error) {
	var response []*persistence.KeyValue

	b.Storage.View(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(b.BucketName))
		if bucket == nil {
			err := fmt.Errorf("Bucket %s not found", b.BucketName)
			return err
		}

		for _, key := range keys {
			value := bucket.Get([]byte(key))
			if value != nil {
				response = append(response, &persistence.KeyValue{
					Key:   key,
					Value: value,
				})
			}
		}

		return nil
	})

	return response, nil
}

// GetAll retrieves all bucket's key/value
// @return ([]string, error)
func (b *BoltRepository) GetAll() ([]*persistence.KeyValue, error) {
	var response []*persistence.KeyValue

	b.Storage.View(func(tx *bolt.Tx) error {
		b := tx.Bucket([]byte(b.BucketName))
		if b != nil {
			c := b.Cursor()
			for k, v := c.First(); k != nil; k, v = c.Next() {
				keyVal := &persistence.KeyValue{}
				keyVal.Key = string(k)
				keyVal.Value = v

				response = append(response, keyVal)
			}
		}

		return nil
	})

	return response, nil
}

func (b *BoltRepository) NextSequence() (string, error) {
	var idSequence string
	err := b.Storage.Update(func(tx *bolt.Tx) error {
		bucket := tx.Bucket([]byte(b.BucketName))
		if bucket == nil {
			err := fmt.Errorf("Bucket %s not found", b.BucketName)
			return err
		}

		id, _ := bucket.NextSequence()
		idSequence = fmt.Sprintf("%v", id)
		return nil
	})

	return idSequence, err
}
