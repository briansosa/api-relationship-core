import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { ReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import TemplateSidebar from '../../components/common/TemplateSidebar';

import { GetAllSchemasWithTemplates } from '../../../wailsjs/go/handlers/OperationSchemaHandler';

const initialNodes = [
  {
    id: '1',
    position: { x: 100, y: 100 },
    data: { label: 'Nodo 1' },
  },
];

const FlowView = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [loading, setLoading] = useState(false);
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    loadSchemas();
  }, []);

  // TODO: Implementar en backend
  const loadSchemas = async () => {
    setLoading(true);
 
    GetAllSchemasWithTemplates().then((result) => {
      console.log("result schemas with templates", result);
      
      setSchemas(result);
    }).catch((error) => {
      console.error('Error loading schemas:', error);
    }).finally(() => {
      setLoading(false);
    });
  };

  const handleTemplateSelect = (template) => {
    // Crear nuevo nodo en el canvas
    const newNode = {
      id: template.id,
      position: { x: 100, y: 100 }, // Posición inicial
      data: { 
        label: template.name,
        template: template
      }
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  return (
    <Layout style={{ height: '100vh' }}>
      <TemplateSidebar
        loading={loading}
        schemas={schemas}
        onTemplateSelect={handleTemplateSelect}
      />
      <Layout>
        <div style={{ width: '100%', height: '100%' }}>
          <ReactFlow nodes={nodes} />
        </div>
      </Layout>
    </Layout>
  );
};

export default FlowView;
