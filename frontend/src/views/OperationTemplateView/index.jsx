import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TemplateForm from "../../components/controls/TemplateForm";
import { Layout, Row, Col, Empty, Space, Select, Tabs } from "antd";
import { DatabaseOutlined, SettingOutlined } from '@ant-design/icons';
import EditableTable from "../../components/common/EditableTable";
import ShortUniqueId from "short-unique-id";
const { Content } = Layout;
import { GetAllOperationSchema } from "../../../wailsjs/go/handlers/OperationSchemaHandler";

import {
  GetOperationTemplate,
  GetAllKeysOperationTemplates,
  InsertOperationTemplate,
  UpdateOperationTemplate,
  DeleteOperationTemplate
} from "../../../wailsjs/go/handlers/OperationTemplateHandler";

import { operationparameter } from "../../../wailsjs/go/models";

import SidebarTemplate from "../../components/common/SidebarTemplate";

function OperationTemplateView() {
  const urlParams = useParams();
  const navigate = useNavigate();

  const entityInit = {
    body: null,
    headers: null,
    id: "",
    method_type: "",
    name: "",
    query_params: null,
    request_type: "",
    schema: null,
    response: null,
    timeout: 0,
    url: "",
    params: [],
  };

  //hooks
  const [state, setState] = useState({
    id: urlParams.id ? urlParams.id : "0",
    mode: urlParams.mode,
    loading: false,
    entity: entityInit,
    listSchemas: [],
    listTemplates: [],
    disable: true,
    showCurlModal: false,
    schemaId: null,
    empty: true,
  });

  const mount = () => {
    if (!urlParams.id && !urlParams.mode) {
      GetAllSchemas();
    }

    if (urlParams.id != "0" && urlParams.mode == "edit") {
      setState((prevState) => ({
        ...prevState,
        id: urlParams.id ? urlParams.id : "0",
        mode: urlParams.mode,
        schemaId: urlParams.schema_id,
        disable: false,
      }));

      GetTemplate(urlParams.id);

    }

    if (urlParams.schema_id && urlParams.mode == "new") {
      NewTemplate(urlParams.schema_id);
    }
  };

  useEffect(mount, [urlParams]);

  // Handlers

  function handleSidebarSelect(item) {    
    navigate(
      `/operation_templates/schema/${state.schemaId}/template/${item.id}/edit`
    );
  }


  const handleOnChangeTemplate = (row) => {
    setState((prevState) => ({
      ...prevState,
      entity: {
        ...row,
      },
    }));
  };

  const handleOnChangeTemplateSidebar = (params) => {
    const paramsArray = Object.entries(params.target.value).map(([name, type]) => ({
      name,
      type
    }));

    setState((prevState) => ({
      ...prevState,
      entity: {
        ...prevState.entity,
        params: paramsArray,
      },
    }));
  };


  const handleOnSaveTemplate = (row) => {
    const data = new operationparameter.OperationParameter({
      id: row.id,
      name: row.name,
      params: row.params,
      url: row.url,
      method_type: row.method_type,
      request_type: row.request_type,
      timeout: row.timeout,
      query_params: row.query_params,
      headers: row.headers,
      body: row.body,
      schema_id: state.schemaId
    });

    UpdateTemplate(data);
  };

  const handleNewTemplate = () => {
    if (state.schemaId) {
      navigate(`/operation_templates/schema/${state.schemaId}/template/new`);
    }
  };

  const handleDeleteTemplate = (template) => {
    DeleteTemplate(template.id);
  };

  // Functions
  function GetAllSchemas() {
    return GetAllOperationSchema()
      .then((result) => {
        setState((prevState) => {
          return {
            ...prevState,
            disable: false,
            listSchemas: result,
          };
        });
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error GetAllOperationSchema");
      });
  }

  function GetAllKeysTemplates(schema) {
    GetAllKeysOperationTemplates(schema.templates_id)
      .then((result) => {
        console.log("result keys", result);
        setState((prevState) => {
          return {
            ...prevState,
            listTemplates: result,
            schemaId: schema.id,
          };
        });
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error GetAllKeysOperationTemplates");
      });
  }

  function GetTemplate(id) {
    const schema = state.listSchemas.find((schema) => schema.id == state.schemaId);

    GetOperationTemplate(id)
      .then((result) => {
        const templateEntity = {
          ...result,
          headers: result.headers || schema.headers,
          body: result.body || schema.body,
          query_params: result.query_params || schema.query_params,
        }
        
        setState((prevState) => {
          return {
            ...prevState,
            entity: templateEntity,
            empty: false,
          };
        });
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error GetOperationTemplate");
      });
  }

  function UpdateTemplate(template) {     
    UpdateOperationTemplate(template)
      .then((result) => {
        GetAllOperationSchema()
          .then((schemas) => {
            const updatedSchema = schemas.find(s => s.id === state.schemaId);
            if (updatedSchema) {
              setState(prevState => ({
                ...prevState,
                listSchemas: schemas
              }));
              
              if (updatedSchema.templates_id && updatedSchema.templates_id.length > 0) {
                GetAllKeysTemplates(updatedSchema);
              }
            }
          });

        const url = `/operation_templates/schema/${state.schemaId}/template/${template.id}/edit`;
        navigate(url);
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error Update Template");
      });
  }

  function NewTemplate(schemaId) {
    const schema = state.listSchemas.find((schema) => schema.id == schemaId);
    const randomId = new ShortUniqueId().rnd();

    const templateEntity = {
      id: randomId,
      schema_id: schema.id,
      name: "New Operation Template",
      params: [],
      headers: schema.headers,
      body: schema.body,
      query_params: schema.query_params,
      method_type: schema.method_type,
      request_type: "json",
      timeout: 30,
      url: schema.url,
    }

    InsertOperationTemplate(templateEntity)
      .then((result) => {
        GetAllOperationSchema()
          .then((schemas) => {
            const updatedSchema = schemas.find(s => s.id === schemaId);
            if (updatedSchema) {
              setState(prevState => ({
                ...prevState,
                listSchemas: schemas
              }));
              
              if (updatedSchema.templates_id && updatedSchema.templates_id.length > 0) {
                GetAllKeysTemplates(updatedSchema);
              }
            }
          });

        const url = `/operation_templates/schema/${state.schemaId}/template/${result.id}/edit`;
        navigate(url);
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error Insert Template");
      });
  }


  function DeleteTemplate(id) {    
    DeleteOperationTemplate(id)
      .then(() => {
        GetAllOperationSchema()
          .then((schemas) => {
            const updatedSchema = schemas.find(s => s.id === state.schemaId);
            if (updatedSchema) {
              setState(prevState => ({
                ...prevState,
                listSchemas: schemas,
                empty: true,
                entity: entityInit
              }));
              
              if (updatedSchema.templates_id && updatedSchema.templates_id.length > 0) {
                GetAllKeysTemplates(updatedSchema);
              } else {
                setState(prevState => ({
                  ...prevState,
                  listTemplates: []
                }));
              }
            }
          });

        const url = `/operation_templates/schema/${state.schemaId}`;
        navigate(url);
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error DELETE Template");
      }); 
  }


  // helpers

  const onChangeSelect = (value) => {
    const schema = state.listSchemas.find((schema) => schema.id == value);
    
    if (!schema) {
      console.error('Schema no encontrado:', value);
      return;
    }

    if (!schema.templates_id || schema.templates_id.length === 0) {
      setState((prevState) => ({
        ...prevState,
        schemaId: schema.id,
        listTemplates: [],
      }));
      return;
    }

    GetAllKeysTemplates(schema);
  };

  const filterOptionSelect = (input, option) => {
    return (option.label ?? "").toLowerCase().includes(input.toLowerCase());
  };


  return (
    <Layout style={{ height: '100%' }}>
      <SidebarTemplate
        schemas={state.listSchemas}
        templates={state.listTemplates}
        parameters={state.entity.params}
        onSchemaSelect={onChangeSelect}
        onTemplateSelect={handleSidebarSelect}
        selectedSchemaId={state.schemaId}
        onParametersChange={handleOnChangeTemplateSidebar}
        onNewTemplate={handleNewTemplate}
        onDeleteTemplate={handleDeleteTemplate}
      />
      <Layout style={{ padding: '24px', background: '#fff' }}>
        {state.empty ? (
          <Space align="center" style={{ height: "100%", width: "100%", justifyContent: "center" }}>
            <Empty description="Selecciona un template para comenzar" />
          </Space>
        ) : (
          <Content style={{ background: "#fff", padding: "24px", borderRadius: "8px" }}>
            <TemplateForm
              entity={state.entity}
              onChange={handleOnChangeTemplate}
              onSave={handleOnSaveTemplate}
            />
          </Content>
        )}
      </Layout>
    </Layout>
  );
}

export default OperationTemplateView;
