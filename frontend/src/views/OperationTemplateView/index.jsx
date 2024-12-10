import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TemplateForm from "../../components/controls/TemplateForm";
import { Layout, Row, Col, Empty, Space, Select, Tabs } from "antd";
import { DatabaseOutlined, SettingOutlined } from '@ant-design/icons';
import EditableTable from "../../components/common/EditableTable";
const { Content } = Layout;
import { GetAllOperationSchema } from "../../../wailsjs/go/handlers/OperationSchemaHandler";

import {
  GetOperationTemplate,
  GetAllKeysOperationTemplates,
} from "../../../wailsjs/go/handlers/OperationTemplateHandler";

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
    console.log("urlParams", urlParams);
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
  };

  useEffect(mount, [urlParams]);

  // Handlers

  function handleSidebarSelect(item) {    
    navigate(
      `/operation_templates/schema/${state.schemaId}/template/${item.id}/edit`
    );
  }

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
        console.log("template", result);
        console.log("templateEntity", templateEntity);
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
            />
          </Content>
        )}
      </Layout>
    </Layout>
  );
}

export default OperationTemplateView;
