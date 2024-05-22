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
	    }
	}

}

export namespace process {
	
	export class Process {
	    id: string;
	    name: string;
	    flow: string;
	    flow_id: string;
	    input: string;
	    flow_fields_response: string;
	    fields_response_id: string;
	    status: string;
	    output_filename: string;
	
	    static createFrom(source: any = {}) {
	        return new Process(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.id = source["id"];
	        this.name = source["name"];
	        this.flow = source["flow"];
	        this.flow_id = source["flow_id"];
	        this.input = source["input"];
	        this.flow_fields_response = source["flow_fields_response"];
	        this.fields_response_id = source["fields_response_id"];
	        this.status = source["status"];
	        this.output_filename = source["output_filename"];
	    }
	}

}

