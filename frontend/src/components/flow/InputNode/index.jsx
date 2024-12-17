import React, { useState } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import { Card, Typography, Tag, Input, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import './styles.css';

const { Text } = Typography;

const INPUT_TYPES = [
  { value: 'string', color: 'green' },
  { value: 'number', color: 'blue' },
  { value: 'boolean', color: 'orange' }
];

const InputNode = ({ data, selected, updateNodeData }) => {
  const [editingField, setEditingField] = useState(null);
  const [newFieldName, setNewFieldName] = useState('');

  const getNextFieldNumber = () => {
    const existingNumbers = data.fields
      ?.map(f => {
        const match = f.name.match(/^field_(\d+)$/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(n => !isNaN(n));

    const maxNumber = Math.max(0, ...existingNumbers);
    return maxNumber + 1;
  };

  const handleAddField = () => {
    const nextNumber = getNextFieldNumber();
    const newField = {
      name: `field_${nextNumber}`,
      type: 'string'
    };
    
    const updatedFields = [...(data.fields || []), newField];
    updateNodeData({ fields: updatedFields });
    setEditingField(newField.name);
    setNewFieldName(newField.name);
  };

  const handleFieldNameChange = (field, newName) => {
    const updatedFields = data.fields.map(f => 
      f === field ? { ...f, name: newName } : f
    );
    updateNodeData({ fields: updatedFields });
    setEditingField(null);
  };

  const handleTypeChange = (field, event) => {
    event.stopPropagation();
    const currentTypeIndex = INPUT_TYPES.findIndex(t => t.value === field.type);
    const nextTypeIndex = (currentTypeIndex + 1) % INPUT_TYPES.length;
    const updatedFields = data.fields.map(f =>
      f === field ? { ...f, type: INPUT_TYPES[nextTypeIndex].value } : f
    );
    updateNodeData({ fields: updatedFields });
  };

  return (
    <>
      <NodeResizer 
        minWidth={100}
        minHeight={50}
        isVisible={selected}
      />
      <Card 
        title={
          <div className="input-node-header">
            <span className="input-title">Inputs</span>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="add-input-button"
              onClick={handleAddField}
            />
          </div>
        }
        size="small"
        className="input-node-card"
      >
        <div className="input-list">
          {data.fields?.map((field) => (
            <div key={field.name} className="input-item">
              <Tag 
                color={INPUT_TYPES.find(t => t.value === field.type)?.color}
                onClick={(e) => handleTypeChange(field, e)}
                style={{ cursor: 'pointer' }}
              >
                {field.type}
              </Tag>
              
              {editingField === field.name ? (
                <Input
                  className="name-input"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                  onBlur={() => handleFieldNameChange(field, newFieldName)}
                  onPressEnter={() => handleFieldNameChange(field, newFieldName)}
                  autoFocus
                />
              ) : (
                <Text 
                  onDoubleClick={() => {
                    setEditingField(field.name);
                    setNewFieldName(field.name);
                  }}
                >
                  {field.name}
                </Text>
              )}
              
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
    </>
  );
};

export default InputNode; 