package taskmanager

import (
	"sync"

	"github.com/api-relationship-core/backend/pkg/concurrency"
)

type TaskManager struct {
	initialTaskPool    *concurrency.SyncTaskPool
	operationsTaskPool map[string]*concurrency.TaskPool
}

func NewTaskManager() *TaskManager {
	return &TaskManager{
		operationsTaskPool: make(map[string]*concurrency.TaskPool),
	}
}

func (t *TaskManager) SetInitialOperationPool(maxTasks int) {
	t.initialTaskPool = concurrency.NewSyncTaskPool(maxTasks)
}

func (t *TaskManager) GetInitialOperationPool() *concurrency.SyncTaskPool {
	return t.initialTaskPool
}

func (t *TaskManager) AddOperationPool(operationName string, maxTasks int) {
	t.operationsTaskPool[operationName] = concurrency.NewBackgroundTaskPool(maxTasks)
}

func (t *TaskManager) NewProcessor(operationName string, numberTask int) *Processor {
	wd := sync.WaitGroup{}
	wd.Add(numberTask)
	return &Processor{
		taskPool: t.operationsTaskPool[operationName],
		wd:       &wd,
	}
}

type Processor struct {
	taskPool *concurrency.TaskPool
	wd       *sync.WaitGroup
}

func (p *Processor) AddTask(task concurrency.Task) {
	p.taskPool.AddTask(func() {
		defer p.wd.Done()
		task()
	})
}

func (p *Processor) Wait() {
	p.wd.Wait()
}
