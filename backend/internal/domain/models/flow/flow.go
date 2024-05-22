package flow

type Flow struct {
	ID                 string          `json:"id"`
	OperationSchemaID  string          `json:"operation_schema_id"`
	Name               string          `json:"name"`
	MaxConcurrency     int             `json:"max_concurrency"`
	SearchType         string          `json:"search_type"`
	RelationFields     []RelationField `json:"relation_fields"`
	RelationOperations []Flow          `json:"relation_operations"`
}

type RelationField struct {
	Type           string `json:"type"`
	ParentField    string `json:"parent_field"`
	ChildParameter string `json:"child_parameter"`
}
