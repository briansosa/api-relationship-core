package concurrency

import (
	"fmt"
	"sync"
	"sync/atomic"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestTaskPoolBackgroundMode(t *testing.T) {
	t.Run("sync tasks add", func(t *testing.T) {
		var (
			executedTaskWG          sync.WaitGroup
			expectedTasks           = 3000
			expectedConcurrentTasks = 100
		)

		pool := NewBackgroundTaskPool(expectedConcurrentTasks)

		executedTasks := int32(0)
		executedTaskWG.Add(expectedTasks) // wg for check concurrent executed tasks
		// create sample tasks
		for i := 0; i < expectedTasks; i++ {
			pool.AddTask(func() {
				atomic.AddInt32(&executedTasks, 1)
				executedTaskWG.Done()
			})
		}

		executedTaskWG.Wait() // wait for concurrent tasks wg to perform some checks in this state of the pool

		assert.Equal(t, expectedTasks, int(executedTasks), fmt.Sprintf("Should execute %d tasks", expectedTasks))
	})

	t.Run("concurrent tasks add", func(t *testing.T) {
		var (
			executedTaskWG          *sync.WaitGroup
			expectedTasks           = 3000
			expectedConcurrentTasks = 100
		)

		executedTaskWG = &sync.WaitGroup{}

		pool := NewBackgroundTaskPool(expectedConcurrentTasks)

		executedTasks := int32(0)

		// create sample tasks
		for i := 0; i < expectedTasks; i++ {
			executedTaskWG.Add(1) // wg for check concurrent executed tasks
			go func() {
				pool.AddTask(func() {
					atomic.AddInt32(&executedTasks, 1)
					executedTaskWG.Done()
				})
			}()
		}

		executedTaskWG.Wait() // wait for concurrent tasks wg to perform some checks in this state of the pool

		assert.Equal(t, expectedTasks, int(executedTasks), fmt.Sprintf("Should execute %d tasks", expectedTasks))
	})
}

func TestTaskPoolSyncMode(t *testing.T) {
	t.Run("single sync task execution", func(t *testing.T) {
		var (
			expectedTasks           = 3000
			expectedConcurrentTasks = 100
		)

		pool := NewSyncTaskPool(expectedConcurrentTasks)

		executedTasks := int32(0)

		// create sample tasks
		for i := 0; i < expectedTasks; i++ {
			pool.AddTask(func() {
				atomic.AddInt32(&executedTasks, 1)
			})
		}

		pool.Wait() // wait for concurrent tasks wg to perform some checks in this state of the pool

		assert.Equal(t, expectedTasks, int(executedTasks), fmt.Sprintf("Should execute %d tasks", expectedTasks))
	})
	t.Run("sync task execution by blocks", func(t *testing.T) {
		var (
			expectedTasksBlockSize  = 3000
			taskBlocks              = 2
			expectedTasks           = expectedTasksBlockSize * taskBlocks
			expectedConcurrentTasks = 100
		)

		pool := NewSyncTaskPool(expectedConcurrentTasks)

		executedTasks := int32(0)

		for b := 0; b < taskBlocks; b++ {
			// create sample tasks
			for i := 0; i < expectedTasksBlockSize; i++ {
				pool.AddTask(func() {
					atomic.AddInt32(&executedTasks, 1)
				})
			}

			pool.Wait() // wait for concurrent tasks wg to perform some checks in this state of the pool

		}

		assert.Equal(t, expectedTasks, int(executedTasks), fmt.Sprintf("Should execute %d tasks", expectedTasksBlockSize))
	})
}
