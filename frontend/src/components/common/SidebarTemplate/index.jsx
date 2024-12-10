import React from 'react';
import { Tabs, Select, Layout, Button, Space, Dropdown } from 'antd';
import { DatabaseOutlined, SettingOutlined, PlusOutlined, MoreOutlined, DeleteOutlined } from '@ant-design/icons';
import EditableTable from '../EditableTable';

const { Sider } = Layout;

const styles = {
  sider: {
    background: '#fff',
    borderRight: '1px solid #f0f0f0',
    height: '100%'
  },
  scrollableDiv: {
    height: 'calc(100vh - 200px)',
    overflow: 'auto',
    padding: '8px'
  },
  templateItem: {
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '4px',
    marginBottom: '4px',
    transition: 'background-color 0.3s'
  },
  templateItemHover: {
    backgroundColor: '#f5f5f5'
  }
};

function SidebarTemplate({
  schemas,
  templates,
  parameters,
  onSchemaSelect,
  onTemplateSelect,
  onParametersChange,
  selectedSchemaId,
  onNewTemplate,
  onDeleteTemplate
}) {
  const [hoveredItem, setHoveredItem] = React.useState(null);

  const getDropdownItems = (template) => ({
    items: [
      {
        key: 'delete',
        icon: <DeleteOutlined />,
        label: 'Eliminar',
        onClick: () => {
          onDeleteTemplate(template);
        }
      }
    ]
  });

  const items = [
    {
      key: 'templates',
      label: (
        <span>
          <DatabaseOutlined />
          Templates
        </span>
      ),
      children: (
        <>
          <Space direction="vertical" style={{ width: '100%', padding: '0 8px' }}>
            <Select
              showSearch
              placeholder="Seleccionar schema"
              value={selectedSchemaId || null}
              style={{ width: '100%' }}
              onChange={onSchemaSelect}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={schemas.map(schema => ({
                value: schema.id,
                label: schema.name,
                title: schema.name
              }))}
            />
            {selectedSchemaId && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={onNewTemplate}
                style={{ width: '100%' }}
              >
                Nuevo Template
              </Button>
            )}
          </Space>
          <div style={styles.scrollableDiv}>
            {templates.map(template => (
              <div
                key={template.id}
                onMouseEnter={() => setHoveredItem(template.id)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  ...styles.templateItem,
                  ...(hoveredItem === template.id ? styles.templateItemHover : {}),
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div
                  onClick={() => onTemplateSelect(template)}
                  style={{ flex: 1, cursor: 'pointer' }}
                >
                  {template.name}
                </div>
                <Dropdown
                  menu={getDropdownItems(template)}
                  trigger={['click']}
                >
                  <MoreOutlined 
                    style={{ 
                      padding: '4px',
                      cursor: 'pointer',
                      visibility: hoveredItem === template.id ? 'visible' : 'hidden'
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </Dropdown>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      key: 'parameters',
      label: (
        <span>
          <SettingOutlined />
          Parámetros
        </span>
      ),
      children: (
        <div style={styles.scrollableDiv}>
          <EditableTable
            titleKey="Parámetro"
            titleValue="Tipo"
            name="params"
            data={parameters}
            onChange={onParametersChange}
          />
        </div>
      ),
    },
  ];

  return (
    <Sider width={300} style={styles.sider}>
      <Tabs defaultActiveKey="templates" items={items} />
    </Sider>
  );
}

export default SidebarTemplate; 