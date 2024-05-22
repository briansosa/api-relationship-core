package environment

import "os"

type Manager interface {
	GetEnv(key string) string
	SetEnv(key, value string) error
}

type Environment struct{}

func New() Environment {
	return Environment{}
}

func (environment Environment) GetEnv(key string) string {
	return os.Getenv(key)
}

func (environment Environment) SetEnv(key, value string) error {
	return os.Setenv(key, value)
}

//
// Mock Environment
//

type MockedEnvironment struct {
	env map[string]string
}

func NewMockedEnvironment() MockedEnvironment {
	return MockedEnvironment{env: make(map[string]string)}
}
func (environment MockedEnvironment) GetEnv(key string) string {
	return environment.env[key]
}

func (environment MockedEnvironment) SetEnv(key, value string) error {
	environment.env[key] = value
	return nil
}
