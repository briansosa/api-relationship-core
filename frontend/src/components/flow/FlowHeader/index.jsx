import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const FlowHeader = ({ data }) => {
  console.log("FlowHeader - data:", data); // Debug

  return (
    <div
      style={{
        padding: '16px',
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1000,
        background: 'rgba(255, 255, 255, 0.8)', // Semi-transparente
        borderRadius: '4px'
      }}
    >
      <Title level={3} style={{ margin: 0, color: '#262626' }}>
        {data?.name || 'Sin título'}
      </Title>
    </div>
  );
};

export default FlowHeader; 