package jsonmemory

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/api-relationship-core/backend/pkg/memory"
)

const jsonSingleResponse = `{
	"locations":
		{
			"name": "test",
			"sub_locations": [
				{
					"sub_location_name": "sub_location_1"
				},
				{
					"sub_location_name": "sub_location_2"
				}
			]
		}
}`

const jsonMultipleResponse = `{
	"locations": [
		{
			"name": "test"
		},
		{
			"name": "test_2"
		}
	]
}`

const jsonMultiplesListsResponse = `{
	"locations": [
		{
			"name": "test",
			"sub_locations": [
				{
					"sub_location_name": "sub_location_1"
				},
				{
					"sub_location_name": "sub_location_2"
				}
			]
		},
		{
			"name": "test_5",
			"sub_locations": [
				{
					"sub_location_name": "sub_location_5"
				}
			]
		}
	]
}`

func TestSingleResponse(t *testing.T) {
	// Crear un mapa para almacenar los valores de memoria
	memoryMap := memory.NewMemory()

	err := SaveInMemory(&memoryMap, "teste", "locations.name", jsonSingleResponse)
	require.Nil(t, err)

	expectedKey := fmt.Sprintf("%s@%s", "teste", "locations.name")
	result, resultOk := memoryMap.Get(expectedKey)
	assert.True(t, resultOk)
	assert.Equal(t, "test", result.GetValue())
}

func TestListResponse(t *testing.T) {
	// Crear un mapa para almacenar los valores de memoria
	memoryMap := memory.NewMemory()

	err := SaveInMemory(&memoryMap, "teste", "locations.#.name", jsonMultipleResponse)
	require.Nil(t, err)

	expectedKey := fmt.Sprintf("%s@%s", "teste", "locations.#.name")
	result, resultOk := memoryMap.Get(expectedKey)
	assert.True(t, resultOk)

	resultValues := result.GetValue()
	assert.EqualValues(t, []interface{}{"test", "test_2"}, resultValues)
}

func TestMultipleListsResponse(t *testing.T) {
	// Crear un mapa para almacenar los valores de memoria
	memoryMap := memory.NewMemory()

	err := SaveInMemory(&memoryMap, "teste", "locations.#.sub_locations.#.sub_location_name", jsonMultiplesListsResponse)
	require.Nil(t, err)

	expectedKey := fmt.Sprintf("%s@%s", "teste", "locations.#.sub_locations.#.sub_location_name")
	result, resultOk := memoryMap.Get(expectedKey)
	assert.True(t, resultOk)

	resultValues := result.GetValue()
	assert.EqualValues(t, []interface{}{"sub_location_1", "sub_location_2", "sub_location_5"}, resultValues)
}
