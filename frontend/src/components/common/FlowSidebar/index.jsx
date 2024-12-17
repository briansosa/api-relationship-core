import React, { useState } from 'react';
import { Layout, Input, Tree, Typography, Empty, Spin, Button, Space, Tabs, Dropdown, Modal } from 'antd';
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
  onRenameFlow
}) => {
  const [searchText, setSearchText] = useState('');
  const [selectedFlowId, setSelectedFlowId] = useState(null);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newFlowName, setNewFlowName] = useState('');

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

  const items = [
    {
      key: 'flows',
      label: (
        <span>
          <ShareAltOutlined />
          Flows
        </span>
      ),
      children: (
        <div style={{ padding: '0 8px' }}>
          <Space direction="vertical" style={{ width: '100%', marginBottom: 16 }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onAddFlow}
              style={{ width: '100%' }}
            >
              Nuevo Flow
            </Button>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Buscar flow..."
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
          </Space>
          <div style={{ 
            height: 'calc(100vh - 250px)',
            overflow: 'auto',
            padding: '8px 0'
          }}>
            {filteredFlows.map(flow => (
              <div
                key={flow.id}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  marginBottom: '4px',
                  backgroundColor: selectedFlowId === flow.id ? '#e6f7ff' : 'transparent',
                  transition: 'background-color 0.3s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
                onMouseEnter={() => setHoveredItem(flow.id)}
                onMouseLeave={() => setHoveredItem(null)}
                onClick={() => handleFlowSelect(flow.id)}
              >
                <div style={{ flex: 1 }}>
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
                      visibility: hoveredItem === flow.id ? 'visible' : 'hidden'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      key: 'templates',
      label: (
        <span>
          <ApiOutlined />
          Templates
        </span>
      ),
      children: (
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
                maxHeight: 'calc(100vh - 200px)'
              }}
            />
          )}
        </div>
      )
    }
  ];

  return (
    <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
      <Tabs defaultActiveKey="flows" items={items} />
      <Modal
        title="Renombrar Flujo"
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          value={newFlowName}
          onChange={(e) => setNewFlowName(e.target.value)}
          placeholder="Nuevo nombre del flujo"
        />
      </Modal>
    </Sider>
  );
};

export default FlowSidebar; 