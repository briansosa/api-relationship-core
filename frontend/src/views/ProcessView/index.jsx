import React, { useState, useEffect } from 'react';
import ShortUniqueId from 'short-unique-id';
import './styles.css';
import { Layout, Card, Badge, Button, Row, Col, Modal, Form, Input, Select, Upload, Pagination } from 'antd';
import { PlusOutlined, PlayCircleOutlined, CopyOutlined, UploadOutlined, CloseOutlined } from '@ant-design/icons';

import { GetAllProcesses, CreateProcess, StartProcess, DeleteProcess } from "../../../wailsjs/go/handlers/ProcessHandler";
import { GetAllFlows } from "../../../wailsjs/go/handlers/FlowHandler";
import { GetFieldsResponseByFlowID, GetAllFieldsResponses } from "../../../wailsjs/go/handlers/FieldsResponseHandler";
import { GetFilePath } from "../../../wailsjs/go/handlers/FileHandler";
import { useNavigate } from "react-router-dom";

const { Content } = Layout;

function ProcessView() {
    const navigate = useNavigate();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form] = Form.useForm();
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState("");
    const [formFieldsResponse, setFormFieldsResponse] = useState([]);

    const [state, setState] = useState({
        listProcesses: [],
        listFlows: [],
        listFieldsResponses: [],
    });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(12);

    const mount = () => {
        GetListProcesses()
        GetListFlows();
        GetListFieldsResponses();

        const intervalId = setInterval(() => {
            GetListProcesses();
        }, 3000);
        
        return () => clearInterval(intervalId);
    }

    useEffect(mount, []);


    // Handlers

    function GetListProcesses() {
        GetAllProcesses().then((response) => {
            console.log("response list processes", response);
            setState((prevState) => ({
                ...prevState,
                listProcesses: response.sort((a, b) => b.id - a.id),
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

    function GetListFieldsResponses() {
        GetAllFieldsResponses().then((response) => {
            setState((prevState) => ({
                ...prevState,
                listFieldsResponses: response,
            }));
        }).catch((error) => {
            console.log(error);
        });
    }

    function GetListFieldsResponsesByFlowID(flowId) {
        GetFieldsResponseByFlowID(flowId).then((response) => {
            setFormFieldsResponse(response);
        }).catch((error) => {
            console.log(error);
        });
    }

    const getStatusBadge = (status) => {
        const statusConfig = {
            success: { status: 'success', text: 'Completado' },
            processing: { status: 'processing', text: 'En proceso' },
            error: { status: 'error', text: 'Error' },
            pending: { status: 'default', text: 'Pendiente' }
        };
        const config = statusConfig[status] || statusConfig.pending;
        return <Badge status={config.status} text={config.text} />;
    };

    // Filtrar procesos según el término de búsqueda
    const filteredProcesses = state.listProcesses.filter(process => 
        process.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calcular los procesos a mostrar en la página actual
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentProcesses = filteredProcesses.slice(startIndex, endIndex);

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
        GetListFieldsResponsesByFlowID(flowId);
    };

    const handleOnCancelCreateProcess = () => {
        setIsModalVisible(false);
        cleanForm();
    }

    const handleUploadChange = () => {
        GetFilePath().then((response) => {
            console.log("response read csv file", response);
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
        setFormFieldsResponse([]);
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

    const handleViewResults = (processId) => {
        navigate(`/process_result/${processId}`);
    };

    const handleOnClickDuplicateProcess = (processId) => {
        console.log("process id duplicate", processId);
        const process = state.listProcesses.find(p => p.id === processId);
        const newProcess = {
            name: process.name + " - copy",
            flow_id: process.flow_id,
            input: process.input,
            fields_response_id: process.fields_response_id,
            status: "pending",
        };

        form.setFieldsValue(newProcess); 

        setUploadedFileName(process.input.split('/').pop());
        setUploadedFile(true);
        setIsModalVisible(true);
    };

    const showDeleteConfirm = (processId) => {
        Modal.confirm({
            content: '¿Estás seguro de que deseas eliminar este proceso?',
            okText: 'Sí',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => handleDeleteProcess(processId),
        });
    };

    const handleDeleteProcess = (processId) => {
        console.log("Eliminando proceso con ID:", processId);
        DeleteProcess(processId).then((response) => {
            GetListProcesses();
        }).catch((error) => {
            console.log("error", error);
        });
    };

    return (
        <Layout id='process-view'>
            <Content style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <Input 
                        placeholder="Buscar proceso..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        style={{ width: '85%' }} 
                    />
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />}
                        onClick={handleOnClickCreateProcess}
                    >
                        Crear Proceso
                    </Button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '660px', justifyContent: 'space-between' }}>
                    <Row gutter={[16, 16]} style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-start' }}>
                        {currentProcesses.map(process => (
                            <Col xs={24} sm={12} md={8} lg={6} key={process.id}>
                                <Card
                                    title={process.name}
                                    extra={getStatusBadge(process.status)}
                                    actions={[
                                        process.status === "success" || process.status === "error" ? (
                                            <>
                                                <Button type="text" key="view" onClick={() => handleViewResults(process.id)}>View Results</Button>
                                                <Button type="text" icon={<CopyOutlined />} key="duplicate" onClick={() => handleOnClickDuplicateProcess(process.id)}>Duplicar</Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button type="text" icon={<PlayCircleOutlined />} key="run" onClick={() => handleOnClickRunProcess(process.id)}>Ejecutar</Button>
                                                {process.status === "pending" ? (
                                                    <Button type="text" icon={<CloseOutlined />} key="remove" onClick={() => showDeleteConfirm(process.id)} style={{ color: 'red' }}>Remove</Button>
                                                ) : (
                                                    <Button type="text" icon={<CopyOutlined />} key="duplicate" onClick={() => handleOnClickDuplicateProcess(process.id)}>Duplicar</Button>
                                                )}
                                            </>
                                        ),
                                    ]}
                                >
                                    <p><strong>Flow:</strong> {state.listFlows.find(flow => flow.id === process.flow_id)?.name}</p>
                                    <p><strong>Fields Response:</strong> {state.listFieldsResponses.find(fieldResponse => fieldResponse.id === process.fields_response_id)?.name}</p>
                                    <p><strong>Input:</strong> {process.input.split('/').pop()}</p>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <Pagination
                        current={currentPage}
                        pageSize={pageSize}
                        total={filteredProcesses.length}
                        onChange={(page) => setCurrentPage(page)}
                        style={{ marginTop: '20px', textAlign: 'center' }}
                    />
                </div>

                <Modal
                    title="Crear Nuevo Proceso"
                    open={isModalVisible}
                    onCancel={handleOnCancelCreateProcess}
                    footer={null}
                >
                    <Form form={form} layout="vertical">
                        <Form.Item
                            label="Nombre del Proceso"
                            name="name"
                            rules={[{ required: true, message: 'Por favor ingrese el nombre del proceso' }]}
                        >
                            <Input placeholder="Ingrese el nombre del proceso" />
                        </Form.Item>
                        <Form.Item 
                            label="Flow" 
                            name="flow_id" 
                            rules={[{ required: true, message: 'Por favor seleccione un flow' }]}
                        >
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
                        <Form.Item 
                            label="Fields Response" 
                            name="fields_response_id" 
                            rules={[{ required: true, message: 'Por favor seleccione un fields response' }]}
                        >
                            <Select 
                                placeholder="Seleccione fields response" 
                                showSearch
                                filterOption={(input, option) => 
                                    option.children.toLowerCase().includes(input.toLowerCase()
                                )}
                            >
                                {formFieldsResponse.map(fieldResponse => (
                                    <Select.Option key={fieldResponse.id} value={fieldResponse.id}>{fieldResponse.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item 
                            label="Archivo de entrada" 
                            name="input" 
                            rules={[{ required: true, message: 'Por favor seleccione un archivo de entrada' }]}
                        >
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