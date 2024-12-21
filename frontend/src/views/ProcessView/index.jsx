import React, { useState, useEffect } from 'react';
import ShortUniqueId from 'short-unique-id';
import { Layout, Card, Badge, Button, Row, Col, Modal, Form, Input, Select, Upload } from 'antd';
import { PlusOutlined, PlayCircleOutlined, CopyOutlined, UploadOutlined } from '@ant-design/icons';

import { GetAllProcesses, CreateProcess, StartProcess } from "../../../wailsjs/go/handlers/ProcessHandler";
import { GetAllFlows } from "../../../wailsjs/go/handlers/FlowHandler";
import { GetFieldsResponseByFlowID } from "../../../wailsjs/go/handlers/FieldsResponseHandler";
import { ReadCSVFile } from "../../../wailsjs/go/handlers/FileHandler";


const { Content } = Layout;

function ProcessView() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form] = Form.useForm();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState("");

    const [state, setState] = useState({
        listProcesses: [],
        listFlows: [],
        listFieldsResponses: [],
    });

    const mount = () => {
        GetListProcesses();
        GetListFlows();
    }

    useEffect(mount, []);

    // Handlers

    function GetListProcesses() {
        GetAllProcesses().then((response) => {
            setState((prevState) => ({
                ...prevState,
                listProcesses: response,
            }));
        }).catch((error) => {
            console.log(error);
        });
    }

    function GetListFlows() {
        GetAllFlows().then((response) => {
            setState((prevState) => ({
                ...prevState,
                listFlows: response,
            }));
        }).catch((error) => {
            console.log(error);
        });
    }

    function GetListFieldsResponses(flowId) {
        GetFieldsResponseByFlowID(flowId).then((response) => {
            setState((prevState) => ({
                ...prevState,
                listFieldsResponses: response,
            }));
        }).catch((error) => {
            console.log(error);
        });
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { status: 'success', text: 'Completado' },
            running: { status: 'processing', text: 'En proceso' },
            failed: { status: 'error', text: 'Error' },
            pending: { status: 'default', text: 'Pendiente' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Badge status={config.status} text={config.text} />;
    };

    // Filtrar procesos según el término de búsqueda
    const filteredProcesses = state.listProcesses.filter(process => 
        process.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateProcess = () => {
        form.validateFields().then(values => {
            console.log('Valores del formulario:', values);

            const processEntity = {
                id: new ShortUniqueId().rnd(),
                name: values.name,
                flow_id: values.flow_id,
                fields_response_id: values.fields_response_id,
                input: values.input,
                status: "pending",
            };

            console.log("processEntity", processEntity);

            CreateProcess(processEntity).then((response) => {
                console.log("response insert process", response);
                cleanForm();
                setIsModalVisible(false);
                GetListProcesses();
            }).catch((error) => {
                console.log("error", error);
            });
            
        }).catch(info => {
            console.log('Validación fallida:', info);
        });
    };

    const handleOnClickCreateProcess = () => {
        setIsModalVisible(true);
        
        const newProcess = {
            name: "",
            flow_id: "",
            input: "",
            fields_response_id: "",
            status: "pending",
        };
        form.setFieldsValue(newProcess); 
    }

    const handleFlowChange = (flowId) => {
        GetListFieldsResponses(flowId);
    };

    const handleOnCancelCreateProcess = () => {
        setIsModalVisible(false);
        cleanForm();
    }

    const handleUploadChange = () => {
        ReadCSVFile().then((response) => {
            console.log("response", response);
            form.setFieldValue("input", response);
            
            setUploadedFileName(response.split('/').pop());
            setUploadedFile(true);
        }).catch((error) => {
            console.log("error", error);
        });
    };

    const cleanForm = () => {
        setUploadedFileName("");
        setUploadedFile(null);
        form.resetFields();
        setState((prevState) => ({
            ...prevState,
            listFieldsResponses: [],
        }));
    }

    const handleOnClickRunProcess = (processId) => {
        const process = state.listProcesses.find(process => process.id === processId);
        console.log("process", process);

        StartProcess(process).then((response) => {
            console.log("response run process", response);
            GetListProcesses();
        }).catch((error) => {
            console.log("error", error);
        });
    }

    return (
        <Layout>
            <Content style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <Input 
                        placeholder="Buscar proceso..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ width: '300px' }} 
                    />
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleOnClickCreateProcess}
                    >
                        Crear Proceso
                    </Button>
                </div>

                <Row gutter={[16, 16]}>
                    {filteredProcesses.map(process => (
                        <Col xs={24} sm={12} md={8} lg={6} key={process.id}>
                            <Card
                                title={process.name}
                                extra={getStatusBadge(process.status)}
                                actions={[
                                    <Button type="text" icon={<PlayCircleOutlined />} key="run" onClick={() => handleOnClickRunProcess(process.id)}>Ejecutar</Button>,
                                    <Button type="text" icon={<CopyOutlined />} key="duplicate">Duplicar</Button>
                                ]}
                            >
                                <p><strong>Flow:</strong> {state.listFlows.find(flow => flow.id === process.flow_id)?.name}</p>
                                <p><strong>Fields Response:</strong> {process.fields_response_id}</p>
                                <p><strong>Input:</strong> {process.input.split('/').pop()}</p>
                                {process.output_file && (
                                    <p><strong>Output:</strong> {process.output_file}</p>
                                )}
                            </Card>
                        </Col>
                    ))}
                </Row>

                <Modal
                    title="Crear Nuevo Proceso"
                    open={isModalVisible}
                    onCancel={handleOnCancelCreateProcess}
                    footer={null}
                >
                    <Form layout="vertical" form={form}>
                        <Form.Item label="Nombre del Proceso" name="name" required>
                            <Input placeholder="Ingrese el nombre del proceso" />
                        </Form.Item>
                        <Form.Item label="Flow" name="flow_id" required>
                            <Select 
                                placeholder="Seleccione un flow" 
                                showSearch
                                filterOption={(input, option) => 
                                    option.children.toLowerCase().includes(input.toLowerCase()
                                )}
                                onChange={handleFlowChange}
                            >
                                {state.listFlows.map(flow => (
                                    <Select.Option key={flow.id} value={flow.id}>{flow.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Fields Response" name="fields_response_id" required>
                            <Select 
                                placeholder="Seleccione fields response" 
                                showSearch
                                filterOption={(input, option) => 
                                    option.children.toLowerCase().includes(input.toLowerCase()
                                )}
                            >
                                {state.listFieldsResponses.map(fieldResponse => (
                                    <Select.Option key={fieldResponse.id} value={fieldResponse.id}>{fieldResponse.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item label="Archivo de entrada" name="input" required>
                            {uploadedFile ? (
                                <div>
                                    <span>{uploadedFileName}</span>
                                    <Button 
                                        type="link" 
                                        onClick={() => setUploadedFile(null)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
                            ) : (
                                <Button 
                                    icon={<UploadOutlined />}
                                    onClick={handleUploadChange}
                                >
                                    Seleccionar archivo de entrada
                                </Button>
                            )}
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" block onClick={handleCreateProcess}>
                                Crear
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </Content>
        </Layout>
    );
}

export default ProcessView;