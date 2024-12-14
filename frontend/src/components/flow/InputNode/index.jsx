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

const InputNode = ({ data, selected }) => {
  const [inputs, setInputs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const handleAddInput = () => {
    const newInput = {
      id: `input-${Date.now()}`,
      name: `input_${inputs.length + 1}`,
      type: 'string'
    };
    setInputs(prev => [...prev, newInput]);
    setEditingId(newInput.id);
  };

  const handleNameChange = (id, value) => {
    setInputs(prev => prev.map(input => 
      input.id === id ? { ...input, name: value } : input
    ));
  };

  const handleTypeChange = (input) => {
    const currentIndex = INPUT_TYPES.findIndex(t => t.value === input.type);
    const nextIndex = (currentIndex + 1) % INPUT_TYPES.length;
    
    setInputs(prev => prev.map(i => 
      i.id === input.id ? { ...i, type: INPUT_TYPES[nextIndex].value } : i
    ));
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <NodeResizer 
        minWidth={250}
        maxWidth={400}
        minHeight={50}
        isVisible={selected}
        handleStyle={{ background: '#1890ff' }}
      />
      <Card 
        className="input-node"
        title={
          <div className="input-node-header">
            <Text strong className="input-title">Inputs</Text>
            <Button 
              type="default"
              icon={<PlusOutlined style={{ color: '#1890ff' }} />}
              className="add-input-button"
              onClick={handleAddInput}
            />
          </div>
        }
        size="small"
      >
        <div className="input-list">
          {inputs.map(input => (
            <div key={input.id} className="input-item">
              <Checkbox />
              <Tag
                color={INPUT_TYPES.find(t => t.value === input.type).color}
                onClick={() => handleTypeChange(input)}
                style={{ cursor: 'pointer' }}
              >
                {input.type}
              </Tag>
              {editingId === input.id ? (
                <input
                  className="name-input"
                  value={input.name}
                  onChange={e => handleNameChange(input.id, e.target.value)}
                  onBlur={() => setEditingId(null)}
                  onKeyPress={e => e.key === 'Enter' && setEditingId(null)}
                  autoFocus
                />
              ) : (
                <Text 
                  onDoubleClick={() => setEditingId(input.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {input.name}
                </Text>
              )}
              <Handle
                type="source"
                position={Position.Right}
                id={`input-${input.name}`}
                className="connection-handle"
              />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default InputNode; 