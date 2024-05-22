package jsonmemory

import (
	"errors"
	"fmt"
	"strings"

	"github.com/tidwall/gjson"

	memory_pkg "github.com/api-relationship-core/backend/pkg/memory"
)

/*
	Este paquete jsonmemory proporciona funciones para guardar datos JSON en una estructura de memoria.
	Utiliza la lib gjson para analizar JSON y el paquete "memory" para acceder y modificar la estructura de memoria.
*/

func SavePlaneValue(memory *memory_pkg.Memory, key, value string, replace bool) error {
	if replace {
		memory.Set(key, memory_pkg.SingleMemoryValue{
			Value: value,
		})

		return nil
	}

	oldValue, ok := memory.Get(key)
	if !ok {
		memory.Set(key, memory_pkg.SingleMemoryValue{
			Value: value,
		})

		return nil
	}

	switch v := oldValue.(type) {
	case memory_pkg.SingleMemoryValue:
		multipleMemory := memory_pkg.MultipleMemoryValue{}
		multipleMemory.AddValue(v)
		memory.Set(key, multipleMemory)
	case memory_pkg.MultipleMemoryValue:
		v.AddValue(memory_pkg.SingleMemoryValue{
			Value: value,
		})
		memory.Set(key, v)
	default:
		memory.Set(key, memory_pkg.SingleMemoryValue{
			Value: value,
		})
	}

	return nil
}

// SaveInMemory guarda datos en la memoria según la ruta especificada en el JSON.
// Si la ruta contiene un "#" indica que se espera una lista de valores.
func SaveInMemory(memory *memory_pkg.Memory, operationName, path, json string) error {
	if !gjson.Valid(json) {
		return errors.New("errors trying parse json")
	}

	if !strings.Contains(path, "#") {
		err := saveSimpleValue(memory, operationName, path, json)
		return err
	}

	err := saveMultipleValue(memory, operationName, path, json)
	return err
}

// saveSimpleValue guarda un valor simple en la memoria.
func saveSimpleValue(memory *memory_pkg.Memory, operationName, path, json string) error {
	result := gjson.Get(json, path)
	if !result.Exists() {
		return errors.New("no exists value")
	}

	value := memory_pkg.SingleMemoryValue{
		Value: result.Value(),
	}

	key := GetKey(operationName, path)
	memory.Set(key, value)
	return nil
}

// saveMultipleValue maneja la lógica de guardar una lista de valores en la memoria.
func saveMultipleValue(memory *memory_pkg.Memory, operationName, path, json string) error {
	splitPath := strings.Split(path, "#")
	listCount := len(splitPath) - 1

	if listCount == 1 {
		err := saveSingleList(memory, operationName, path, json)
		return err
	}

	err := saveMultipleLists(memory, operationName, path, json)
	return err
}

// saveSingleList guarda una lista simple en la memoria.
func saveSingleList(memory *memory_pkg.Memory, operationName string, path, json string) error {
	result := gjson.Get(json, path)
	if !result.Exists() {
		return errors.New("no exists value")
	}

	multipleMemory := memory_pkg.MultipleMemoryValue{}

	for _, node := range result.Array() {
		multipleMemory.AddValue(memory_pkg.SingleMemoryValue{
			Value: node.Value(),
		})
	}

	key := GetKey(operationName, path)
	memory.Set(key, multipleMemory)

	return nil
}

// saveMultipleLists maneja la lógica de guardar múltiples listas en la memoria.
func saveMultipleLists(memory *memory_pkg.Memory, operationName string, path, json string) error {
	splitPath := strings.Split(path, "#")

	// Sanitize path
	for index, value := range splitPath {
		splitPath[index] = strings.Trim(value, ".")
	}

	listCount := len(splitPath) - 1
	indexPath := 0
	resultPath := splitPath[indexPath]
	indexPath++

	resultNodes := gjson.Get(json, resultPath)
	if !resultNodes.Exists() {
		return errors.New("no existe valor")
	}

	var multipleMemory memory_pkg.MultipleMemoryValue

	if err := buildMemoryValue(resultNodes, &multipleMemory, listCount, indexPath, splitPath); err != nil {
		return err
	}

	key := GetKey(operationName, path)
	memory.Set(key, multipleMemory)

	return nil
}

// buildMemoryValue construye los valores de memoria recursivamente.
func buildMemoryValue(result gjson.Result, multipleMemory *memory_pkg.MultipleMemoryValue, listCount int, indexPath int, splitPath []string) error {
	result.ForEach(func(key, value gjson.Result) bool {
		if err := buildMemoryValueRecursive(multipleMemory, listCount, indexPath, splitPath, value); err != nil {
			// Interrumpir el bucle si se produce un error
			return false
		}
		return true
	})

	return nil
}

// buildMemoryValueRecursive construye los valores de memoria recursivamente.
func buildMemoryValueRecursive(memoryValue *memory_pkg.MultipleMemoryValue, listCount, indexPath int, path []string, node gjson.Result) error {
	if listCount == indexPath {
		resultPath := path[indexPath]
		resultNode := node.Get(resultPath)
		if !resultNode.Exists() {
			return errors.New("nodo no existe")
		}

		value := memory_pkg.SingleMemoryValue{
			Value: resultNode.Value(),
		}

		memoryValue.AddValue(value)
		return nil
	}

	resultPath := path[indexPath]
	resultNode := node.Get(resultPath)
	if !resultNode.Exists() {
		return errors.New("nodo no existe")
	}

	value := memory_pkg.MultipleMemoryValue{}
	indexPath++
	if err := buildMemoryValue(resultNode, &value, listCount, indexPath, path); err != nil {
		return err
	}

	memoryValue.AddValue(value)
	return nil
}

// GetKey genera una key compuesta por el nombre de la operación y el path para identificar el valor almacenado en la memoria.
func GetKey(operationName, path string) string {
	return fmt.Sprintf("%s@%s", operationName, path)
}
