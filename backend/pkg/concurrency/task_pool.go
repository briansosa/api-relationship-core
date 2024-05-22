package concurrency

import (
	"sync"
)

// Task represents an anonymous function that will be executed as a task.
type Task func()

// TaskWithResult is an alias for a function that returns a TaskResult.
type TaskWithResult func() (interface{}, error)

// TaskResult represents the result of a task, which can be a value and/or an error.
type TaskResult struct {
	Result interface{}
	Err    error
}

// TaskPool is the main struct that represents a pool of tasks.
// It keeps all the main configuration about the tasks execution such as max concurrent executions.
type TaskPool struct {
	numberOfWorkers int                 // number of worker goroutines
	queuedTaskCh    chan Task           // channel for regular tasks
	queuedResultCh  chan TaskWithResult // channel for tasks with result
	resultCh        chan TaskResult     // channel for tasks with result
	workerStopCh    chan struct{}       // channel to stop workers
	tasksManager    *sync.WaitGroup     // wait group to manage task count
}

// run starts the main goroutine of the task pool. Once started, the pool will listen for new tasks
// added to the queue to execute them through a worker or queue them, useful for background jobs.
func (tp *TaskPool) run() {
	tp.workerStopCh = make(chan struct{})

	// Start worker goroutines
	for i := 0; i < tp.numberOfWorkers; i++ {
		tp.worker()
	}
}

// AddTask adds a new regular task to the pool. This task could be executed immediately or
// could wait for a free worker to execute it in the future.
func (tp *TaskPool) AddTask(t Task) {
	tp.tasksManager.Add(1) // Increment task count
	go func() {
		tp.queuedTaskCh <- t // Add task to the task channel
	}()
}

// AddTaskWithResult adds a new task with result to the pool.
func (tp *TaskPool) AddTaskWithResult(t TaskWithResult) {
	tp.tasksManager.Add(1) // Increment task count
	go func() {
		tp.queuedResultCh <- t // Add task with result to the result channel
	}()
}

// worker is a method that represents a worker in the task pool.
// It runs in a goroutine and is pending for new tasks in both task and result channels.
func (tp *TaskPool) worker() {
	go func() {
		for {
			select {
			case <-tp.workerStopCh:
				return
			case t := <-tp.queuedTaskCh:
				t()                    // Execute regular task
				tp.tasksManager.Done() // Decrement task count
			case t := <-tp.queuedResultCh:
				value, err := t()                     // Execute task with result
				tp.resultCh <- TaskResult{value, err} // Send result back to result channel
				tp.tasksManager.Done()                // Decrement task count
			}
		}
	}()
}

// SyncTaskPool is a pool that executes its tasks concurrently
// and is able to block the current flow until all added tasks done
type SyncTaskPool struct {
	TaskPool
}

func (sp *SyncTaskPool) Wait() {
	sp.run()
	sp.tasksManager.Wait()
	sp.stopWorkers()
}

// Stops all channels in the pool
func (tp *SyncTaskPool) stopWorkers() {
	if tp.workerStopCh != nil {
		close(tp.workerStopCh)
	}

	if tp.resultCh != nil {
		close(tp.resultCh)
	}
}

// NewBackgroundTaskPool creates a bg task pool that will execute
// tasks in bg without blocking the caller flow
func NewBackgroundTaskPool(maxCocurrentTasks int) *TaskPool {
	tp := newTaskPool(maxCocurrentTasks)
	tp.run()
	return tp
}

// NewSyncTaskPool creates a task pool that have the possibility to
// wait for all tasks to be done blocking the current caler flow until this hapens
func NewSyncTaskPool(maxCocurrentTasks int) *SyncTaskPool {
	tp := newTaskPool(maxCocurrentTasks)
	return &SyncTaskPool{
		*tp,
	}
}

func (tp *SyncTaskPool) WithResult(size int) *SyncTaskPool {
	tp.queuedResultCh = make(chan TaskWithResult)
	tp.resultCh = make(chan TaskResult, size)
	return tp
}

func (tp *SyncTaskPool) ResultData(f func(value interface{}, err error)) {
	for value := range tp.resultCh {
		f(value.Result, value.Err)
	}
}

// Creates a new task pool instance with maxCocurrentTasks as the limit of
// concurrent tasks to be executed.
func newTaskPool(maxCocurrentTasks int) *TaskPool {
	tp := new(TaskPool)

	tp.queuedTaskCh = make(chan Task)
	tp.tasksManager = &sync.WaitGroup{}
	tp.numberOfWorkers = maxCocurrentTasks
	return tp
}
