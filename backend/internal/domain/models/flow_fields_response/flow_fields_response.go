package flowfieldsresponse

type FlowFieldsResponse struct {
	ID             string          `json:"id"`
	FieldsResponse []FieldResponse `json:"fields_response"`
}

type FieldResponse struct {
	OperationName string `json:"operation_name"`
	FieldResponse string `json:"field_response"`
}
