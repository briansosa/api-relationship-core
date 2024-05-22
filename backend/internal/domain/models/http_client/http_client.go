package httpclient

import "time"

type ClientHttpRequest struct {
	Transport Transport
	Body      interface{}
}

type ClientHttpResponse struct {
	Body []byte
}

type Transport struct {
	Url            string
	Method         string
	Timeout        *time.Duration
	Elapsed        *float64
	Headers        *map[string]interface{}
	QueryParam     *map[string]interface{}
	Authentication *Auth
}

type Auth struct {
	Username string
	Password string
}
