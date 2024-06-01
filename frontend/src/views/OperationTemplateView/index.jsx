import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Layout,
  Row,
  Col,
  Empty,
  Space,
  Divider,
  Button,
  Card,
  Select,
} from "antd";
import ShortUniqueId from "short-unique-id";
const { Content } = Layout;
import {
  GetAllOperationSchema,
  UpdateOperationSchema,
  TestRequest,
  GetOperationSchema,
  InsertOperationSchema,
  DeleteOperationSchema,
} from "../../../wailsjs/go/handlers/OperationSchemaHandler";
import { operation } from "../../../wailsjs/go/models";

import RequestForm from "../../components/controls/RequestForm";
import JsonViewer from "../../components/common/JsonViewer";
import CustomSidebar from "../../components/common/CustomSidebar";
import Loading from "../../components/common/Loading";
import CurlModal from "../../components/controls/CurlModal";

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
    disable: true,
    showCurlModal: false,
    schemaId: null,
    empty: true,
  });

  const mount = () => {
    console.log(urlParams);
    if (!urlParams.id && !urlParams.mode) {
      GetAllSchemas();
      console.log("no hay params");
    }

    if (urlParams.id != "0" && urlParams.mode == "edit") {
      setState((prevState) => ({
        ...prevState,
        id: urlParams.id ? urlParams.id : "0",
        mode: urlParams.mode,
        disable: false,
      }));

      GetSchema(urlParams.id);
    }

    if (urlParams.mode == "new") {
      const randomId = new ShortUniqueId().rnd();
      setState((prevState) => ({
        ...prevState,
        id: randomId,
        mode: urlParams.mode,
        disable: false,
      }));

      InsertSchema({
        id: randomId,
        name: "New Operation Schema",
        timeout: 30,
        request_type: "json",
      });
    }

    // GetAllSchemas();
  };

  useEffect(mount, [urlParams]);

  // Handlers

  function handleSidebarSelect(item) {
    navigate(`/operation_schemas/edit/${item.key}`);
  }

  const handleSaveSchema = () => {
    // TODO: validate form

    const data = new operation.Operation({
      body: state.entity.body,
      headers: state.entity.headers,
      id: state.id,
      method_type: state.entity.method_type,
      name: state.entity.name,
      query_params: state.entity.query_params,
      request_type: state.entity.request_type,
      response: state.entity.response,
      timeout: state.entity.timeout != 0 ? state.entity.timeout : 30,
      url: state.entity.url,
    });

    UpdateSchema(data);
  };

  const handleDelete = (item) => {
    DeleteSchema(item.id);
  };

  const handleSubmit = (row) => {
    // TODO: validate form

    setState((prevState) => ({
      ...prevState,
      entity: {
        ...row,
      },
    }));

    TestOperation(row);
  };

  const handleAddSchema = () => {
    navigate(`/operation_schemas/new`);
  };

  const handleClickSchemaFromCurl = () => {
    setState((prevState) => ({ ...prevState, showCurlModal: true }));
  };

  const handleAddSchemaFromCurl = (curlJson) => {
    setState((prevState) => ({ ...prevState, showCurlModal: false }));

    const randomId = new ShortUniqueId().rnd();
    const data = new operation.Operation({
      id: randomId,
      timeout: 30,
      name: "New Operation Schema",
      request_type: "json",
      url: curlJson.url,
      method_type: curlJson.method_type,
      body: curlJson.body,
      headers: curlJson.headers,
      query_params: curlJson.query_params,
    });

    InsertSchema(data);
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

  function GetSchema(id) {
    GetOperationSchema(id)
      .then((result) => {
        setState((prevState) => {
          return {
            ...prevState,
            entity: result,
          };
        });
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error GetOperationSchema");
      });
  }

  function UpdateSchema(item) {
    UpdateOperationSchema(item)
      .then(() => {
        const url = `/operation_schemas/edit/${state.id}`;
        navigate(url);
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error UpdateSchema");
      });
  }

  function InsertSchema(schema) {
    InsertOperationSchema(schema)
      .then((result) => {
        const url = `/operation_schemas/edit/${result.id}`;
        navigate(url);
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error Insert Schema");
      });
  }

  function TestOperation(data) {
    setState((prevState) => {
      return { ...prevState, loading: true };
    });

    TestRequest(data)
      .then((result) => {
        setState((prevState) => {
          return {
            ...prevState,
            loading: false,
            entity: { ...prevState.entity, response: result },
          };
        });
      })
      .catch((error) => {
        setState((prevState) => {
          return {
            ...prevState,
            loading: false,
          };
        });
        console.log("error test operation", error);
        alert("error TestOperation");
      });
  }

  function DeleteSchema(id) {
    DeleteOperationSchema(id)
      .then(() => {
        const url = `/operation_schemas`;
        navigate(url);
      })
      .catch((error) => {
        console.log("Llego ERROR :(", error);
        alert("error DELETE Schema");
      });
  }

  // helpers

  const addOptionsSidebar = [
    {
      label: "Add Operation Schema",
      onClick: handleAddSchema,
    },
    {
      label: "From Curl",
      onClick: handleClickSchemaFromCurl,
    },
  ];

  const itemsOptionsSidebar = [
    {
      label: "Delete",
      onClick: handleDelete,
    },
  ];

  const onChangeSelect = (value) => {
    console.log(`selected ${value}`);
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
        <Col style={{ height: "100%" }} span={5}>
          <CustomSidebar
            data={state.listSchemas}
            title="Operation Templates"
            searchMode={true}
            onUpdate={UpdateSchema}
            onSelect={handleSidebarSelect}
            addOptions={addOptionsSidebar}
            itemsOptions={itemsOptionsSidebar}
            headerExtraRow={selectSchemaInput}
          />
        </Col>
        <Col span={19} style={{ height: "100%" }}>
          <Space align={"center"} style={{ height: "100%" }}>
            <Content>
              {state.empty ? (
                <Empty></Empty>
              ) : (
                <></>
              )}
            </Content>
          </Space>
        </Col>
      </Row>
    </>
  );
}

export default OperationTemplateView;
