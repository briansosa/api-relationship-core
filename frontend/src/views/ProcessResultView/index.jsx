import React, { useState, useEffect } from 'react';
import { Table, Button, Radio, Space, Tooltip, Input, Badge, Spin } from 'antd';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './styles.css';
import { DownOutlined, ExpandOutlined, CompressOutlined, UndoOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';

import { GetProcess } from "../../../wailsjs/go/handlers/ProcessHandler";
import { ReadFile } from "../../../wailsjs/go/handlers/FileHandler";
function ProcessResultView() {
    const params = useParams();
    const [listViewMode, setListViewMode] = useState('expandable');
    const [columns, setColumns] = useState([]);
    const [separator, setSeparator] = useState('|');
    const [expandedRows, setExpandedRows] = useState({});
    
    const entityInit = {
        fields_response_id: "",
        flow_id: "",
        id: "",
        input: "",
        name: "",
        output_filename: "",
        status: ""
    };

    const [state, setState] = useState({
        entity: entityInit,
        jsonData: [],
        loading: false
    });


    useEffect(() => {
        if (params.id) {
            GetProcessResult(params.id);
        }
    }, []);

    useEffect(() => {
        if (state.jsonData.length > 0) {
            generateColumns();
        }
    }, [state.jsonData, listViewMode, separator]);

    
    const components = {
        header: {
            cell: ResizableTitle,
        },
    };

    //
    // Server Request
    //

    function GetProcessResult(processId) {
        setState({ ...state, loading: true });
        GetProcess(processId).then(process => {
            if (process.output_filename) {
                ReadFile(process.output_filename).then(data => {
                    const fileBytes = Uint8Array.from(atob(data), c => c.charCodeAt(0));
                    const decodedData = new TextDecoder('utf-8').decode(fileBytes);
                    const jsonData = JSON.parse(decodedData);

                    if (!Array.isArray(jsonData)) {
                        throw new Error('ProcessResultView: data prop must be an array');
                    }
                    setState({
                        entity: process,
                        jsonData: jsonData,
                        loading: false
                    });
                }).catch(error => {
                    console.error("Error reading file", error);
                });
            }
        }).catch(error => {
            console.error("Error getting process result", error);
            setState({ ...state, loading: false });
        });
    }
    
    const isList = (value) => Array.isArray(value);

    const handleListValue = (value, key) => {
        if (!isList(value)) return { [key]: value };

        switch (listViewMode) {
            case 'expandable':
                return { 
                    [key]: {
                        list: value,
                        count: value.length,
                        displayValue: value[0] || ''
                    }
                };
            case 'concatenated':
                return { [key]: value.join(`${separator}`) };
            case 'columns':
                const maxElements = Math.max(
                    ...state.jsonData
                        .map(item => item[key])
                        .filter(Array.isArray)
                        .map(arr => arr.length)
                );
                
                const result = {};
                if (maxElements === 1) {
                    result[key] = value[0] || '';
                } else {
                    for (let i = 0; i < maxElements; i++) {
                        result[`${key}_${i + 1}`] = value[i] || '';
                    }
                }
                return result;
            case 'rows':
                return { [key]: value[0] };
            default:
                return { [key]: value.join(`${separator}`) };
        }
    };

    const transformData = () => {
        if (!Array.isArray(state.jsonData) || state.jsonData.length === 0) {
            return [];
        }

        if (listViewMode === 'rows') {
            return state.jsonData.flatMap(item => {
                const maxArrayLength = Math.max(
                    ...Object.values(item)
                        .filter(value => Array.isArray(value) && value.length > 1)
                        .map(arr => arr.length),
                    1
                );

                const rows = Array.from({ length: maxArrayLength }, () => ({}));

                Object.entries(item).forEach(([key, value]) => {
                    if (isList(value)) {
                        if (value.length > 1) {
                            value.forEach((val, index) => {
                                if (index < maxArrayLength) {
                                    rows[index][key] = val;
                                }
                            });
                        } else {
                            rows[0][key] = value[0];
                            for (let i = 1; i < maxArrayLength; i++) {
                                rows[i][key] = '';
                            }
                        }
                    } else {
                        rows.forEach(row => {
                            row[key] = value;
                        });
                    }
                });
                return rows;
            });
        }

        return state.jsonData.map(item => {
            const transformedItem = {};
            Object.entries(item).forEach(([key, value]) => {
                if (listViewMode === 'expandable' && isList(value)) {
                    transformedItem[key] = {
                        list: value,
                        count: value.length,
                        displayValue: value[0] || ''
                    };
                } else if (listViewMode === 'columns' && isList(value)) {
                    const maxElements = Math.max(
                        ...state.jsonData
                            .map(item => item[key])
                            .filter(Array.isArray)
                            .map(arr => arr.length)
                    );

                    if (maxElements === 1) {
                        transformedItem[key] = value[0] || '';
                    } else {
                        for (let i = 0; i < maxElements; i++) {
                            transformedItem[`${key}_${i + 1}`] = value[i] || '';
                        }
                    }
                } else if (isList(value)) {
                    transformedItem[key] = handleListValue(value, key)[key];
                } else {
                    transformedItem[key] = value;
                }
            });
            return transformedItem;
        });
    };

    const handleResize = (columnKey) => (e, { size }) => {
        setColumns(prevColumns => {
            return prevColumns.map(col => {
                if (col.key === columnKey) {
                    return { ...col, width: size.width };
                }
                return col;
            });
        });
    };

    const handleExpand = (recordKey, columnKey) => {
        const key = `${recordKey}-${columnKey}`;
        setExpandedRows(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const generateColumns = () => {
        setState({ ...state, loading: true });
        const transformedData = transformData();
        if (!transformedData.length) return [];

        const newColumns = Object.keys(transformedData[0]).map(key => {
            // Obtener valores únicos para los filtros
            const uniqueValues = new Set();
            transformedData.forEach(item => {
                const value = item[key];
                if (listViewMode === 'expandable' && value?.list) {
                    value.list.forEach(v => uniqueValues.add(v?.toString() || ''));
                } else {
                    uniqueValues.add(value?.toString() || '');
                }
            });

            // Crear opciones de filtro
            const filterOptions = Array.from(uniqueValues)
                .filter(Boolean)
                .map(value => ({
                    text: value,
                    value: value
                }));

            return {
                title: (
                    <Space>
                        {key}
                    </Space>
                ),
                dataIndex: key,
                key: key,
                width: 200,
                ellipsis: {
                    showTitle: false
                },
                filters: filterOptions,
                onFilter: (value, record) => {
                    const recordValue = record[key];
                    if (listViewMode === 'expandable' && recordValue?.list) {
                        return recordValue.list.some(v => 
                            v?.toString().toLowerCase().includes(value.toLowerCase())
                        );
                    }
                    return recordValue?.toString().toLowerCase().includes(value.toLowerCase());
                },
                filterSearch: true, // Permite buscar en las opciones del filtro
                onHeaderCell: column => ({
                    width: column.width,
                    onResize: handleResize(key),
                }),
                render: (value, record) => {
                    if (value === null || value === undefined) {
                        return <span></span>;
                    }

                    if (listViewMode === 'expandable' && typeof value === 'object' && value?.list) {
                        const rowKey = `${record.key || record.id || JSON.stringify(record)}-${key}`;
                        const isExpanded = expandedRows[rowKey];
                        
                        return (
                            <div 
                                className="expandable-cell"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleExpand(record.key || record.id || JSON.stringify(record), key);
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {value.count > 1 && (
                                        <DownOutlined 
                                            rotate={isExpanded ? 180 : 0}
                                            style={{ fontSize: '12px', marginRight: 8 }}
                                        />
                                    )}
                                    {(value.count == 0 || !isExpanded) && ( <span>{value.list[0]}</span> )}
                                    {value.count > 1 && !isExpanded && (
                                        <Badge 
                                            count={`+${value.count - 1}`} 
                                            size="small"
                                            style={{ backgroundColor: '#1890ff', marginLeft: 8 }}
                                        />
                                    )}
                                    {value.count > 1 && isExpanded && (
                                        <div className="expandable-content expanded">
                                            {value.list.map((item, index) => (
                                                <div key={`${rowKey}-${index}`} className="expandable-item">
                                                    {item ?? ''}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }
                    
                    return (
                        <Tooltip title={value?.toString() || ''}>
                            <span>
                                {typeof value === 'object' && value?.list ? value.list[0] : value?.toString() || ''}
                            </span>
                        </Tooltip>
                    );
                },
                sorter: (a, b) => {
                    const valA = a[key]?.displayValue ?? a[key] ?? '';
                    const valB = b[key]?.displayValue ?? b[key] ?? '';
                    
                    if (typeof valA === 'string') {
                        return valA.localeCompare(valB);
                    }
                    return (valA || 0) - (valB || 0);
                },
            };
        });

        setColumns(newColumns);
        setState({ ...state, loading: false });
        return newColumns;
    };

    const getTableData = () => {
        const data = transformData();
        const tableData =data.map((item, index) => ({
            ...item,
            key: `row-${index}`
        }));

        return tableData;
    };
    // Función para expandir todas las filas
    const expandAll = () => {
        const newExpandedRows = {};
        getTableData().forEach(row => {
            Object.entries(row).forEach(([key, value]) => {
                if (typeof value === 'object' && value?.list && value.count > 1) {
                    newExpandedRows[`${row.key}-${key}`] = true;
                }
            });
        });
        setExpandedRows(newExpandedRows);
    };

    // Función para colapsar todas las filas
    const collapseAll = () => {
        setExpandedRows({});
    };

    // Función para resetear al estado por defecto (todo colapsado)
    const resetExpanded = () => {
        setExpandedRows({});
    };

    return (
        <div style={{ padding: '24px' }}>
            <Spin spinning={state.loading} tip="Cargando resultados...">
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}></div>
                    <Radio.Group 
                        value={listViewMode} 
                        onChange={(e) => setListViewMode(e.target.value)}
                        style={{ display: 'flex', justifyContent: 'center' }}
                    >
                        <Radio.Button value="expandable">Expandible</Radio.Button>
                        <Radio.Button value="concatenated">Concatenado</Radio.Button>
                        <Radio.Button value="columns">Columnas Separadas</Radio.Button>
                        <Radio.Button value="rows">Filas Separadas</Radio.Button>
                    </Radio.Group>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button type="primary">
                            Exportar
                        </Button>
                    </div>
                </div>

                <div style={{ height: 32, display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center' }}>
                    {(listViewMode === 'expandable' || listViewMode === 'concatenated') && (
                        <>
                            {listViewMode === 'expandable' && (
                                <>
                                    <Button 
                                        icon={<ExpandOutlined />}
                                        onClick={expandAll}
                                        title="Expandir todo"
                                    >
                                        Expandir todo
                                    </Button>
                                    <Button 
                                        icon={<CompressOutlined />}
                                        onClick={collapseAll}
                                        title="Colapsar todo"
                                    >
                                        Colapsar todo
                                    </Button>
                                    <Button 
                                        icon={<UndoOutlined />}
                                        onClick={resetExpanded}
                                        title="Restablecer"
                                    >
                                        Restablecer
                                    </Button>
                                </>
                            )}
                            
                            {listViewMode === 'concatenated' && (
                                <Input
                                    placeholder="Separador"
                                    value={separator}
                                    onChange={(e) => setSeparator(e.target.value)}
                                    style={{ width: 100 }}
                                    maxLength={5}
                                    prefix="Separador:"
                                />
                            )}
                        </>
                    )}
                </div>

                <Table
                    components={components}
                    dataSource={getTableData()}
                    columns={columns}
                    scroll={{ x: 'max-content' }}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`
                    }}
                    bordered
                    filterMultiple={true}
                />
            </Space>
            </Spin>
        </div>
    );
}


// Componente para el encabezado redimensionable
const ResizableTitle = props => {
    const { onResize, width, ...restProps } = props;

    if (!width) {
        return <th {...restProps} />;
    }

    return (
        <Resizable
            width={width}
            height={0}
            minConstraints={[100, 0]} // Ancho mínimo de 100px
            handle={
                <span
                    className="react-resizable-handle"
                    onClick={e => {
                        e.stopPropagation();
                        e.preventDefault();
                    }}
                />
            }
            onResize={onResize}
            draggableOpts={{ 
                enableUserSelectHack: false,
                preventDefault: true
            }}
        >
            <th {...restProps} />
        </Resizable>
    );
};


export default ProcessResultView; 