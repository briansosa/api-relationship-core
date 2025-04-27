import React, { useState, useEffect } from "react";
import { useForm } from "../../../../components/hooks/useForm";
import { Input } from "../../../../components/ui/input";
import { Textarea } from "../../../../components/ui/textarea";
import { Button } from "../../../../components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../../../../components/ui/select";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "../../../../components/ui/tabs";

const RequestForm = (props) => {
  const entityInit = {
    body: "",
    headers: null,
    method_type: "",
    name: "",
    query_params: null,
    request_type: "",
    timeout: 0,
    url: "",
    templates_id: [],
  };

  const [state, setState] = useState({
    entity: entityInit,
    selectedTab: "body",
  });

  const [editName, setEditName] = useState(false);

  const [formValues, formHandle, , formSet] = useForm({
    ...entityInit,
  });

  const mount = () => {
    setState((prevState) => {
      return { ...prevState, entity: props.entity };
    });

    formSet({
      body: (props.entity.body && props.entity.body != null) 
        ? JSON.stringify(props.entity.body, null, 2) 
        : "",
      headers: props.entity.headers ?? {},
      method_type: props.entity.method_type != "" ? props.entity.method_type : "GET",
      name: props.entity.name != "" ? props.entity.name : "Nueva Operación Schema",
      query_params: props.entity.query_params ?? {},
      request_type: props.entity.request_type,
      timeout: props.entity.timeout,
      url: props.entity.url,
      templates_id: props.entity.templates_id ?? []
    });
  };
  
  useEffect(mount, [props.entity]);

  // Manejadores
  const handleTabChange = (value) => {
    setState((prevState) => ({ ...prevState, selectedTab: value }));
  };

  const handleSubmit = () => {
    // Validación del formulario pendiente

    const row = {
      body: formValues.body && formValues.body.trim() !== "" 
        ? JSON.parse(formValues.body) 
        : null,
      headers: Object.keys(formValues.headers).length === 0 ? null : formValues.headers,
      method_type: formValues.method_type,
      name: formValues.name,
      query_params: Object.keys(formValues.query_params).length === 0 ? null : formValues.query_params,
      request_type: formValues.request_type,
      timeout: formValues.timeout,
      url: formValues.url,
      templates_id: formValues.templates_id,
    };

    props.onConfirm(row);
  };
  
  const handleMethodChange = (value) => {
    const event = {
      target: {
        name: "method_type",
        value: value,
      },
    };
    formHandle(event);
  };

  return (
    <div className="space-y-4">
      <div>
        {editName ? (
          <Input
            value={formValues.name}
            onChange={formHandle}
            name="name"
            onKeyDown={(e) => e.key === 'Enter' && setEditName(false)}
            onBlur={() => setEditName(false)}
            autoFocus
            className="text-xl font-semibold"
          />
        ) : (
          <h2 
            className="text-xl font-semibold cursor-pointer" 
            onDoubleClick={() => setEditName(true)}
          >
            {formValues.name}
          </h2>
        )}
      </div>
      
      <div className="flex space-x-2">
        <div className="w-1/4">
          <Select 
            value={formValues.method_type} 
            onValueChange={handleMethodChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="GET" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET">GET</SelectItem>
              <SelectItem value="POST">POST</SelectItem>
              <SelectItem value="PUT">PUT</SelectItem>
              <SelectItem value="PATCH">PATCH</SelectItem>
              <SelectItem value="DELETE">DELETE</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="w-3/4 flex space-x-2">
          <Input
            placeholder="https://ejemplo.com/api/v1/test-api"
            name="url"
            value={formValues.url || ""}
            onChange={formHandle}
            className="flex-grow"
          />
          
          <Button type="submit" onClick={handleSubmit}>
            Enviar
          </Button>
        </div>
      </div>
      
      <Tabs value={state.selectedTab} onValueChange={handleTabChange}>
        <TabsList className="w-full">
          <TabsTrigger value="body" className="flex-1">Body</TabsTrigger>
          <TabsTrigger value="headers" className="flex-1">Headers</TabsTrigger>
          <TabsTrigger value="queryParams" className="flex-1">Query Params</TabsTrigger>
        </TabsList>
        
        <TabsContent value="body" className="p-0 mt-4">
          <Textarea
            className="min-h-[65vh] font-mono"
            name="body"
            value={formValues.body || ""}
            onChange={formHandle}
          />
        </TabsContent>
        
        <TabsContent value="headers" className="p-0 mt-4">
          {/* Implementar EditableTable para headers - Pendiente */}
          <div className="min-h-[65vh] bg-gray-50 rounded-md p-4 border border-gray-200">
            <p className="text-gray-500 text-center">
              Tabla de Headers (Pendiente de implementación)
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="queryParams" className="p-0 mt-4">
          {/* Implementar EditableTable para query params - Pendiente */}
          <div className="min-h-[65vh] bg-gray-50 rounded-md p-4 border border-gray-200">
            <p className="text-gray-500 text-center">
              Tabla de Query Params (Pendiente de implementación)
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RequestForm; 