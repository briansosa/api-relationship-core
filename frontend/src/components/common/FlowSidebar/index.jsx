import React, { useState } from 'react';
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

  const handleFlowSelect = (flowId) => {
    setSelectedFlowId(flowId);
    onFlowSelect?.(flowId);
  };

  const filteredFlows = flows.filter(flow => 
    flow.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const buildTreeData = () => {
    return schemas.map(schema => ({
      key: schema.id,
      title: schema.name,
      selectable: false,
      children: schema.list_templates?.map(template => ({
        key: template.id,
        title: template.name,
        isLeaf: true,
        template: template
      }))
    }));
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

  const groupFieldsByOperation = () => {   
    const fields = fieldResponseSelected?.fields_response || []

    const groupedFields = fields.reduce((acc, field) => {
      if (!acc[field.operation_name]) {
        acc[field.operation_name] = [];
      }
      acc[field.operation_name].push(field.field_response);
      return acc;
    }, {});

    return Object.entries(groupedFields);
  };

  const FieldsResponseSection = () => (
    <div style={{ 
      borderTop: '1px solid #f0f0f0',
      padding: '16px 8px',
      height: '50vh',
      overflow: 'auto'
    }}>
      <div style={{ 
        marginBottom: 16,
        gap: 8
      }}>
        <Text strong>Fields Response</Text>
        <Space>
          <Select
            style={{ width: 180 }}
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
        <div style={{ marginTop: 16 }}>
          <Collapse defaultActiveKey={['1']} ghost>
            {groupFieldsByOperation().map(([operation, fields], index) => (
              <Collapse.Panel 
                header={<Text strong>{operation}</Text>}
                key={index}
              >
                <List
                  size="small"
                  dataSource={fields}
                  renderItem={field => (
                    <List.Item style={{ padding: '4px 0' }}>
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
    <div style={{ padding: '0 8px' }}>
      <div style={{ 
        height: 'calc(100vh - 450px)',
        overflow: 'auto',
        padding: '4px 0'
      }}>
        {filteredFlows.map(flow => (
          <div
            key={flow.id}
            style={{
              padding: '4px 8px',
              cursor: 'pointer',
              borderRadius: '4px',
              marginBottom: '2px',
              backgroundColor: selectedFlowId === flow.id 
                ? '#e6f7ff' 
                : hoveredItem === flow.id 
                  ? '#e6f4ff'
                  : 'transparent',
              transition: 'background-color 0.2s ease',
              display: 'flex',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseEnter={() => setHoveredItem(flow.id)}
            onMouseLeave={() => setHoveredItem(null)}
            onClick={() => handleFlowSelect(flow.id)}
          >
            <div style={{ 
              flex: 1,
              textAlign: 'left',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {flow.name}
            </div>
            <Dropdown
              menu={getDropdownItems(flow)}
              trigger={['click']}
            >
              <MoreOutlined 
                style={{ 
                  padding: '4px',
                  cursor: 'pointer',
                  visibility: hoveredItem === flow.id ? 'visible' : 'hidden',
                  marginLeft: 'auto'
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        ))}
      </div>
    </div>
  );

  const FlowHeader = () => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      width: '100%' 
    }}>
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
            style={{ 
              width: 120,
              marginLeft: 8
            }}
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
            setShowFlowSearch(!showFlowSearch);
            if (!showFlowSearch) {
              setSearchText('');
            }
          }}
          size="small"
          style={{ 
            backgroundColor: showFlowSearch ? '#e6f4ff' : 'transparent',
            color: showFlowSearch ? '#1677ff' : undefined
          }}
        />
        <Button 
          type="text" 
          icon={<PlusOutlined />} 
          onClick={(e) => {
            e.stopPropagation();
            onAddFlow();
          }}
          size="small"
        />
      </Space>
    </div>
  );

  const TemplatesSection = () => (
    <div style={{ padding: '0 8px' }}>
      <Input
        placeholder="Buscar template..."
        prefix={<SearchOutlined />}
        onChange={e => setSearchText(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin />
        </div>
      ) : schemas.length === 0 ? (
        <Empty 
          description="No hay templates disponibles" 
          style={{ margin: '20px 0' }}
        />
      ) : (
        <Tree
          showLine
          defaultExpandAll
          onSelect={onTemplateSelect}
          treeData={buildTreeData()}
          filterTreeNode={(node) => {
            if (searchText.trim() === '') return true;
            return node.title.toLowerCase().includes(searchText.toLowerCase());
          }}
          style={{ 
            overflow: 'auto',
            maxHeight: 'calc(100vh - 450px)'
          }}
        />
      )}
    </div>
  );

  return (
    <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Collapse 
          defaultActiveKey={['flows']} 
          style={{ flex: 1, overflowY: 'auto' }}
        >
          <Collapse.Panel 
            header={<FlowHeader />}
            key="flows"
          >
            <FlowsSection />
          </Collapse.Panel>
          
          <Collapse.Panel 
            header={<Space><ApiOutlined />Templates</Space>} 
            key="templates"
          >
            <TemplatesSection />
          </Collapse.Panel>
          
          <Collapse.Panel 
            header={<Space><ApiOutlined />Fields Response</Space>} 
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