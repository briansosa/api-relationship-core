import React, { useState, useEffect } from 'react';
import { Table, Button, Radio, Space, Tooltip, Input, Badge } from 'antd';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './styles.css';
import { DownOutlined } from '@ant-design/icons';
import { mockData } from './mockData';

function ProcessResultView({ data }) {
    const jsonData = data || mockData; // Usar los datos proporcionados o los datos de ejemplo
    const [listViewMode, setListViewMode] = useState('expandable');
    const [columns, setColumns] = useState([]);
    const [separator, setSeparator] = useState('|');
    const [expandedRows, setExpandedRows] = useState({});

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
                    ...jsonData
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
        if (!Array.isArray(jsonData) || jsonData.length === 0) {
            return [];
        }

        if (listViewMode === 'rows') {
            return jsonData.flatMap(item => {
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

        return jsonData.map(item => {
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
                        ...jsonData
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
        const transformedData = transformData();
        if (!transformedData.length) return [];

        const newColumns = Object.keys(transformedData[0]).map(key => ({
            title: key,
            dataIndex: key,
            key: key,
            width: 200,
            ellipsis: {
                showTitle: false
            },
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
        }));

        setColumns(newColumns);
        return newColumns;
    };

    const getTableData = () => {
        const data = transformData();
        return data.map((item, index) => ({
            ...item,
            key: `row-${index}`
        }));
    };

    useEffect(() => {
        if (!Array.isArray(jsonData)) {
            console.error('ProcessResultView: data prop must be an array');
            return;
        }
        generateColumns();
    }, [listViewMode, separator, expandedRows, jsonData]);

    const components = {
        header: {
            cell: ResizableTitle,
        },
    };

    return (
        <div style={{ padding: '24px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                    <Radio.Group 
                        value={listViewMode} 
                        onChange={(e) => setListViewMode(e.target.value)}
                    >
                        <Radio.Button value="expandable">Expandible</Radio.Button>
                        <Radio.Button value="concatenated">Concatenado</Radio.Button>
                        <Radio.Button value="columns">Columnas Separadas</Radio.Button>
                        <Radio.Button value="rows">Filas Separadas</Radio.Button>
                    </Radio.Group>
                    
                    {listViewMode === 'concatenated' && (
                        <Input
                            placeholder="Separador"
                            value={separator}
                            onChange={(e) => setSeparator(e.target.value)}
                            style={{ width: 100 }}
                            maxLength={5}
                        />
                    )}
                    
                    <Button type="primary">Exportar</Button>
                </Space>

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
                />
            </Space>
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