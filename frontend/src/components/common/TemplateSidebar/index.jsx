import React, { useState } from 'react';
import { Layout, Input, Tree, Typography, Empty, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
const { Sider } = Layout;
const { Text } = Typography;

const TemplateSidebar = ({ 
  loading = false,
  schemas = [], // Array de schemas con sus templates
  onTemplateSelect // Callback cuando se selecciona un template para agregar al canvas
}) => {
  const [searchText, setSearchText] = useState('');

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
        template: template // Guardamos el template completo para pasarlo en onSelect
      }))
    }));
  };

  // Filtrar el árbol basado en la búsqueda
  const filterTreeNode = (node) => {
    if (searchText.trim() === '') return true;
    
    const title = node.title.toLowerCase();
    return title.includes(searchText.toLowerCase());
  };

  // Manejador de selección de template
  const handleSelect = (selectedKeys, info) => {
    if (info.node.isLeaf) {
      onTemplateSelect(info.node.template);
    }
  };

  return (
    <Sider 
      width={300} 
      style={{ 
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
        height: '100%'
      }}
    >
      <div style={{ padding: '16px' }}>
        <Text strong>Templates</Text>
        <Input
          placeholder="Buscar template..."
          prefix={<SearchOutlined />}
          onChange={e => setSearchText(e.target.value)}
          style={{ marginTop: 8, marginBottom: 8 }}
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
            onSelect={handleSelect}
            treeData={buildTreeData()}
            filterTreeNode={filterTreeNode}
            style={{ 
              overflow: 'auto',
              maxHeight: 'calc(100vh - 120px)'
            }}
          />
        )}
      </div>
    </Sider>
  );
};

export default TemplateSidebar; 