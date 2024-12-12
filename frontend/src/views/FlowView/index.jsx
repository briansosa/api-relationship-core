import React, { useState, useEffect } from 'react';
import { Layout } from 'antd';
import { ReactFlow, Background, Controls, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import TemplateSidebar from '../../components/common/TemplateSidebar';

import { GetAllSchemasWithTemplates } from '../../../wailsjs/go/handlers/OperationSchemaHandler';

const initialNodes = [
  {
    id: '1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Nodo 1' },
    draggable: true,
  },
];

const FlowView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [loading, setLoading] = useState(false);
  const [schemas, setSchemas] = useState([]);

  useEffect(() => {
    loadSchemas();
  }, []);

  const loadSchemas = async () => {
    setLoading(true);
    GetAllSchemasWithTemplates()
      .then((result) => {
        console.log("result schemas with templates", result);
        setSchemas(result);
      })
      .catch((error) => {
        console.error('Error loading schemas:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleTemplateSelect = (template) => {
    const newNode = {
      id: template.id,
      type: 'default',
      position: { x: Math.random() * 500, y: Math.random() * 500 }, // Posición aleatoria
      data: { 
        label: template.name,
        template: template
      },
      draggable: true,
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
          <ReactFlow 
            nodes={nodes}
            onNodesChange={onNodesChange}
            fitView
            panOnDrag={true}
            zoomOnScroll={true}
            panOnScroll={true}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </Layout>
    </Layout>
  );
};

export default FlowView;
