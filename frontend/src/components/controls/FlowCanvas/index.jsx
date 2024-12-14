import React from 'react';
import { Checkbox } from 'antd';
import ReactFlow, { 
  Background,
  Controls,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';

const FlowCanvas = ({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onConnect 
}) => {
  // ... resto del código igual ...
};

export default FlowCanvas;