package csv

import (
	"encoding/csv"
	"os"
)

const (
	Delimiter = '|'
)

func ReadCsv(filePath string) ([][]string, error) {
	// open file
	f, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}

	// remember to close the file at the end of the program
	defer f.Close()

	// read csv values using csv.Reader
	csvReader := csv.NewReader(f)
	csvReader.Comma = Delimiter

	records, err := csvReader.ReadAll()
	if err != nil {
		return nil, err
	}

	return records, nil
}
