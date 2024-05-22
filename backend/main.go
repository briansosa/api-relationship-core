package main

import (
	"github.com/api-relationship-core/backend/cmd/dependencies"
	"github.com/api-relationship-core/backend/cmd/startup"
)

func main() {
	// // Start tracing
	// traceFile, err := os.Create("trace.out")
	// if err != nil {
	// 	panic(err)
	// }
	// defer traceFile.Close()

	// if err := trace.Start(traceFile); err != nil {
	// 	panic(err)
	// }
	// defer trace.Stop()

	definition := dependencies.NewByEnvironment()
	startup.Script(definition)
}
