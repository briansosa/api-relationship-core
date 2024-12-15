import React from 'react';

const FlowHeader = ({ data }) => {
  return (
    <div style={{ 
      padding: '12px 24px',
      display: 'flex',
      alignItems: 'center',
      borderBottom: '1px solid #f0f0f0',
      backgroundColor: '#0000'
    }}>
      <div>{data.name}</div>
    </div>
  );
};

export default FlowHeader; 