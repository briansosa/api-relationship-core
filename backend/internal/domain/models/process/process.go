package process

type Process struct {
	ID                string `json:"id"`
	Name              string `json:"name"`
	Flow              string `json:"flow"`
	FlowID            string `json:"flow_id"`
	Input             string `json:"input"`
	FlowFieldResponse string `json:"flow_fields_response"`
	FieldsResponseID  string `json:"fields_response_id"`
	Status            string `json:"status"`
	OutputFilename    string `json:"output_filename"`
}
