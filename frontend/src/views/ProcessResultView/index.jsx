import React, { useState, useEffect } from 'react';
import { Table, Button, Radio, Modal, Space, Tooltip } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './styles.css';

const jsonData = [
    {
        "calle": "de la peña 912, lanus",
        "ubicacion@direccionesNormalizadas.#.nombre_calle_cruce": [
            "rodriguez"
        ],
        "locacion@ubicacion.departamento.nombre": "Monte chingolo",
        "locacion@ubicacion.municipio.nombre": "Lanús",
        "locacion@ubicacion.provincia.nombre": "Buenos Aires",
        "ubicacion@direccionesNormalizadas.#.nombre_calle": [
            "Néstor De La Peña"
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.x": [
            -58.3523998816327
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.y": [
            -34.7208329938776
        ],
        "locacion@parametros.lat": -34.7208329938776,
        "locacion@parametros.lon": -58.3523998816327,
        "error": "false",
        "error_message": null
    },
    {
        "calle": "aristobulo del valle 348, lanus",
        "ubicacion@direccionesNormalizadas.#.nombre_calle_cruce": [
            "Ministro Brin"
        ],
        "locacion@ubicacion.departamento.nombre": "Lanús Oeste",
        "locacion@ubicacion.municipio.nombre": "Lanús",
        "locacion@ubicacion.provincia.nombre": "Buenos Aires",
        "ubicacion@direccionesNormalizadas.#.nombre_calle": [
            "Aristóbulo del Valle"
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.x": [
            -58.3963983979592
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.y": [
            -34.7048365326531
        ],
        "locacion@parametros.lat": -34.7048365326531,
        "locacion@parametros.lon": -58.3963983979592,
        "error": "false",
        "error_message": null
    },
    {
        "calle": "san martin 2002, caba",
        "ubicacion@direccionesNormalizadas.#.nombre_calle_cruce": [
            "calle 1",
            "calle 2"
        ],
        "locacion@ubicacion.departamento.nombre": "Comuna 11, CABA",
        "locacion@ubicacion.municipio.nombre": "Ciudad Autónoma de Buenos Aires",
        "locacion@ubicacion.provincia.nombre": "Buenos Aires",
        "ubicacion@direccionesNormalizadas.#.nombre_calle": [
            "ESCALADA DE SAN MARTIN, R.",
            "SAN MARTIN AV."
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.x": [
            "-58.467947",
            "-58.456701"
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.y": [
            "-34.610016",
            "-34.605036"
        ],
        "locacion@parametros.lat": -34.610016,
        "locacion@parametros.lon": -58.467947,
        "error": "false",
        "error_message": null
    },
    {
        "calle": "rangugni 3056, lanus",
        "ubicacion@direccionesNormalizadas.#.nombre_calle_cruce": [
            "25 de mayo",
            "otra"
        ],
        "locacion@ubicacion.departamento.nombre": "Lanús Oeste",
        "locacion@ubicacion.municipio.nombre": "Lanús",
        "locacion@ubicacion.provincia.nombre": "Buenos Aires",
        "ubicacion@direccionesNormalizadas.#.nombre_calle": [
            "Teniente Jorge Rangugni",
            "Teniente Jorge Rangugni"
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.x": [
            -58.4002668183673,
            -58.4002668183673
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.y": [
            -34.7078616591837,
            -34.7078616591837
        ],
        "locacion@parametros.lat": -34.7078616591837,
        "locacion@parametros.lon": -58.4002668183673,
        "error": "false",
        "error_message": null
    }
];

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

function ProcessResultView({ data }) {
    const [listViewMode, setListViewMode] = useState('concatenated');
    const [columns, setColumns] = useState([]);

    const isList = (value) => Array.isArray(value);

    const handleListValue = (value, key) => {
        if (!isList(value)) return { [key]: value };

        switch (listViewMode) {
            case 'concatenated':
                return { [key]: value.join(' | ') };
            case 'columns':
                return value.reduce((acc, item, index) => {
                    acc[`${key}_${index + 1}`] = item;
                    return acc;
                }, {});
            case 'rows':
                return { [key]: value[0] };
            default:
                return { [key]: value.join(' | ') };
        }
    };

    const transformData = () => {
        if (listViewMode === 'rows') {
            return jsonData.flatMap(item => {
                const rows = [{}];
                Object.entries(item).forEach(([key, value]) => {
                    if (isList(value)) {
                        value.forEach((val, index) => {
                            if (!rows[index]) rows[index] = {};
                            rows[index][key] = val;
                        });
                    } else {
                        rows.forEach(row => row[key] = value);
                    }
                });
                return rows;
            });
        }

        return jsonData.map(item => {
            const transformedItem = {};
            Object.entries(item).forEach(([key, value]) => {
                Object.assign(transformedItem, handleListValue(value, key));
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

    const generateColumns = () => {
        const transformedData = transformData();
        if (!transformedData.length) return [];

        const newColumns = Object.keys(transformedData[0]).map(key => ({
            title: key,
            dataIndex: key,
            key: key,
            width: 200,
            ellipsis: {
                showTitle: false // Deshabilita el tooltip por defecto
            },
            onHeaderCell: column => ({
                width: column.width,
                onResize: handleResize(key),
            }),
            render: (value, record) => {
                const originalValue = jsonData.find(item => item[key])?.[key];
                if (isList(originalValue)) {
                    return (
                        <Space>
                            <Tooltip title={value}>
                                <span style={{ width: '100%', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {value}
                                </span>
                            </Tooltip>
                            <Button 
                                icon={<ExpandOutlined />} 
                                size="small"
                                onClick={() => showDetails(key, originalValue)}
                            />
                        </Space>
                    );
                }
                return (
                    <Tooltip title={value}>
                        <span>{value}</span>
                    </Tooltip>
                );
            },
            sorter: (a, b) => {
                if (typeof a[key] === 'string') {
                    return a[key].localeCompare(b[key]);
                }
                return a[key] - b[key];
            },
        }));

        setColumns(newColumns);
        return newColumns;
    };

    useEffect(() => {
        generateColumns();
    }, [listViewMode]);

    const showDetails = (title, values) => {
        Modal.info({
            title: `Detalles de ${title}`,
            content: (
                <div>
                    {values.map((value, index) => (
                        <p key={index}>{value}</p>
                    ))}
                </div>
            ),
            width: 600,
        });
    };

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
                        <Radio.Button value="concatenated">Concatenado</Radio.Button>
                        <Radio.Button value="columns">Columnas Separadas</Radio.Button>
                        <Radio.Button value="rows">Filas Separadas</Radio.Button>
                    </Radio.Group>
                    <Button type="primary">Exportar</Button>
                </Space>

                <Table 
                    components={components}
                    dataSource={transformData()} 
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

export default ProcessResultView; 