// import React from 'react';
// import ReactFlow, { addEdge, Background, Controls, MiniMap, useNodesState, useEdgesState } from 'reactflow';
// import 'reactflow/dist/style.css';

// const initialNodes = [
//   { id: '1', position: { x: 250, y: 0 }, data: { label: 'Input Node' }, type: 'input' },
//   { id: '2', position: { x: 100, y: 100 }, data: { label: 'Default Node' } },
//   { id: '3', position: { x: 400, y: 100 }, data: { label: 'Output Node' }, type: 'output' },
// ];

// const initialEdges = [{ id: 'e1-2', source: '1', target: '2' }];


function FlowView() {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

//   const onConnect = (params) => setEdges((eds) => addEdge(params, eds));

  return (
    <div>a</div>
    // <ReactFlow
    //   nodes={nodes}
    //   edges={edges}
    //   onNodesChange={onNodesChange}
    //   onEdgesChange={onEdgesChange}
    //   onConnect={onConnect}
    //   fitView
    // >
    //   <Background />
    //   <Controls />
    //   <MiniMap />
    // </ReactFlow>
  );
}

export default FlowView;
