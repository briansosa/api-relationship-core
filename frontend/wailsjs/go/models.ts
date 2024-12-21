export namespace file {
	
	export class FileOutput {
	
	
	    static createFrom(source: any = {}) {
	        return new FileOutput(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	
	    }
	}

}

export namespace flow {
	
	export class RelationField {
	    type: string;
	    parent_field: string;
	    child_parameter: string;
	
	    static createFrom(source: any = {}) {
	        return new RelationField(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.type = source["type"];
	        this.parent_field = source["parent_field"];
	        this.child_parameter = source["child_parameter"];
	    }
	}
	export class Flow {
	    id: string;
	    operation_schema_id: string;
	    name: string;
	    max_concurrency: number;
	    search_type: string;
	    relation_fields: RelationField[];
	    relation_operations: Flow[];
	    fields_response_id: string[];
	
	    static createFrom(source: any = {}) {
	        return new Flow(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.operation_schema_id = source["operation_schema_id"];
	        this.name = source["name"];
	        this.max_concurrency = source["max_concurrency"];
	        this.search_type = source["search_type"];
	        this.relation_fields = this.convertValues(source["relation_fields"], RelationField);
	        this.relation_operations = this.convertValues(source["relation_operations"], Flow);
	        this.fields_response_id = source["fields_response_id"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace flowfieldsresponse {
	
	export class FieldResponse {
	    operation_name: string;
	    field_response: string;
	
	    static createFrom(source: any = {}) {
	        return new FieldResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.operation_name = source["operation_name"];
	        this.field_response = source["field_response"];
	    }
	}
	export class FlowFieldsResponse {
	    id: string;
	    name: string;
	    flow_id: string;
	    fields_response: FieldResponse[];
	
	    static createFrom(source: any = {}) {
	        return new FlowFieldsResponse(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.flow_id = source["flow_id"];
	        this.fields_response = this.convertValues(source["fields_response"], FieldResponse);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace operation {
	
	export class Operation {
	    id?: string;
	    name?: string;
	    url?: string;
	    method_type?: string;
	    request_type?: string;
	    timeout?: number;
	    query_params?: {[key: string]: any};
	    headers?: {[key: string]: any};
	    body?: number[];
	    response?: number[];
	    schema?: number[];
	    templates_id?: string[];
	
	    static createFrom(source: any = {}) {
	        return new Operation(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.url = source["url"];
	        this.method_type = source["method_type"];
	        this.request_type = source["request_type"];
	        this.timeout = source["timeout"];
	        this.query_params = source["query_params"];
	        this.headers = source["headers"];
	        this.body = source["body"];
	        this.response = source["response"];
	        this.schema = source["schema"];
	        this.templates_id = source["templates_id"];
	    }
	}

}

export namespace operationparameter {
	
	export class Parameters {
	    name: string;
	    type: string;
	
	    static createFrom(source: any = {}) {
	        return new Parameters(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.type = source["type"];
	    }
	}
	export class OperationParameter {
	    id?: string;
	    schema_id?: string;
	    name?: string;
	    params?: Parameters[];
	    url?: string;
	    method_type?: string;
	    request_type?: string;
	    timeout?: number;
	    query_params?: {[key: string]: any};
	    headers?: {[key: string]: any};
	    body?: number[];
	
	    static createFrom(source: any = {}) {
	        return new OperationParameter(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.schema_id = source["schema_id"];
	        this.name = source["name"];
	        this.params = this.convertValues(source["params"], Parameters);
	        this.url = source["url"];
	        this.method_type = source["method_type"];
	        this.request_type = source["request_type"];
	        this.timeout = source["timeout"];
	        this.query_params = source["query_params"];
	        this.headers = source["headers"];
	        this.body = source["body"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

export namespace process {
	
	export class Process {
	    id: string;
	    name: string;
	    flow_id: string;
	    fields_response_id: string;
	    input: string;
	    status: string;
	    output_filename: string;
	
	    static createFrom(source: any = {}) {
	        return new Process(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.flow_id = source["flow_id"];
	        this.fields_response_id = source["fields_response_id"];
	        this.input = source["input"];
	        this.status = source["status"];
	        this.output_filename = source["output_filename"];
	    }
	}

}

