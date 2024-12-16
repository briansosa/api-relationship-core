import React, { useState } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { Card, Typography, Tag, Checkbox, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './styles.css';

const { Text } = Typography;

const INPUT_TYPES = [
  { value: 'string', color: 'green' },
  { value: 'number', color: 'blue' },
  { value: 'boolean', color: 'orange' }
];

const InputNode = ({ data }) => {
  return (
    <Card title="Inputs" size="small">
      <div className="input-node">
        {data.fields?.map((field) => (
          <div key={field.name} className="input-field">
            <Tag color="blue">{field.type}</Tag>
            <Text>{field.name}</Text>
            <Handle
              type="source"
              position={Position.Right}
              id={`input-${field.name}`}
              className="connection-handle"
            />
          </div>
        ))}
      </div>
    </Card>
  );
};

export default InputNode; 