package process

type Process struct {
	ID               string `json:"id"`
	Name             string `json:"name"`
	FlowID           string `json:"flow_id"`
	FieldsResponseID string `json:"fields_response_id"`
	Input            string `json:"input"`
	Status           string `json:"status"`
	OutputFilename   string `json:"output_filename"`
}
