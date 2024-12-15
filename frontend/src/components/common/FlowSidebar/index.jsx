import React, { useState } from 'react';
import { Layout, Input, Tree, Typography, Empty, Spin, Button, Select, Space, Tabs, Dropdown, Modal } from 'antd';
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
  const [isRenameModalVisible, setIsRenameModalVisible] = useState(false);
  const [flowToRename, setFlowToRename] = useState(null);
  const [newName, setNewName] = useState('');

  const handleFlowSelect = (flowId) => {
    setSelectedFlowId(flowId);
    onFlowSelect?.(flowId);
  };

  const handleRenameClick = (flow) => {
    setFlowToRename(flow);
    setNewName(flow.name);
    setIsRenameModalVisible(true);
  };

  const handleRenameConfirm = () => {
    if (flowToRename && newName.trim()) {
      onRenameFlow(flowToRename.id, newName.trim());
      setIsRenameModalVisible(false);
    }
  };

  const getDropdownItems = (flow) => ({
    items: [
      {
        key: 'rename',
        icon: <EditOutlined />,
        label: 'Renombrar',
        onClick: () => handleRenameClick(flow)
      },
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Eliminar',
        onClick: () => onDeleteFlow?.(flow)
      }
    ]
  });

  // Función para construir los datos del Tree
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
            <Select
              showSearch
              placeholder="Seleccionar flow"
              value={selectedFlowId}
              style={{ width: '100%' }}
              onChange={handleFlowSelect}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={flows.map(flow => ({
                value: flow.id,
                label: flow.name,
                title: flow.name
              }))}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={onAddFlow}
              style={{ width: '100%' }}
            >
              Nuevo Flow
            </Button>
          </Space>
          <div style={{ 
            height: 'calc(100vh - 250px)',
            overflow: 'auto',
            padding: '8px 0'
          }}>
            {flows.map(flow => (
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
              >
                <div onClick={() => handleFlowSelect(flow.id)} style={{ flex: 1 }}>
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
    <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0', height: '100%' }}>
      <Tabs defaultActiveKey="flows" items={items} />
      
      <Modal
        title="Renombrar Flow"
        open={isRenameModalVisible}
        onOk={handleRenameConfirm}
        onCancel={() => setIsRenameModalVisible(false)}
        destroyOnClose
      >
        <Input
          placeholder="Nuevo nombre"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          autoFocus
        />
      </Modal>
    </Sider>
  );
};

export default FlowSidebar; 