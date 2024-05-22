package http_client

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/api-relationship-core/backend/internal/domain/ports"
	"github.com/api-relationship-core/backend/pkg/io"

	"github.com/gin-gonic/gin"

	httpClientModel "github.com/api-relationship-core/backend/internal/domain/models/http_client"
)

type HttpClientService struct {
	HTTPClient *http.Client
}

// TODO: se debe agregar las options de MaxConnextionPerHost por ejemplo, y armarlo en el new
func NewClientHttp(client *http.Client) ports.HttpClient {
	return &HttpClientService{
		HTTPClient: client,
	}
}

func (service *HttpClientService) DoApiCall(context *gin.Context, httpRequest httpClientModel.ClientHttpRequest) ([]byte, error) {
	request, err := prepareRequest(context, httpRequest)
	if err != nil {
		return nil, err
	}

	if httpRequest.Transport.Timeout != nil {
		service.HTTPClient.Timeout = *httpRequest.Transport.Timeout
	}

	response, err := service.HTTPClient.Do(request)
	if err != nil {
		return nil, err
	}

	responseBytes, err := io.ReadBodyResponse(response)
	if err != nil {
		return nil, err
	}

	return responseBytes, nil
}

func (service *HttpClientService) TestApiCall(context *gin.Context, httpRequest httpClientModel.ClientHttpRequest) (*httpClientModel.ClientHttpResponse, error) {
	request, err := prepareRequest(context, httpRequest)
	if err != nil {
		return nil, err
	}

	if httpRequest.Transport.Timeout != nil {
		service.HTTPClient.Timeout = *httpRequest.Transport.Timeout
	}

	response, err := service.HTTPClient.Do(request)
	if err != nil {
		return nil, err
	}

	responseBytes, err := io.ReadBodyResponse(response)
	if err != nil {
		return nil, err
	}

	result := &httpClientModel.ClientHttpResponse{
		Body: responseBytes,
	}

	return result, nil
}

func (service *HttpClientService) DoApiCallWithResponse(context *gin.Context, httpRequest httpClientModel.ClientHttpRequest, outResponse interface{}) error {
	request, err := prepareRequest(context, httpRequest)
	if err != nil {
		return err
	}

	if httpRequest.Transport.Timeout != nil {
		service.HTTPClient.Timeout = *httpRequest.Transport.Timeout
	}

	response, err := service.HTTPClient.Do(request)
	if err != nil {
		return err
	}

	defer func() {
		err = response.Body.Close()
		// handle err somehow
	}()

	err = json.NewDecoder(response.Body).Decode(outResponse)
	return err
}

func prepareRequest(context *gin.Context, httpRequest httpClientModel.ClientHttpRequest) (*http.Request, error) {
	body := new(bytes.Buffer)
	if httpRequest.Body != nil {
		err := json.NewEncoder(body).Encode(httpRequest.Body)
		if err != nil {
			return nil, err
		}
	}

	method := httpRequest.Transport.Method
	url := httpRequest.Transport.Url

	request, err := http.NewRequest(method, url, body)
	if err != nil {
		return nil, err
	}

	if httpRequest.Transport.Headers != nil && len(*httpRequest.Transport.Headers) != 0 {
		for key, value := range *httpRequest.Transport.Headers {
			valueString, ok := value.(string)
			if ok {
				request.Header.Set(key, valueString)
				continue
			}

			valueString = fmt.Sprintf("%v", value)
			request.Header.Set(key, valueString)
		}
	}

	if httpRequest.Transport.QueryParam != nil && len(*httpRequest.Transport.QueryParam) != 0 {
		queryValues := request.URL.Query()
		for key, value := range *httpRequest.Transport.QueryParam {
			valueString, ok := value.(string)
			if ok {
				queryValues.Add(key, valueString)
				continue
			}

			valueString = fmt.Sprintf("%v", value)
			queryValues.Add(key, valueString)
		}
		request.URL.RawQuery = queryValues.Encode()
	}

	return request, nil
}
