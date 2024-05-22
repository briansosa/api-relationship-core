package memory

import (
	"bytes"
	"encoding/json"
	"fmt"
	"sync"
)

/*
En la memoria tengo que tener estas posibilidades:
1) Poder guardar un valor interface
2) Tener una key facil de que la pueda usar desde operaciones en la recursividad
3) Permitir usarse en go routines sin que se rompa
4) Ver si su formato se puede relacional con el resultado final esperado por el usuario
5) Tener una cadena de nombre de operaciones por si se vuelve a llamar la misma operacion pero a niveles recursivos
*/

type MemoryValue interface {
	GetValue() interface{}
}

type SingleMemoryValue struct {
	Value interface{}
}

func (s SingleMemoryValue) GetValue() interface{} {
	return s.Value
}

type MultipleMemoryValue []MemoryValue

func (m MultipleMemoryValue) GetValue() interface{} {
	var results []interface{}
	for _, value := range m {
		switch v := value.(type) {
		case SingleMemoryValue:
			// Si es un SingleMemoryValue, simplemente agregamos su valor a los resultados.
			results = append(results, v.GetValue())
		case MultipleMemoryValue:
			// Si es un MultipleMemoryValue, llamamos recursivamente a GetValue() para obtener sus valores y hacer un merge de los resultados
			subValues := v.GetValue().([]interface{})
			results = append(results, subValues...)
			// default:
			// 	// Si el tipo no es reconocido, imprime el tipo de dato
			// 	fmt.Printf("Tipo no reconocido: %T\n", value)
		}
	}

	return results
}

func (s *MultipleMemoryValue) AddValue(value MemoryValue) {
	*s = append(*s, value)
}

type Memory struct {
	keys   []string
	memory map[string]MemoryValue
	mutex  *sync.Mutex
}

func NewMemory() Memory {
	return Memory{
		keys:   []string{},
		memory: map[string]MemoryValue{},
		mutex:  &sync.Mutex{},
	}
}

func (m Memory) Get(key string) (MemoryValue, bool) {
	value, ok := m.memory[key]
	return value, ok
}

func (m *Memory) Set(key string, value MemoryValue) {
	m.mutex.Lock()
	defer m.mutex.Unlock()
	_, ok := m.memory[key]
	if !ok {
		m.keys = append(m.keys, key)
	}
	m.memory[key] = value
}

func (m *Memory) GetValuesFromKey(key string) ([]interface{}, bool) {
	valueFromKey, ok := m.Get(key)
	if !ok {
		return nil, false
	}

	value := valueFromKey.GetValue()
	values, isMultiple := value.([]interface{})
	if !isMultiple {
		return []interface{}{values}, true
	}

	return values, true
}

func (m Memory) MarshalJSON() ([]byte, error) {
	var buf bytes.Buffer
	buf.WriteByte('{')

	needComma := false

	for _, k := range m.keys {
		if needComma {
			buf.WriteByte(',')
		} else {
			needComma = true
		}

		// Add key to json buffer
		buf.WriteString(fmt.Sprintf("\"%s\":", k))
		value := m.memory[k]

		switch v := value.(type) {
		case SingleMemoryValue:
			// if a SingleMemoryValue, add value to JSON buffer
			if err := json.NewEncoder(&buf).Encode(v.Value); err != nil {
				return nil, err
			}
		case MultipleMemoryValue:
			// if a MultipleMemoryValue, add values to JSON buffer like an array
			buf.WriteByte('[')
			for i, val := range v {
				if i > 0 {
					buf.WriteByte(',')
				}
				if err := json.NewEncoder(&buf).Encode(val.GetValue()); err != nil {
					return nil, err
				}
			}
			buf.WriteByte(']')
		default:
			buf.WriteString("null") // Write "null" for nil values
		}

	}

	buf.WriteByte('}')
	return buf.Bytes(), nil
}
