package sequence

import (
	"fmt"

	gonanoid "github.com/matoous/go-nanoid/v2"
)

// SequenceService represents a client for generating unique sequence IDs.
type SequenceService struct{}

// NewSequenceService creates a new instance of SequenceService.
func NewSequenceService() *SequenceService {
	return &SequenceService{}
}

// GetID generates a new unique ID.
func (sc *SequenceService) GetID() (string, error) {
	id, err := gonanoid.New()
	if err != nil {
		return "", fmt.Errorf("failed to generate ID: %v", err)
	}

	return id, nil
}
