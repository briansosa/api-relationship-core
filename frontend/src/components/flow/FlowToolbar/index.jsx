import React from 'react';
import { Button, Space, Typography } from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { Text } = Typography;

const FlowToolbar = ({ data }) => {
  const handleSave = () => {
    console.log('Saving flow...');
  };

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      left: '50%',
      transform: 'translate(-50%, 0)',
      padding: '8px 16px',
      background: 'white',
      borderRadius: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      pointerEvents: 'all',
      zIndex: 999,
      userSelect: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    }}>
      <Text strong style={{ fontSize: '16px' }}>{data?.name || 'Sin título'}</Text>
      <Space>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={handleSave}
        >
          Save Flow
        </Button>
      </Space>
    </div>
  );
};

export default FlowToolbar; 