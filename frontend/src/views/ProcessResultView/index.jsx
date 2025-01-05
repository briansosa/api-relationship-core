import React, { useState, useEffect } from 'react';
import { Table, Button, Radio, Modal, Space, Tooltip } from 'antd';
import { ExpandOutlined } from '@ant-design/icons';
import { Resizable } from 'react-resizable';
import 'react-resizable/css/styles.css';
import './styles.css';

const jsonData = [
    {
        "calle": "aristobulo del valle 348, lanus",
        "ubicacion@direccionesNormalizadas.#.coordenadas.x": [
            -58.3963983979592
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.y": [
            -34.7048365326531
        ],
        "ubicacion@direccionesNormalizadas.#.direccion": [
            "Aristóbulo del Valle 348, Lanús"
        ],
        "locacion@ubicacion.provincia.nombre": "Buenos Aires",
        "locacion@ubicacion.departamento.nombre": "Lanús",
        "locacion@ubicacion.municipio.nombre": "Lanús",
        "sunrise sunset@results.sunrise": "5:47:48 AM",
        "sunrise sunset@results.sunset": "8:11:40 PM",
        "Open Water@current.sunrise": 1735980394,
        "Open Water@current.temp": 294.21,
        "Open Water@current.feels_like": 294.28,
        "Open Water@current.pressure": 1012,
        "Open Water@current.humidity": 73,
        "Open Water@current.clouds": 20,
        "Open Water@current.visibility": 10000,
        "Open Water@current.wind_speed": 5.66,
        "Open Water@current.weather.#.description": [
            "few clouds"
        ],
        "Open Water@current.weather.#.main": [
            "Clouds"
        ],
        "error": "false",
        "error_message": null
    },
    {
        "calle": "de la peña 912, lanus",
        "ubicacion@direccionesNormalizadas.#.coordenadas.x": [
            -58.3523998816327
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.y": [
            -34.7208329938776
        ],
        "ubicacion@direccionesNormalizadas.#.direccion": [
            "Néstor De La Peña 912, Lanús"
        ],
        "locacion@ubicacion.provincia.nombre": "Buenos Aires",
        "locacion@ubicacion.departamento.nombre": "Lanús",
        "locacion@ubicacion.municipio.nombre": "Lanús",
        "sunrise sunset@results.sunrise": "5:47:35 AM",
        "sunrise sunset@results.sunset": "8:11:32 PM",
        "Open Water@current.sunrise": 1735980381,
        "Open Water@current.temp": 294.17,
        "Open Water@current.feels_like": 294.23,
        "Open Water@current.pressure": 1012,
        "Open Water@current.humidity": 73,
        "Open Water@current.clouds": 20,
        "Open Water@current.visibility": 10000,
        "Open Water@current.wind_speed": 5.66,
        "Open Water@current.weather.#.description": [
            "few clouds"
        ],
        "Open Water@current.weather.#.main": [
            "Clouds"
        ],
        "error": "false",
        "error_message": null
    },
    {
        "calle": "rangugni 3056, lanus oeste",
        "ubicacion@direccionesNormalizadas.#.coordenadas.x": [
            -58.4002668183673
        ],
        "ubicacion@direccionesNormalizadas.#.coordenadas.y": [
            -34.7078616591837
        ],
        "ubicacion@direccionesNormalizadas.#.direccion": [
            "Teniente Jorge Rangugni 3056, Lanús"
        ],
        "locacion@ubicacion.provincia.nombre": "Buenos Aires",
        "locacion@ubicacion.departamento.nombre": "Lanús",
        "locacion@ubicacion.municipio.nombre": "Lanús",
        "sunrise sunset@results.sunrise": "5:47:48 AM",
        "sunrise sunset@results.sunset": "8:11:41 PM",
        "Open Water@current.sunrise": 1735980394,
        "Open Water@current.temp": 294.21,
        "Open Water@current.feels_like": 294.28,
        "Open Water@current.pressure": 1012,
        "Open Water@current.humidity": 73,
        "Open Water@current.clouds": 20,
        "Open Water@current.visibility": 10000,
        "Open Water@current.wind_speed": 5.66,
        "Open Water@current.weather.#.description": [
            "few clouds"
        ],
        "Open Water@current.weather.#.main": [
            "Clouds", "otro"
        ],
        "error": "false",
        "error_message": null
    }
];

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