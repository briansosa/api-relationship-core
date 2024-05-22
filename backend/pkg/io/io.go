package io

import (
	"bytes"
	"io"
	"net/http"
)

func ReadBodyResponse(response *http.Response) ([]byte, error) {
	body, err := io.ReadAll(response.Body)
	if err == nil {
		response.Body = io.NopCloser(bytes.NewBuffer(body))
	}

	return body, err
}

func ReadBodyRequest(request *http.Request) ([]byte, error) {
	body, err := io.ReadAll(request.Body)
	if err == nil {
		request.Body = io.NopCloser(bytes.NewBuffer(body))
	}

	return body, err
}
