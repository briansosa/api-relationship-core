import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, Divider, Typography, Tag, Checkbox, Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import './styles.css';

const { Text } = Typography;

const TemplateNode = ({ data }) => {
  const { template, responseSchema } = data;
  const [responseFields, setResponseFields] = useState([]);

  // Función recursiva para extraer campos del schema
  const extractFields = (obj, prefix = '') => {
    let fields = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      
      if (value === null || typeof value !== 'object') {
        fields.push({
          name: fullPath,
          type: value === null ? 'null' : typeof value,
          value: value
        });
      } else if (!Array.isArray(value)) {
        // Es un objeto, recursivamente extraer sus campos
        fields = [...fields, ...extractFields(value, fullPath)];
      }
    });
    
    return fields;
  };

  useEffect(() => {   
    if (responseSchema) {
      try {
        // Si responseSchema ya es un objeto, lo usamos directamente
        const schemaObj = typeof responseSchema === 'string' ? 
          JSON.parse(responseSchema) : responseSchema;
          
        const fields = extractFields(schemaObj);
        setResponseFields(fields);
      } catch (error) {
        console.error('Error parsing schema:', error);
        setResponseFields([]);
      }
    }
  }, [responseSchema]);

  // Función para obtener el color según el tipo de dato
  const getTypeColor = (type) => {
    const colors = {
      string: 'green',
      number: 'blue',
      boolean: 'orange',
      object: 'purple',
      null: 'gray'
    };
    return colors[type] || 'default';
  };

  // Función auxiliar para obtener el color según el método HTTP
  const getMethodColor = (method) => {
    const colors = {
      GET: 'green',
      POST: 'blue',
      PUT: 'orange',
      DELETE: 'red',
      PATCH: 'purple'
    };
    return colors[method?.toUpperCase()] || 'default';
  };

  // Función para obtener el color del tipo de parámetro
  const getParamTypeColor = (type) => {
    const colors = {
      query_param: 'blue',
      header: 'purple',
      path: 'orange',
      body: 'cyan'
    };
    return colors[type] || 'default';
  };

  return (
    <Card 
      className="template-node"
      title={
        <div className="template-node-header">
          <Tag color={getMethodColor(template.method_type)}>
            {template.method_type}
          </Tag>
          <Text strong style={{ flex: 1, textAlign: 'center' }}>
            {template.name}
          </Text>
        </div>
      }
      size="small"
    >
      <div className="template-node-content">
        {/* Panel Izquierdo - Parámetros */}
        <div className="parameters-panel">
          <Text strong>Parámetros</Text>
          <div className="parameters-list">
            {template.params?.map((param, index) => (
              <div key={`${param.type}-${param.name}-${index}`} className="parameter-item">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`param-${param.type}-${param.name}`}
                  style={{ visibility: 'visible' }}
                />
                <Tag color={getParamTypeColor(param.type)}>
                  {param.type === 'query_param' ? 'query' : param.type}
                </Tag>
                <Text>{param.name}</Text>
              </div>
            ))}
          </div>
        </div>

        <Divider type="vertical" className="panel-divider" />

        {/* Panel Derecho - Respuesta */}
        <div className="response-panel">
          <Text strong>Respuesta</Text>
          <div className="response-list">
            {responseFields.map((field, index) => (
              <div key={`response-${field.name}-${index}`} className="response-item">
                <Checkbox />
                <Text>{field.name}</Text>
                <Tag color={getTypeColor(field.type)}>
                  {field.type}
                </Tag>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`resp-${field.name}`}
                  style={{ visibility: 'visible' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TemplateNode;
