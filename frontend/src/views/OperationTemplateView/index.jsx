import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CustomSidebar from "../../components/common/CustomSidebar";
import RequestForm from "../../components/controls/RequestForm";
import { Layout, Row, Col, Empty, Space, Select } from "antd";
const { Content } = Layout;
import { GetAllOperationSchema } from "../../../wailsjs/go/handlers/OperationSchemaHandler";

import {
  GetOperationTemplate,
  GetAllKeysOperationTemplates,
} from "../../../wailsjs/go/handlers/OperationTemplateHandler";

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
      `/operation_templates/schema/${state.schemaId}/template/${item.key}/edit`
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
    GetOperationTemplate(id)
      .then((result) => {
        console.log("template", result);
        setState((prevState) => {
          return {
            ...prevState,
            entity: result,
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
    if (schema.templates_id.length == 0) {
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

  const selectSchemaInput = (
    <Select
      showSearch
      placeholder="Select a schema"
      defaultValue={null}
      optionFilterProp="children"
      onChange={onChangeSelect}
      filterOption={filterOptionSelect}
      options={state.listSchemas.map((value) => {
        return { value: value.id, label: value.name };
      })}
    />
  );

  return (
    <>
      <Row style={{ height: "100%" }}>
        <Col style={{ height: "100%" }} span={4}>
          <CustomSidebar
            data={state.listTemplates}
            title="Operation Templates"
            searchMode={true}
            onSelect={handleSidebarSelect}
            headerExtraRow={selectSchemaInput}
          />
        </Col>
        <Col span={20} style={{ height: "100%" }}>
          {state.empty ? (
            <Space align={"center"} style={{ height: "100%" }}>
              <Content>
                <Empty></Empty>
              </Content>
            </Space>
          ) : (
            <>
              <Row>
                <Content>
                  <RequestForm
                    entity={state.entity}
                    // onConfirm={handleSubmit}
                  />
                </Content>
              </Row>
              <Row>
                <div>AAAA</div>
              </Row>
            </>
          )}
        </Col>
      </Row>
    </>
  );
}

export default OperationTemplateView;
