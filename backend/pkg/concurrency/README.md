# Concurrency helper

## Summary

This helper is designed to be used as an alternative to make concurrent applications from scratch. In this package you will find a very easy way to apply concurrency to your go application without coding the channel or routine management, leave that responsibility to this package!

### This package was made by one of the best programmers I knew, Jose Miguel Ramirez Sanchez

## Quick Start

To use this package you only have to import it as

```go
    import "github.com/api-relationship-core/backend/pkg/concurrency"
```

And then, you can use the package features inside your application or script

## Features

### **Task Pool**

Task pool is an implementation of [worker pool](https://gobyexample.com/worker-pools) pattern.

There are two main use cases for this package, so far :

- [Execute a group of tasks and wait for all results](#execute-a-group-of-tasks-and-wait-for-all-results)
- [Execute tasks in backgound](#execute-tasks-in-backgound)

# Execute a group of tasks and wait for all results

The next code snippet will show you how to implement a task pool in your code in a sync way (process a bunch of data concurrently and wait for all that tasks to be done)

```go
package concurrency_test

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/api-relationship-core/backend/pkg/concurrency"
)

func ExampleTaskPoolSyncMode() {
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

	pool.Wait() // wait for all task execution

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
```

# Execute tasks in backgound

If you need to execute background tasks you can do it as well with this package:

```go
package concurrency_test

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/api-relationship-core/backend/pkg/concurrency"
)



func ExampleTaskPool() {
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
```
