package concurrency_test

import (
	"fmt"
	"math/rand"
	"sync"
	"testing"
	"time"

	"github.com/api-relationship-core/backend/pkg/concurrency"
)

func TestExampleNewSyncTaskPool(t *testing.T) {
	pool := concurrency.NewSyncTaskPool(2) // means we want a pool that can handle 2 tasks concurrently
	dataIDsToFetch := []string{
		"id1",
		"id2",
		"id3",
	}

	resultDataCh := make(chan string, len(dataIDsToFetch))

	// create sample tasks
	for _, idToFetch := range dataIDsToFetch {
		pool.AddTask(func() {
			// this function adds your target task to the pool to be executed in
			// an async way
			if data, err := fetchData(idToFetch); err == nil {
				resultDataCh <- data // strongly encourage you to use channels to store the tasks results
			}
		})
	}

	// go func() {
	// 	defer close(resultDataCh) // asegura que el canal se cierre cuando se terminen de enviar todos los datos
	// 	pool.Wait()               // espera a que todas las tareas se completen
	// }()

	pool.Wait()

	var resultData []string

	for data := range resultDataCh { // get the tasks result from channel
		resultData = append(resultData, data)
	}

	fmt.Println(resultData)
}

func fetchData(id string) (string, error) {
	rand.Seed(time.Now().UnixNano())
	min := 10
	max := 30
	return fmt.Sprintf("%d", rand.Intn(max-min+1)+min), nil

}

func TestExampleNewBackgroundTaskPool(t *testing.T) {

	pool := concurrency.NewBackgroundTaskPool(2) // means we want a pool that can handle 2 tasks concurrently
	dataIDsToFetch := []string{
		"id1",
		"id2",
		"id3",
	}

	resultDataCh := make(chan string, len(dataIDsToFetch))

	var tasksWG sync.WaitGroup

	// create sample tasks
	for _, idToFetch := range dataIDsToFetch {
		tasksWG.Add(1)
		pool.AddTask(func() {
			// this function adds your target task to the pool to be executed in
			// an async way
			if data, err := fetchData(idToFetch); err == nil {
				resultDataCh <- data // strongly encourage you to use channels to store the tasks results
			}
			tasksWG.Done()
		})
	}
	tasksWG.Wait()
	var resultData []string

	for data := range resultDataCh { // get the tasks result from channel
		resultData = append(resultData, data)
	}

	fmt.Println(resultData)
}
