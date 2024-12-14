import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from 'antd';
import { ReactFlow, Background, Controls, useNodesState } from 'reactflow';
import 'reactflow/dist/style.css';
import TemplateSidebar from '../../components/common/TemplateSidebar';
import TemplateNode from '../../components/flow/TemplateNode';

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

const nodeTypes = {
  template: TemplateNode
};

const FlowView = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [loading, setLoading] = useState(false);
  const [schemas, setSchemas] = useState([]);

  // Configuración inicial del viewport
  const [viewport, setViewport] = useState({ 
    x: 0,
    y: 0,
    zoom: 0.5  // Zoom inicial más lejano
  });

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

  // Manejador para actualizar nodos que pasaremos al TemplateNode
  const handleNodeChange = useCallback((changes) => {
    setNodes((nds) => {
      return nds.map(node => {
        const change = changes.find(c => c.id === node.id);
        if (change) {
          return { ...node, ...change };
        }
        return node;
      });
    });
  }, [setNodes]);

  const handleTemplateSelect = (template) => {
    const schema = schemas.find(schema => schema.id === template.schema_id);

    const newNode = {
      id: template.id,
      type: 'template',
      position: { x: Math.random() * 500, y: Math.random() * 500 },
      data: { 
        template: template,
        responseSchema: schema?.schema || []
      },
      draggable: true,
      style: {
        width: 400,
        minWidth: 300,
        maxWidth: 800
      }
    };
    
    setNodes(prev => [...prev, newNode]);
  };

  // Manejador para eliminar nodos
  const handleNodesDelete = useCallback((nodesToDelete) => {
    setNodes(nodes => nodes.filter(node => 
      !nodesToDelete.find(n => n.id === node.id)
    ));
  }, [setNodes]);

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
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onNodesDelete={handleNodesDelete}
            defaultViewport={viewport}
            minZoom={0.2}
            maxZoom={1.5}
            fitView
            deleteKeyCode={['Backspace', 'Delete']}
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
