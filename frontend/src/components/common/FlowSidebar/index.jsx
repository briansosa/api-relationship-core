import React, { useState } from 'react';
import './index.css';
import { Layout, Input, Tree, Typography, Empty, Spin, Button, Space, Collapse, Select, Dropdown, Modal, List, Divider } from 'antd';
import { SearchOutlined, PlusOutlined, ApiOutlined, ShareAltOutlined, MoreOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

const { Sider } = Layout;
const { Text } = Typography;

const FlowSidebar = ({ 
  loading = false,
  schemas = [],
  flows = [],
  onTemplateSelect,
  onAddFlow,
  onFlowSelect,
  onDeleteFlow,
  onRenameFlow,
  fieldsResponses,
  fieldResponseSelected,
  onFieldsResponseSelect,
  onAddFieldResponse,
  onDeleteFieldResponse,
  onRenameFieldResponse,
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');
  const [isFieldResponseModalVisible, setIsFieldResponseModalVisible] = useState(false);
  const [newFieldResponseName, setNewFieldResponseName] = useState('');
  const [showFlowSearch, setShowFlowSearch] = useState(false);
  const [activeKeys, setActiveKeys] = useState(['flows']);
  const [templateSearchText, setTemplateSearchText] = useState('');
  const [showTemplateSearch, setShowTemplateSearch] = useState(false);
  const [openTemplateGroups, setOpenTemplateGroups] = useState([]);
  const [fieldsResponseSearchText, setFieldsResponseSearchText] = useState('');
  const [showFieldsResponseSearch, setShowFieldsResponseSearch] = useState(false);
  const [openFieldsResponseGroups, setOpenFieldsResponseGroups] = useState([]);

  const handleFlowSelect = (flowId) => {
    setSelectedFlowId(flowId);
    onFlowSelect?.(flowId);
    setActiveKeys(['templates', 'fields-response']);
  };

  const filteredFlows = flows.filter(flow => 
    flow.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const buildTreeData = () => {
    return schemas.map(schema => {
      // Filtramos los templates según el texto de búsqueda
      const filteredTemplates = schema.list_templates?.filter(template =>
        templateSearchText
          ? template.name.toLowerCase().includes(templateSearchText.toLowerCase())
          : true
      );

      // Solo incluimos el schema si tiene templates después del filtrado
      if (filteredTemplates?.length === 0) {
        return null;
      }

      return {
        key: schema.id,
        title: schema.name,
        selectable: false,
        children: filteredTemplates?.map(template => ({
          key: template.id,
          title: template.name,
          isLeaf: true,
          template: template
        }))
      };
    }).filter(Boolean); // Removemos los schemas que quedaron null
  };

  const getDropdownItems = (flow) => ({
    items: [
      {
        key: 'rename',
        icon: <EditOutlined />,
        label: 'Renombrar',
        onClick: () => {
          setNewFlowName(flow.name); // Prellenar el nombre actual
          setIsModalVisible(true);
        }
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Eliminar',
        onClick: () => onDeleteFlow(flow)
      }
    ]
  });

  const handleOk = () => {
    if (newFlowName.trim() !== '') {
      onRenameFlow(selectedFlowId, newFlowName); // Llama a la función para renombrar
    }
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleAddFieldResponse = () => {
    let newName = "New Fields Response";
    let counter = 1;

    while (fieldsResponses.some(field => field.name === newName)) {
      newName = `New Fields Response ${counter}`;
      counter++;
    }

    const newFieldResponse = {
      id: "",
      name: newName,
      fields_response: []
    };
    
    onAddFieldResponse(newFieldResponse);
  };

  const handleFieldResponseModalOk = () => {
    onRenameFieldResponse(newFieldResponseName);
    setIsFieldResponseModalVisible(false);
  };

  const handleRenameFieldResponse = () => {
    setIsFieldResponseModalVisible(true);
  };

  const FieldsResponseHeader = () => (
    <div className="section-header">
      <Space align="center" style={{ flex: 1 }}>
        <ApiOutlined />
        <span>Fields Response</span>
        {showFieldsResponseSearch && (
          <Input
            size="small"
            placeholder="Buscar campo..."
            value={fieldsResponseSearchText}
            onChange={e => {
              e.stopPropagation();
              setFieldsResponseSearchText(e.target.value);
            }}
            className="section-header-search"
            autoFocus
            onKeyDown={e => e.stopPropagation()}
            onFocus={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          />
        )}
      </Space>
      <Space>
        <Button 
          type="text" 
          icon={<SearchOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            setShowFieldsResponseSearch(!showFieldsResponseSearch);
            if (showFieldsResponseSearch) {
              setFieldsResponseSearchText('');
            }
          }}
          size="small"
          className={showFieldsResponseSearch ? 'search-button-active' : ''}
        />
      </Space>
    </div>
  );

  const groupFieldsByOperation = () => {   
    const fields = fieldResponseSelected?.fields_response || [];
    const searchText = fieldsResponseSearchText.toLowerCase();

    // Filtrar los campos según el texto de búsqueda
    const filteredFields = fields.filter(field => 
      !searchText || 
      field.field_response.toLowerCase().includes(searchText) ||
      field.operation_name.toLowerCase().includes(searchText)
    );

    const groupedFields = filteredFields.reduce((acc, field) => {
      if (!acc[field.operation_name]) {
        acc[field.operation_name] = [];
      }
      acc[field.operation_name].push(field.field_response);
      return acc;
    }, {});

    return Object.entries(groupedFields);
  };

  const FieldsResponseSection = () => (
    <div className="fields-response-container">
      <div className="fields-response-header">
        <Space>
          <Select
            style={{ width: 200 }}
            value={fieldResponseSelected ? fieldResponseSelected.id : undefined}
            onChange={onFieldsResponseSelect}
            placeholder="Select Fields Response"
            dropdownRender={(menu) => (
              <>
                {menu}
                {fieldResponseSelected && (
                  <>
                    <Divider style={{ margin: '8px 0' }} />
                    <Button
                      type="text"
                      icon={<PlusOutlined />}
                      onClick={handleAddFieldResponse}
                      style={{ width: '100%', textAlign: 'left' }}
                    >
                      Add Fields Response
                    </Button>
                  </>
                )}
              </>
            )}
            options={fieldsResponses.map(item => ({
              label: item.name,
              value: item.id,
            }))}
          />
          {fieldResponseSelected && (
            <Space>
              <Button 
                type="text" 
                icon={<EditOutlined />} 
                onClick={handleRenameFieldResponse}
                size="small"
              />
              <Button 
                type="text" 
                icon={<DeleteOutlined />} 
                onClick={() => onDeleteFieldResponse(fieldResponseSelected.id)}
                size="small"
              />
            </Space>
          )}
        </Space>
      </div>
      {fieldResponseSelected && (
        <div style={{ marginTop: 2 }}>
          <Collapse 
            ghost
            activeKey={openFieldsResponseGroups}
            onChange={setOpenFieldsResponseGroups}
          >
            {groupFieldsByOperation().map(([operation, fields], index) => (
              <Collapse.Panel 
                header={<Text style={{ fontWeight: 'normal' }}>{operation}</Text>}
                key={operation}
              >
                <List
                  size="small"
                  dataSource={fields}
                  renderItem={field => (
                    <List.Item 
                      className="fields-response-item"
                    >
                      <Text style={{ fontSize: '12px' }}>{field}</Text>
                    </List.Item>
                  )}
                />
              </Collapse.Panel>
            ))}
          </Collapse>
        </div>
      )}
    </div>
  );

  const FlowsSection = () => (
    <div className="sidebar-scroll-container">
      {filteredFlows.map(flow => (
        <div
          key={flow.id}
          className={`flow-item-sidebar ${selectedFlowId === flow.id ? 'selected' : ''}`}
          onMouseEnter={() => setHoveredItem(flow.id)}
          onMouseLeave={() => setHoveredItem(null)}
          onClick={() => handleFlowSelect(flow.id)}
        >
          <div className="flow-item-name">
            {flow.name}
          </div>
          <Dropdown
            menu={getDropdownItems(flow)}
            trigger={['click']}
          >
            <MoreOutlined 
              className="flow-more-icon"
              style={{ 
                visibility: hoveredItem === flow.id ? 'visible' : 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ))}
    </div>
  );

  const FlowHeader = () => (
    <div className="section-header">
      <Space align="center" style={{ flex: 1 }}>
        <ShareAltOutlined />
        <span>Flows</span>
        {showFlowSearch && (
          <Input
            size="small"
            placeholder="Buscar flow..."
            value={searchText}
            onChange={e => {
              e.stopPropagation();
              setSearchText(e.target.value);
            }}
            className="section-header-search"
            autoFocus
            onKeyDown={e => e.stopPropagation()}
            onFocus={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          />
        )}
      </Space>
      <Space>
        <Button 
          type="text" 
          icon={<PlusOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            onAddFlow();
          }}
          size="small"
        />
        <Button 
          type="text" 
          icon={<SearchOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            setShowFlowSearch(!showFlowSearch);
            if (!showFlowSearch) {
              setSearchText('');
            }
          }}
          size="small"
          className={showFlowSearch ? 'search-button-active' : ''}
        />
      </Space>
    </div>
  );

  const TemplatesSection = () => {
    const buildTemplatesList = () => {
      return schemas.map(schema => {
        const filteredTemplates = schema.list_templates?.filter(template =>
          templateSearchText
            ? template.name.toLowerCase().includes(templateSearchText.toLowerCase())
            : true
        );

        if (!filteredTemplates?.length) {
          return null;
        }

        return {
          schema,
          templates: filteredTemplates
        };
      }).filter(Boolean);
    };

    return (
      <div>
        {schemas.length === 0 ? (
          <Empty 
            description="No hay templates disponibles" 
            style={{ margin: '20px 0' }}
          />
        ) : (
          <Collapse 
            ghost
            activeKey={openTemplateGroups}
            onChange={setOpenTemplateGroups}
            style={{ 
              overflow: 'auto',
              maxHeight: 'calc(100vh - 450px)'
            }}
          >
            {buildTemplatesList().map(({ schema, templates }) => (
              <Collapse.Panel 
                key={schema.id}
                header={
                  <Text style={{ fontWeight: 'normal' }}>{schema.name}</Text>
                }
                style={{ 
                  textAlign: 'left',
                  marginBottom: 0,
                  borderBottom: 'none',
                }}
              >
                <List
                  size="small"
                  dataSource={templates}
                  className="template-list-container"
                  renderItem={template => (
                    <List.Item
                      key={template.id}
                      onClick={() => onTemplateSelect([template.id])}
                      className="template-item-sidebar"
                    >
                      <Space size={4}>
                        <ApiOutlined className="template-icon"/>
                        <Text>{template.name}</Text>
                      </Space>
                    </List.Item>
                  )}
                />
              </Collapse.Panel>
            ))}
          </Collapse>
        )}
      </div>
    );
  };

  const TemplateHeader = () => (
    <div className="section-header">
      <Space align="center" style={{ flex: 1 }}>
        <ApiOutlined />
        <span>Templates</span>
        {showTemplateSearch && (
          <Input
            size="small"
            placeholder="Buscar template..."
            value={templateSearchText}
            onChange={e => {
              e.stopPropagation();
              setTemplateSearchText(e.target.value);
            }}
            className="section-header-search"
            autoFocus
            onKeyDown={e => e.stopPropagation()}
            onFocus={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
          />
        )}
      </Space>
      <Space>
        <Button 
          type="text" 
          icon={<SearchOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            setShowTemplateSearch(!showTemplateSearch);
            if (showTemplateSearch) {
              setTemplateSearchText('');
            }
          }}
          size="small"
          className={showTemplateSearch ? 'search-button-active' : ''}
        />
      </Space>
    </div>
  );

  return (
    <Sider width={300} className="flow-sidebar">
      <div className="sidebar-container">
        <Collapse 
          activeKey={activeKeys}
          onChange={setActiveKeys}
          className="main-collapse"
        >
          <Collapse.Panel 
            header={<FlowHeader />}
            key="flows"
          >
            <FlowsSection />
          </Collapse.Panel>
          
          <Collapse.Panel 
            header={<TemplateHeader />}
            key="templates"
          >
            <TemplatesSection />
          </Collapse.Panel>
          
          <Collapse.Panel 
            header={<FieldsResponseHeader />}
            key="fields-response"
          >
            <FieldsResponseSection />
          </Collapse.Panel>
        </Collapse>
      </div>

      <Modal
        title="Renombrar Flujo"
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          value={newFlowName}
          onChange={(e) => setNewFlowName(e.target.value)}
          placeholder="Nuevo nombre del flujo"
        />
      </Modal>
      
      <Modal
        title="Rename Field Response"
        open={isFieldResponseModalVisible}
        onOk={handleFieldResponseModalOk}
        onCancel={() => setIsFieldResponseModalVisible(false)}
      >
        <Input
          value={newFieldResponseName}
          onChange={(e) => setNewFieldResponseName(e.target.value)}
          placeholder="Field response name"
        />
      </Modal>
    </Sider>
  );
};

export default FlowSidebar; 