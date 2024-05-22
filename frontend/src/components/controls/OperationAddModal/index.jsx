// import { TestEndpoint } from '../../../../wailsjs/go/handlers/OperationHandler';
// import {} from ;

import { StartProcess } from '../../../../wailsjs/go/handlers/ProcessHandler';

import { useState, useEffect } from 'react';
import { useForm } from '../../hooks/useForm';
import { Button, Modal, message, Steps, theme, Form, Input, Col, Row, Select } from 'antd';
const { TextArea } = Input;


function OperationAddModal(props) {

  const entityInit = {
    name: "",
    url: "",
    method_type: "",
    headers: null,
    body: null
  };

  // hooks
  const [state, setState] = useState({
    entity: entityInit
  });

  const [isModalOpen, setIsModalOpen] = useState(true);
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);


  const [formValues, formHandle, , formSet] = useForm({
    name: "",
    url: "",
    method_type: "",
    headers: null,
    body: null
  });

  const mount = () => {
    setState(prevState => {
      return { ...prevState, entity: props.data.entity };
    });
    formSet({
      name: props.data.entity.name,
      url: props.data.entity.url,
      method_type: props.data.entity.method_type,
      headers: props.data.entity.headers,
      body: props.data.entity.body,
    });
  };

  useEffect(mount, [props.data.entity]);

  // functions

  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
    props.onDismiss();
  };

  const next = () => {
    setCurrent(current + 1);
  };
  const prev = () => {
    setCurrent(current - 1);
  };

  const MakeTestOperation = () => {
    // TestEndpoint(formValues).then((result) => {
    //   console.log("Llego OK!", result)
    //   next();

    // }).catch((error) => {
    //   console.log("Llego ERROR :(", error)
    // });

    const data = {
        name:             "test-process-1",
        flow_id:           "1",
        input:            "input-default",
        fields_response_id: "2",
    }

    StartProcess(data).then((result) => {
          console.log("Llego OK!", result)
      next();
    }).catch((error) => {
      console.log("Llego ERROR :(", error)
    });
  }


  const steps = [
    {
      title: 'Datos',
      content: (
        <>
          <Input
            placeholder="Operation name"
            allowClear
            value={formValues.name}
            onChange={formHandle}
            name='name'
          />
          <Select
            placeholder="HTTP Method"
            style={{ width: 110 }}
            onChange={(e) => {
              formHandle({ target: { name: 'method_type', value: e } })
            }}
            value={formValues.method_type}
            name='method_type'
            options={[
              { value: 'GET', label: 'GET' },
              { value: 'POST', label: 'POST' },
              { value: 'PUT', label: 'PUT' },
              { value: 'PATCH', label: 'PATCH' },
              { value: 'DELETE', label: 'DELETE' },
            ]}
          />
          <Input
            placeholder="URL"
            allowClear
            value={formValues.url}
            onChange={formHandle}
            name='url'
          />
          <TextArea
            name='body'
            value={formValues.body}
            onChange={formHandle}
            placeholder="Body"
            autoSize={{
              minRows: 3,
              maxRows: 5,
            }}
          />

          <TextArea
            name='headers'
            value={formValues.headers}
            onChange={formHandle}
            placeholder="Headers"
            autoSize={{
              minRows: 3,
              maxRows: 5,
            }}
          />
        </>
      ),
    },
    {
      title: 'Parametrización',
      content: <div><span>Last-content</span></div>,
    },
  ];

  const items = steps.map((item) => ({
    key: item.title,
    title: item.title,
  }));
  const contentStyle = {
    height: '400px',
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginTop: 16,
  };


  return (
    <>
      <Modal title="Operaciones" footer={[]} open={isModalOpen} onOk={handleOk} onCancel={handleCancel} >

        <Steps current={current} items={items} />
        <div style={contentStyle}>{steps[current].content}</div>
        <div
          style={{
            marginTop: 24,
          }}
        >

          {current > 0 && (
            <Button
              style={{
                margin: '0 8px',
              }}
              onClick={() => prev()}
            >
              Previous
            </Button>
          )}
          {current === 0 && current < steps.length - 1 &&(
            <Button type="primary" onClick={() => MakeTestOperation()}>
              Test and Continue
            </Button>
          )}
          {current === steps.length - 1 && (
            <Button type="primary" onClick={() => message.success('Processing complete!')}>
              Done
            </Button>
          )}
        </div>
      </Modal>
    </>
  );
}

export { OperationAddModal };