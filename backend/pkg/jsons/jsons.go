package jsons

import "encoding/json"

func ParseJson[T any](bytes []byte) (*T, error) {
	out := new(T)
	err := json.Unmarshal(bytes, out)
	if err != nil {
		return nil, err
	}

	return out, nil
}
