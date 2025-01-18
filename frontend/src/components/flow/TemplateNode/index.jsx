import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { Card, Typography, Tag, Checkbox, Button, Divider, Modal, Form, InputNumber, Select } from 'antd';
import { CaretRightOutlined, SettingOutlined } from '@ant-design/icons';
import './styles.css';
import TemplateFieldsManager from '../TemplateFieldsManager';
import { useFlowContext } from '../../../context/FlowContext';

const { Text } = Typography;

// Nuevo componente FieldCheckbox
const FieldCheckbox = memo(({ 
  handleId, 
  fields, 
  onSelect 
}) => {
  return (
    <Checkbox
      checked={fields.has(handleId)}
      onChange={(e) => onSelect(handleId, e.target.checked)}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.handleId === nextProps.handleId &&
    prevProps.fields === nextProps.fields
  );
});

// Componente para mostrar la estructura jerárquica del schema
const SchemaNode = memo(({ 
  name, 
  value, 
  level = 0, 
  fullPath = '', 
  templateName, 
  isRootArray = false, 
  managerOnFieldSelect, 
  fields 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Memorizar el tipo de nodo y sus propiedades
  const nodeInfo = useMemo(() => {
    const getNodeType = (val) => {
      if (Array.isArray(val)) return 'array';
      if (typeof val === 'object' && val !== null) return 'object';
      return typeof val;
    };
    
    const nodeType = getNodeType(value);
    const isExpandable = nodeType === 'object' || nodeType === 'array';
    
    let children;
    if (nodeType === 'array') {
      children = value[0];
      if (name === "0") name = "";
    } else {
      children = value;
    }

    return { nodeType, isExpandable, children };
  }, [value, name]);

  // Memorizar el path
  const { currentPath, handleId } = useMemo(() => {
    let currentPath;
    if (nodeInfo.nodeType === 'array') {
      if (name) {
        currentPath = fullPath ? `${fullPath}.${name}.#` : `${name}.#`;
      } else {
        currentPath = fullPath ? `${fullPath}.#` : '#';
      }
    } else {
      if (isRootArray) {
        currentPath = name ? `${fullPath}.${name}` : fullPath;
      } else {
        currentPath = name ? (fullPath ? `${fullPath}.${name}` : name) : fullPath;
      }
    }

    return { 
      currentPath,
      handleId: currentPath 
    };
  }, [nodeInfo.nodeType, name, fullPath, isRootArray]);

  const getTypeColor = (type) => {
    const colors = {
      string: 'green',
      number: 'blue',
      boolean: 'orange',
      object: 'purple',
      array: 'cyan'
    };
    return colors[type] || 'default';
  };

  return (
    <div className="schema-node" style={{ marginLeft: level * 8 }}>
      <div className="schema-header">
        <div className="schema-header-left">
          {!nodeInfo.isExpandable && (
            <FieldCheckbox
              handleId={handleId}
              fields={fields}
              onSelect={managerOnFieldSelect}
            />
          )}
          {nodeInfo.isExpandable && (
            <CaretRightOutlined 
              className={`caret ${isExpanded ? 'expanded' : ''}`}
              onClick={() => setIsExpanded(!isExpanded)}
            />
          )}
          {name && <Text>{name}</Text>}
        </div>

        <div className="schema-header-right">
          <Tag color={getTypeColor(nodeInfo.nodeType)}>
            {nodeInfo.nodeType === 'array' ? 'array' : nodeInfo.nodeType}
          </Tag>
          {!nodeInfo.isExpandable && (
            <Handle
              type="source"
              position={Position.Right}
              id={`resp-${handleId}`}
              className="connection-handle"
            />
          )}
        </div>
      </div>
      
      {nodeInfo.isExpandable && isExpanded && (
        <div className="schema-children">
          {Object.entries(nodeInfo.children || {}).map(([key, val]) => (
            <SchemaNode
              key={key}
              name={key}
              value={val}
              level={level + 1}
              fullPath={currentPath}
              templateName={templateName}
              isRootArray={nodeInfo.nodeType === 'array' || isRootArray}
              managerOnFieldSelect={managerOnFieldSelect}
              fields={fields}
            />
          ))}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian estos props
  return (
    prevProps.name === nextProps.name &&
    prevProps.fullPath === nextProps.fullPath &&
    prevProps.fields === nextProps.fields &&
    prevProps.isRootArray === nextProps.isRootArray
  );
});

// Nuevo componente ResponsePanel
const ResponsePanel = memo(({ 
  schemaData, 
  templateName, 
  fields, 
  managerOnFieldSelect 
}) => {
  return (
    <div className="response-panel">
      <Text strong>Respuesta</Text>
      <div className="response-list">
        {schemaData && (Array.isArray(schemaData) ? (
          <SchemaNode 
            key="root"
            name=""
            value={schemaData}
            templateName={templateName}
            isRootArray={true}
            managerOnFieldSelect={managerOnFieldSelect}
            fields={fields}
          />
        ) : (
          Object.entries(schemaData).map(([key, val]) => (
            <SchemaNode 
              key={key}
              name={key}
              value={val}
              templateName={templateName}
              isRootArray={false}
              managerOnFieldSelect={managerOnFieldSelect}
              fields={fields}
            />
          ))
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.templateName === nextProps.templateName &&
    prevProps.fields === nextProps.fields &&
    prevProps.schemaData === nextProps.schemaData
  );
});

// Componente TemplateNode principal
const TemplateNode = ({ data, selected }) => {
  const { template, responseSchema } = data;
  const { fieldResponseSelected } = useFlowContext();
  const [schemaData, setSchemaData] = useState(null);
  const [isConfigModalVisible, setIsConfigModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [maxConcurrency, setMaxConcurrency] = useState(template.max_concurrency || 1);
  const [searchType, setSearchType] = useState(template.search_type || 'simple');

  const EXECUTION_TYPES = {
    SIMPLE: 'Simple',
    DIRECT_PRODUCT: 'Direct product',
    CARDINAL_PRODUCT: 'Cardinal product'
  };

  const handleConfigSave = () => {
    form.validateFields().then(values => {
      // Actualizar los valores en el template
      const executionTypeToSearchType = {
        SIMPLE: 'simple',
        DIRECT_PRODUCT: 'direct_product',
        CARDINAL_PRODUCT: 'cardinal_product'
      };
      
      // Actualizar max_concurrency y search_type
      handleMaxConcurrencyChange(values.maxConcurrency);
      handleSearchTypeChange(executionTypeToSearchType[values.executionType]);
      
      setIsConfigModalVisible(false);
    });
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

  useEffect(() => {   
    if (responseSchema) {
      try {
        const schemaObj = typeof responseSchema === 'string' ? 
          JSON.parse(responseSchema) : responseSchema;
        setSchemaData(schemaObj);
      } catch (error) {
        console.error('Error parsing schema:', error);
        setSchemaData(null);
      }
    }
  }, [responseSchema]);

  // Actualizar los valores en el template cuando cambien
  const handleMaxConcurrencyChange = (value) => {
    setMaxConcurrency(value);
    if (template) {
      template.max_concurrency = value;
    }
  };

  const handleSearchTypeChange = (value) => {
    setSearchType(value);
    if (template) {
      template.search_type = value;
    }
  };

  // Cuando se abre el modal, resetear el form con los valores actuales
  useEffect(() => {
    if (isConfigModalVisible) {
      const searchTypeToExecutionType = {
        'simple': 'SIMPLE',
        'direct_product': 'DIRECT_PRODUCT',
        'cardinal_product': 'CARDINAL_PRODUCT'
      };

      form.setFieldsValue({
        maxConcurrency: maxConcurrency,
        executionType: searchTypeToExecutionType[searchType] || 'SIMPLE'
      });
    }
  }, [isConfigModalVisible, form, maxConcurrency, searchType]);

  // Inicializar los estados con los valores del template
  useEffect(() => {
    setMaxConcurrency(template.max_concurrency || 1);
    setSearchType(template.search_type || 'simple');
  }, [template]);

  // Memorizar el panel de parámetros
  const ParametersPanel = useMemo(() => (
    <div className="parameters-panel">
      <Text strong>Parámetros</Text>
      <div className="parameters-list">
        {template.params?.map((param, index) => (
          <div 
            key={`${param.type}-${param.name}-${index}`} 
            className="parameter-item"
          >
            <Handle
              type="target"
              position={Position.Left}
              id={`param-${param.type}-${param.name}`}
              className="connection-handle"
            />
            <Tag color={getParamTypeColor(param.type)}>
              {param.type === 'query_param' ? 'query' : param.type}
            </Tag>
            <Text>{param.name}</Text>
          </div>
        ))}
      </div>
    </div>
  ), [template.params]);

  // Memorizar el header del Card
  const CardTitle = useMemo(() => (
    <div className="template-node-header">
      <Tag color={getMethodColor(template.method_type)}>
        {template.method_type}
      </Tag>
      <Text strong style={{ flex: 1, textAlign: 'center' }}>
        {template.name}
      </Text>
      <Button
        type="text"
        icon={<SettingOutlined />}
        onClick={() => setIsConfigModalVisible(true)}
        className="config-button"
      />
    </div>
  ), [template.method_type, template.name]);

  return (
    <TemplateFieldsManager 
      templateName={template.name}
      fieldResponseId={fieldResponseSelected?.id}
    >
      {({ fields, onFieldSelect: managerOnFieldSelect }) => (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <NodeResizer 
            minWidth={300}
            maxWidth={800}
            minHeight={100}
            isVisible={selected}
            handleStyle={{ background: '#1890ff' }}
          />
          <Card 
            className="template-node"
            title={CardTitle}
            size="small"
          >
            <div className="template-node-content">
              {ParametersPanel}

              <Divider type="vertical" className="panel-divider" />

              <ResponsePanel
                schemaData={schemaData}
                templateName={template.name}
                fields={fields}
                managerOnFieldSelect={managerOnFieldSelect}
              />
            </div>
          </Card>

          <Modal
            title="Template Configuration"
            open={isConfigModalVisible}
            onOk={handleConfigSave}
            onCancel={() => setIsConfigModalVisible(false)}
            destroyOnClose
          >
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                maxConcurrency: template.max_concurrency || 1,
                executionType: template.search_type?.toUpperCase() || 'SIMPLE'
              }}
            >
              <Form.Item
                name="maxConcurrency"
                label="Maximum Concurrency"
                rules={[
                  { required: true, message: 'Please input maximum concurrency!' },
                  { type: 'number', min: 1, message: 'Must be at least 1!' }
                ]}
              >
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="executionType"
                label="List Execution Type"
                rules={[{ required: true, message: 'Please select execution type!' }]}
              >
                <Select>
                  {Object.entries(EXECUTION_TYPES).map(([key, value]) => (
                    <Select.Option key={key} value={key}>
                      {value}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Form>
          </Modal>
        </div>
      )}
    </TemplateFieldsManager>
  );
};

export default memo(TemplateNode);
