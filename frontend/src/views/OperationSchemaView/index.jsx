import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout, Row, Col, Divider, Button, Card, message } from "antd";
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

const OperationSchemaView = () => {
  const params = useParams();
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
    templates_id: [],
  };

  //hooks
  const [state, setState] = useState({
    id: params.id ? params.id : "0",
    mode: params.mode,
    loading: false,
    entity: entityInit,
    list: null,
    disable: true,
    showCurlModal: false,
  });

  const mount = () => {
    if (params.id != "0" && params.mode == "edit") {
      setState((prevState) => ({
        ...prevState,
        id: params.id ? params.id : "0",
        mode: params.mode,
        disable: false,
      }));

      GetSchema(params.id);
    }

    if (params.mode == "new") {
      const randomId = new ShortUniqueId().rnd();
      setState((prevState) => ({
        ...prevState,
        id: randomId,
        mode: params.mode,
        disable: false,
      }));

      InsertSchema({
        id: randomId,
        name: "New Operation Schema",
        timeout: 30,
        request_type: "json",
      });
    }

    GetAllSchemas();
  };

  useEffect(mount, [params]);

  // Handlers

  function handleSidebarSelect(item) {
    navigate(`/operation_schemas/edit/${item.key}`);
  }

  const handleSaveSchema = () => {
    const transformedJson = transformJsonValues(state.entity.response);
    
    // TODO: validate form
    const data = new operation.Operation({
      body: state.entity.body,
      headers: state.entity.headers,
      id: state.id,
      method_type: state.entity.method_type,
      name: state.entity.name,
      query_params: state.entity.query_params,
      request_type: state.entity.request_type,
      schema: transformedJson,
      response: state.entity.response,
      timeout: state.entity.timeout != 0 ? state.entity.timeout : 30,
      url: state.entity.url,
      templates_id: state.entity.templates_id,
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
            list: result,
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

  function transformJsonValues(json) {
    if (typeof json === "number") {
      return json % 1 === 0 ? 99 : 99.99;
    }
    if (typeof json === "string") {
      return "default";
    }
    if (typeof json === "boolean") {
      return false;
    }
    if (Array.isArray(json)) {
      return [transformJsonValues(json[0])];
    }
    if (typeof json === "object" && json !== null) {
      return Object.keys(json).reduce((acc, key) => {
        acc[key] = transformJsonValues(json[key]);
        return acc;
      }, {});
    }  

    return json;
  }

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

  return (
    <>
      <Layout style={{ height: "100%" }}>
        {state.showCurlModal && (
          <CurlModal
            onConfirm={handleAddSchemaFromCurl}
            onCancel={(e) =>
              setState((prevState) => ({ ...prevState, showCurlModal: false }))
            }
          />
        )}
        <Col>
        <CustomSidebar
          data={state.list}
          title="Operation Schemas"
          searchMode={true}
          onUpdate={UpdateSchema}
          onSelect={handleSidebarSelect}
          addOptions={addOptionsSidebar}
          itemsOptions={itemsOptionsSidebar}
        />
        </Col>
        <Layout>
          <Content style={{ margin: "24px 16px" }}>
            <Row>
              <Col span={11}>
                <RequestForm
                  entity={state.entity}
                  onConfirm={handleSubmit}
                ></RequestForm>
              </Col>
              <Col span={2}>
                <Divider
                  type="vertical"
                  style={{ height: "90vh", backgroundColor: "#000" }}
                />
              </Col>
              <Col span={11}>
                <Loading visible={state.loading} content={true}></Loading>
                <Button
                  type="primary"
                  onClick={handleSaveSchema}
                  style={{ marginTop: "20px" }}
                >
                  Save Schema
                </Button>
                <Card
                  style={{ height: "80vh", overflow: "scroll", padding: 0 }}
                >
                  <JsonViewer
                    json={state.entity.response}
                    allowEdit={false}
                    allowAdd={false}
                    allowDelete={false}
                  />
                </Card>
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    </>
  );
};

export default OperationSchemaView;
