import React, { useState, useEffect } from "react";
import { Input, Button, Tabs, Typography, Row, Col, Select } from "antd";
import { useForm } from "../../hooks/useForm";
import EditableTable from "../../common/EditableTable";

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
      body: (props.entity.body && props.entity.body != null) ? JSON.stringify(props.entity.body, null, 2) : null,
      headers: props.entity.headers ?? {},
      method_type: props.entity.method_type != "" ? props.entity.method_type : "GET",
      name: props.entity.name != "" ? props.entity.name : "New Operation Schema" ,
      query_params: props.entity.query_params ?? {},
      request_type: props.entity.request_type,
      timeout: props.entity.timeout,
      url: props.entity.url,
      templates_id: props.entity.templates_id ?? []
    });

  };
  useEffect(mount, [props.entity]);

  // handlers
  const handlerSelectedTab = (tabName) => {
    setState((prevState) => ({ ...prevState, selectedTab: tabName }));
  };

  const handleSubmit = () => {
    // TODO validate form

    const row = {
      body: formValues.body ? JSON.parse(formValues.body) : null,
      headers: Object.keys(formValues.headers).length == 0 ? null : formValues.headers,
      method_type: formValues.method_type,
      name: formValues.name,
      query_params: Object.keys(formValues.query_params).length == 0 ? null : formValues.query_params,
      request_type: formValues.request_type,
      timeout: formValues.timeout,
      url: formValues.url,
      templates_id: formValues.templates_id,
    };

    props.onConfirm(row);
  }

  const tabsColumns = [
    {
      key: "body",
      label: "Body",
      children: (
        <Input.TextArea
          style={{ height: "65vh" }}
          rows={10}
          name="body"
          value={formValues.body}
          onChange={formHandle}
        />
      ),
    },
    {
      key: "headers",
      label: "Headers",
      children: (
        <EditableTable
          titleKey="Header"
          titleValue="Value"
          name="headers"
          data={formValues.headers}
          onChange={formHandle}
        />
      ),
    },
    {
      key: "queryParams",
      label: "Query Params",
      children: (
        <EditableTable
          titleKey="Param"
          titleValue="Value"
          name="query_params"
          data={formValues.query_params}
          onChange={formHandle}
        />
      ),
    },
  ];

  return (
    <>
      <Row>
        {editName ? (
          <Input
            value={formValues.name}
            onChange={formHandle}
            name="name"
            onPressEnter={() => setEditName(false)}
            onBlur={() => setEditName(false)}
            autoFocus
          />
        ) : (
          <Typography.Title
            level={5}
            style={{ margin: 0 }}
            onDoubleClick={() => setEditName(true)}
          >
            {formValues.name}
          </Typography.Title>
        )}
      </Row>
      <Row>
        <Col span={4}>
          <Select
            placeholder="GET"
            defaultValue="GET"
            name="method_type"
            value={formValues.method_type}
            onChange={(value) => {
              const event = {
                target: {
                  name: "method_type",
                  value: value,
                },
              }

              formHandle(event);
            }}
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
              { value: "PUT", label: "PUT" },
              { value: "PATH", label: "PATH" },
              { value: "DELETE", label: "DELETE" },
            ]}
          />
        </Col>
        <Col span={16}>
          <Input
            placeholder="https://example.com/api/v1/test-api"
            name="url"
            value={formValues.url}
            onChange={formHandle}
          />
        </Col>
        <Col span={4}>
          <Button type="primary" htmlType="submit" onClick={handleSubmit}>
            Send
          </Button>
        </Col>
      </Row>
      <Tabs
        activeKey={state.selectedTab}
        onChange={handlerSelectedTab}
        items={tabsColumns}
      ></Tabs>
    </>
  );
};

export default RequestForm;
