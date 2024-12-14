import React from 'react';
import { Checkbox } from 'antd';
import ReactFlow, { 
  Background,
  Controls,
  Handle,
  Position,
  applyEdgeChanges,
  applyNodeChanges
} from '@reactflow/core';
import '@reactflow/core/dist/style.css';

const FlowCanvas = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect 
}) => {
  // Nodo Template personalizado
  const TemplateNode = ({ data }) => (
    <div className="template-node" style={{
      padding: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
      background: 'white'
    }}>
      <header style={{ borderBottom: '1px solid #eee', marginBottom: '10px' }}>
        {data.name}
      </header>
      
      <section className="inputs">
        <h4>Inputs</h4>
        {data.parameters?.map(param => (
          <div key={param.id} style={{ position: 'relative', margin: '5px 0' }}>
            <small>{param.name}</small>
            <Handle 
              type="target" 
              position={Position.Left}
              id={param.id}
              style={{ background: '#555' }}
            />
          </div>
        ))}
      </section>

      <section className="outputs">
        <h4>Response</h4>
        {data.response?.map(field => (
          <div key={field.id} style={{ position: 'relative', margin: '5px 0' }}>
            <small>{field.name}</small>
            <Handle 
              type="source" 
              position={Position.Right}
              id={field.id}
              style={{ background: '#555' }}
            />
          </div>
        ))}
      </section>

      <section className="fields-selector">
        <Checkbox.Group onChange={(checkedValues) => data.onFieldsSelect(checkedValues)}>
          {data.response?.map(field => (
            <div key={field.id}>
              <Checkbox value={field.id}>{field.name}</Checkbox>
            </div>
          ))}
        </Checkbox.Group>
      </section>
    </div>
  );

  const nodeTypes = {
    template: TemplateNode
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default FlowCanvas;