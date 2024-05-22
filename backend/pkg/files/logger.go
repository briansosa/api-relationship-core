package files

import (
	"fmt"
	"os"
	"path/filepath"
	"sync"
	"time"

	"github.com/api-relationship-core/backend/pkg/errorcustom"
)

// ErrorLogger represents a logger for writing error messages to a log file.
type ErrorLogger struct {
	outputFile string     // Output file path for writing log messages.
	mu         sync.Mutex // Mutex for ensuring thread safety.
}

// NewErrorLogger creates a new instance of ErrorLogger with the given output file path.
func NewErrorLogger(outputFile string) *ErrorLogger {
	outputPath := GetSchemaPath("output")
	outputFile = filepath.Join(outputPath, fmt.Sprintf("%s.%s", outputFile, "log"))
	return &ErrorLogger{
		outputFile: outputFile,
	}
}

// LogError writes the error message to the log file with additional details.
func (l *ErrorLogger) LogError(customErr *errorcustom.CustomError) error {
	// Acquire the mutex lock to ensure thread safety while writing to the file.
	l.mu.Lock()
	defer l.mu.Unlock()

	// Open the log file in append mode. If the file doesn't exist, create it.
	file, err := os.OpenFile(l.outputFile, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return fmt.Errorf("failed to open log file: %v", err)
	}
	defer file.Close()

	// Format the log message with current timestamp and error details.
	logMessage := fmt.Sprintf("[%s] %s\n", time.Now().Format(time.RFC3339), customErr.ErrorDetails())

	// Write the log message to the file.
	if _, err := file.WriteString(logMessage); err != nil {
		return fmt.Errorf("failed to write to log file: %v", err)
	}

	return nil
}

func (l *ErrorLogger) AsyncLogError(customErr *errorcustom.CustomError) {
	go l.LogError(customErr)
}
