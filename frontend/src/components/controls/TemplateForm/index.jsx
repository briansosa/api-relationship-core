import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Tabs,
  Typography,
  Row,
  Col,
  Select,
  Drawer,
  Popover
} from "antd";
import { useForm } from "../../hooks/useForm";
import EditableTable from "../../common/EditableTable";
import { DeleteOutlined } from '@ant-design/icons';
import ParameterizedEditableTable from '../ParameterizedEditableTable';


const TemplateForm = (props) => {
  const entityInit = {
    id: "",
    body: "",
    headers: null,
    method_type: "",
    name: "",
    query_params: null,
    request_type: "",
    timeout: 0,
    url: "",
    params: null
  };

  const [state, setState] = useState({
    entity: entityInit,
    selectedTab: "body",
  });

  const [editName, setEditName] = useState(false);
  const [formValues, formHandle, , formSet] = useForm({
    ...entityInit,
  });

  const [selectedText, setSelectedText] = useState('');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);

  const mount = () => {
    setState((prevState) => ({ ...prevState, entity: props.entity }));

    formSet({
      id: props.entity.id,
      body:
        props.entity.body && props.entity.body != null
          ? JSON.stringify(props.entity.body, null, 2)
          : null,
      headers: props.entity.headers ?? {},
      method_type:
        props.entity.method_type != "" ? props.entity.method_type : "GET",
      name:
        props.entity.name != "" ? props.entity.name : "New Operation Template",
      query_params: props.entity.query_params ?? {},
      request_type: props.entity.request_type,
      timeout: props.entity.timeout,
      url: props.entity.url,
      params: props.entity.params,
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
      id: props.entity.id,
      body: formValues.body ? JSON.parse(formValues.body) : null,
      headers:
        Object.keys(formValues.headers).length == 0 ? null : formValues.headers,
      method_type: formValues.method_type,
      name: formValues.name,
      query_params:
        Object.keys(formValues.query_params).length == 0
          ? null
          : formValues.query_params,
      request_type: formValues.request_type,
      timeout: formValues.timeout,
      url: formValues.url,
      params: formValues.params,
    };

    props.onSave(row);
  };

  const handlerOnChange = (event, deleted) => {
    
    // Si es un cambio de parámetros, actualizamos directamente params
    if (event.target.name === "params") {
      formSet(prev => ({
        ...prev,
        params: event.target.value // Aquí value es el array de parámetros
      }));
    } else {
      formHandle(event);
    }
    
    let updatedValues = {
      ...formValues,
      [event.target.name]: event.target.value
    };
    
    if (deleted) {
      updatedValues.params = updatedValues.params.filter(p => p.name !== event.target.name);
    }

    // Si el evento es de URL, buscar parámetros en la URL y actualizar la lista
    if (event.target.name === "url") {
      const urlValue = event.target.value;
      const paramRegex = /{([^}]+)}/g;
      const matches = [...urlValue.matchAll(paramRegex)].map(match => match[1]);
      
      // Mantener los parámetros existentes que no son de URL
      const nonUrlParams = (updatedValues.params || []).filter(p => p.location !== 'path');
      
      // Agregar los parámetros encontrados en la URL
      const urlParams = matches.map(paramName => ({
        name: paramName,
        type: 'path',
        location: 'path'
      }));


      console.log("urlParams", urlParams);
      updatedValues.params = [...nonUrlParams, ...urlParams];
    }

    const row = {
      id: props.entity.id,
      body: updatedValues.body ? JSON.parse(updatedValues.body) : null,
      headers:
        Object.keys(updatedValues.headers).length == 0 ? null : updatedValues.headers,
      method_type: updatedValues.method_type,
      name: updatedValues.name,
      query_params:
        Object.keys(updatedValues.query_params).length == 0
          ? null
          : updatedValues.query_params,
      request_type: updatedValues.request_type,
      timeout: updatedValues.timeout,
      url: updatedValues.url,
      params: updatedValues.params,
    };
    
    props.onChange(row);
  }

  const handleUrlSelection = (e) => {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    const selectedText = e.target.value.substring(start, end);
    
    if (selectedText) {
      setSelectedText(selectedText);
      setSelectionStart(start);
      setSelectionEnd(end);
    }
  };

  const convertToParameter = (paramName, paramType = 'path') => {
    const currentUrl = formValues.url;
    const newUrl = 
      currentUrl.substring(0, selectionStart) + 
      `{${paramName}}` + 
      currentUrl.substring(selectionEnd);


    const event = {
      target: {
        name: 'url',
        value: newUrl
      }
    };
    handlerOnChange(event);
  };

  const urlPopoverContent = (
    <div>
      <p>Convertir "{selectedText}" en parámetro:</p>
      <Button 
        size="small" 
        onClick={() => convertToParameter(selectedText)}
      >
        Marcar como parámetro
      </Button>
    </div>
  );

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
        <ParameterizedEditableTable
          titleKey="Header"
          titleValue="Value"
          name="headers"
          data={formValues.headers}
          onChange={handlerOnChange}
          parameters={formValues.params}
        />
      ),
    },
    {
      key: "queryParams",
      label: "Query Params",
      children: (
        <ParameterizedEditableTable
          titleKey="Param"
          titleValue="Value"
          name="query_params"
          data={formValues.query_params}
          onChange={(event, deleted) => handlerOnChange(event, deleted)}
          parameters={formValues.params}
        />
      ),
    },
  ];

  return (
    <>
      <style>
        {`
          .http-method-select .ant-select-item {
            padding: 4px 8px;
            font-size: 14px;
            min-height: 32px;
            display: flex;
            align-items: center;
          }

          .http-method-select .ant-select-item-option-content {
            font-weight: 500;
          }

          .http-method-select .ant-select-item-option-selected {
            background-color: #e6f7ff;
          }
        `}
      </style>
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
              };

              formHandle(event);
            }}
            style={{ 
              width: '100%',
              marginRight: '8px'
            }}
            dropdownStyle={{
              padding: '4px',
            }}
            popupClassName="http-method-select"
            options={[
              { value: "GET", label: "GET" },
              { value: "POST", label: "POST" },
              { value: "PUT", label: "PUT" },
              { value: "PATCH", label: "PATCH" },
              { value: "DELETE", label: "DELETE" },
            ]}
            listHeight={200}
            menuItemSelectedIcon={null}
          />
        </Col>
        <Col span={16}>
          <Popover 
            content={urlPopoverContent}
            trigger="click"
            open={!!selectedText}
            onOpenChange={(visible) => !visible && setSelectedText('')}
          >
            <Input
              placeholder="https://example.com/api/v1/test-api"
              name="url"
              value={formValues.url?.replace(/\{([^}]+)\}/g, (match, param) => {
                return formValues.params?.find(p => p.name === param) ? match : ''
              })}
              onChange={formHandle}
              onSelect={handleUrlSelection}
              style={{ marginRight: '8px' }}
            />
          </Popover>
        </Col>
        <Col span={4}>
          <Button type="primary" htmlType="submit" onClick={handleSubmit}>
            Save Template
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

export default TemplateForm;
