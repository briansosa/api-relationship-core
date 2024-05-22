package files

import (
	"bufio"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strconv"
	"strings"

	"github.com/api-relationship-core/backend/pkg/memory"
)

/*
	Este punto es importante para rendimiento, porque tengo varias opciones en como encararlo:
	1. Crear una variable que sea una lista de memory y después al final del procesamiento guardar ese listado en un archivo
		-> Esto sobrecarga la memoria si pienso trabajar con muchisimos datos, pero es más rápida porque no tengo que leer todo el tiempo
	2. Crear un archivo de output y por cada memory generado, voy sobreescribiendo el archivo
		-> Es menos eficiente en tema tiempos y rendimiento, pero voy a ganar más capacidad de memoria, lo cual es importante.
	3. Buscar opciones mixtas, tipo usar un cache y alguna que otra técnica para optimización de lectura/escritura

	En este caso, voy a ir por la 2 por ahora, ya que por la esencia del flujo de Process, va a demorar algún tiempo y es ideal
	que cuando se use, piensen que sea un proceso en off.

	Voy a dejar un warning acá, cuando se tenga go routines hay que verificar bien como se comporta. Capaz haya que haber un
	manejador de go routines que vaya leyendo, y también considerar de que ahora esta escribiendo de uno en uno, capaz
	se puede hacer por lotes para optimizar los recursos.
*/

func SaveMemoryInFile(filename string, memory memory.Memory) error {
	outputPath := GetSchemaPath("output")
	outputPath = filepath.Join(outputPath, fmt.Sprintf("%s.%s", filename, "json"))

	// Abre el archivo para escritura, crea uno si no existe
	file, err := os.OpenFile(outputPath, os.O_RDWR|os.O_CREATE, 0666)
	if err != nil {
		return fmt.Errorf("error al crear el archivo: %v", err)
	}

	defer file.Close()

	// Si el archivo está vacío, escribe el corchete de apertura de la lista
	fi, err := file.Stat()
	if err != nil {
		return fmt.Errorf("error al obtener información del archivo: %v", err)
	}

	if fi.Size() == 0 {
		_, err = file.WriteString("[\n")
		if err != nil {
			return fmt.Errorf("error al escribir el inicio del archivo: %v", err)
		}
	} else {
		// Mueve el puntero al anteultimo caracter del archivo
		_, err = file.Seek(-2, 2)
		if err != nil {
			return fmt.Errorf("error al mover el puntero del archivo: %v", err)
		}

		_, err = file.WriteString(",\n")
		if err != nil {
			return fmt.Errorf("error al escribir separador en el archivo: %v", err)
		}
	}

	// SetIndent hace que el json no esté colapsado. Evaluar si es necesario a futuro
	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "    ")
	err = encoder.Encode(memory)
	if err != nil {
		return fmt.Errorf("error al escribir el resultado en el archivo: %v", err)
	}

	_, err = file.WriteString("]")
	if err != nil {
		return fmt.Errorf("error al escribir el final del archivo: %v", err)
	}

	// Flush para asegurar que los datos se escriben en disco
	err = file.Sync()
	if err != nil {
		return fmt.Errorf("error al sincronizar el archivo: %v", err)
	}

	return nil
}

func ConvertOutputJsonToCsv(filename string) error {
	outputPath := GetSchemaPath("output")
	jsonOutputPath := filepath.Join(outputPath, fmt.Sprintf("%s.%s", filename, "json"))

	// Abrir el archivo JSON
	file, err := os.Open(jsonOutputPath)
	if err != nil {
		return fmt.Errorf("Error al abrir el archivo:", err)
	}
	defer file.Close()

	// Crear un lector de bufio para leer el archivo línea por línea
	reader := bufio.NewReader(file)

	// Crear un archivo CSV
	csvOutputPath := filepath.Join(outputPath, fmt.Sprintf("%s.%s", filename, "csv"))
	outputFile, err := os.Create(csvOutputPath)
	if err != nil {
		return fmt.Errorf("Error al crear el archivo CSV:", err)
	}
	defer outputFile.Close()

	// Crear un objeto csv.Writer
	writerCsv := csv.NewWriter(outputFile)
	writerCsv.Comma = '|'
	defer writerCsv.Flush()

	// Expresión regular para encontrar propiedades en formato JSON
	regexProperties := regexp.MustCompile(`"([^"]+)":`)
	var jsonRecord string
	var headers []string
	var isFirstObject = true

	for {
		// Leer una línea del archivo
		line, err := reader.ReadString('\n')
		if err != nil && err != io.EOF {
			return fmt.Errorf("Error al leer del archivo:", err)
		}

		// Salir del bucle si llegamos al final del archivo
		if err == io.EOF {
			break
		}

		trimLine := strings.TrimSpace(line)
		// Si comienza con "{" significa que va a empezar un nuevo obj JSON
		if trimLine == "{" {
			jsonRecord = trimLine
			continue
		}

		if trimLine == "}" || trimLine == "}," {
			// aca va la logica que tiene que ir para convertirlo a csv y guardarlo
			if isFirstObject {
				isFirstObject = false
				err = writeHeadersInCSV(writerCsv, headers)
				if err != nil {
					// TODO: handler error
					return err
				}
			}

			jsonRecord += "}"

			err = JSONToCSV(writerCsv, jsonRecord, headers)
			if err != nil {
				// TODO: handler error
				return err
			}

			if trimLine == "}" {
				break
			}

			// Vaciamos el objeto json para continuar con el siguiente y no ocupar espacio en memoria
			jsonRecord = ""
			continue
		}

		if isFirstObject {
			match := regexProperties.FindStringSubmatch(trimLine)
			if len(match) > 0 {
				headers = append(headers, match[1])
			}
		}

		jsonRecord += trimLine
	}

	return nil
}

func writeHeadersInCSV(writer *csv.Writer, headers []string) error {
	err := writer.Write(headers)
	if err != nil {
		return fmt.Errorf("Error al escribir los headers en el archivo CSV:", err)
	}

	return nil
}

func JSONToCSV(writer *csv.Writer, jsonRecord string, headers []string) error {
	var data map[string]interface{}

	err := json.Unmarshal([]byte(jsonRecord), &data)
	if err != nil {
		return fmt.Errorf("Error al decodificar el objeto JSON:", err)
	}

	var values []string

	for _, key := range headers {
		value := data[key]

		// Convertir el valor a string
		var strValue string
		switch v := value.(type) {
		case float64:
			strValue = strconv.FormatFloat(v, 'f', -1, 64)
		case int:
			strValue = strconv.Itoa(v)
		case string:
			strValue = v
		case []interface{}:
			// TODO: tengo que buscar en los convertidores de json to csv onlines que opciones tienen así me hago
			// 		 la idea de como hacer esas funcionalidades en este punto
			// Si el valor es un array, unir sus elementos por un determinado metodo.
			strValue = strings.Join(sliceToStringSlice(v), ";")
		default:
			strValue = ""
		}

		values = append(values, strValue)
	}

	err = writer.Write(values)
	if err != nil {
		return fmt.Errorf("Error al escribir en el archivo CSV:", err)
	}

	return nil
}

// Función auxiliar para convertir una interfaz a una lista de strings
func sliceToStringSlice(slice []interface{}) []string {
	var result []string
	for _, v := range slice {
		result = append(result, fmt.Sprint(v))
	}
	return result
}

// func JSONToCSV(jsonData io.Reader) ([]byte, error) {
// 	// Crear un decoder JSON para leer el JSON de forma incremental
// 	decoder := json.NewDecoder(jsonData)

// 	// Leer y decodificar el primer objeto JSON para obtener las cabeceras
// 	var firstRow map[string]interface{}
// 	if err := decoder.Decode(&firstRow); err != nil {
// 		return nil, err
// 	}

// 	// Ordenar las cabeceras alfabéticamente
// 	var sortedHeaders []string
// 	for header := range firstRow {
// 		sortedHeaders = append(sortedHeaders, header)
// 	}
// 	sort.Strings(sortedHeaders)

// 	// Crear un buffer para escribir el CSV
// 	var csvBuffer bytes.Buffer
// 	writer := csv.NewWriter(&csvBuffer)

// 	// Escribir las cabeceras al CSV
// 	if err := writer.Write(sortedHeaders); err != nil {
// 		return nil, err
// 	}

// 	// Escribir los datos del primer objeto JSON al CSV
// 	var firstRowValues []string
// 	for _, header := range sortedHeaders {
// 		value := fmt.Sprintf("%v", firstRow[header]) // Convertir el valor a string
// 		firstRowValues = append(firstRowValues, value)
// 	}
// 	if err := writer.Write(firstRowValues); err != nil {
// 		return nil, err
// 	}

// 	// Decodificar y escribir las filas de datos restantes del JSON al CSV
// 	for decoder.More() {
// 		var row map[string]interface{}
// 		if err := decoder.Decode(&row); err != nil {
// 			return nil, err
// 		}

// 		var csvRow []string
// 		for _, header := range sortedHeaders {
// 			value := fmt.Sprintf("%v", row[header]) // Convertir el valor a string
// 			csvRow = append(csvRow, value)
// 		}
// 		if err := writer.Write(csvRow); err != nil {
// 			return nil, err
// 		}
// 	}

// 	// Flushear y obtener los datos del buffer
// 	writer.Flush()
// 	if err := writer.Error(); err != nil {
// 		return nil, err
// 	}

// 	return csvBuffer.Bytes(), nil
// }
