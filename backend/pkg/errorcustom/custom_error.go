package errorcustom

import (
	"fmt"
)

const (
	ApiCallError                = "error_api_call_operation_%s"
	SaveMemoryError             = "error_save_memory_operation_%s"
	OperationSchemaError        = "error_getting_schema_sub_operation_%s"
	BuildOperationsProcessError = "error_building_operations_process_of_%s"
	SaveHeadersError            = "error_save_headers"
)

type NewErrorCustomFunc func(logID string, err error, tags ...string) *CustomError

// ErrorCustom represents a custom error with additional details.
type CustomError struct {
	LogID        string // Unique identifier for the log entry.
	ErrorMessage string // Error message describing the issue.
	ErrorDetail  string // Additional details about the error.
}

// Error returns the formatted error message.
func (e *CustomError) Error() string {
	return fmt.Sprintf("%s: %s", e.LogID, e.ErrorMessage)
}

// Error returns the formatted error message.
func (e *CustomError) ErrorDetails() string {
	return fmt.Sprintf("%s: %s. %s", e.LogID, e.ErrorMessage, e.ErrorDetail)
}

// NewCustomError creates a new custom error with the provided details.
func newCustomError(logID, errorMessage, errorDetail string) *CustomError {
	return &CustomError{
		LogID:        logID,
		ErrorMessage: errorMessage,
		ErrorDetail:  errorDetail,
	}
}

func NewApiCallError(logID string, err error, tags ...string) *CustomError {
	operation := tags[0]
	return newCustomError(logID, fmt.Sprintf(ApiCallError, operation), err.Error())
}

func NewSaveMemoryError(logID string, err error, tags ...string) *CustomError {
	operation := tags[0]
	return newCustomError(logID, fmt.Sprintf(SaveMemoryError, operation), err.Error())
}

func NewOperationSchemaError(logID string, err error, tags ...string) *CustomError {
	operation := tags[0]
	return newCustomError(logID, fmt.Sprintf(OperationSchemaError, operation), err.Error())
}

func NewBuildOperationsProcessError(logID string, err error, tags ...string) *CustomError {
	operation := tags[0]
	return newCustomError(logID, fmt.Sprintf(BuildOperationsProcessError, operation), err.Error())
}

func NewSaveHeadersError(logID string, err error, tags ...string) *CustomError {
	return newCustomError(logID, SaveHeadersError, err.Error())
}
