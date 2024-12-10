import React from 'react';
import { Checkbox } from 'antd';
import EditableTable from '../../common/EditableTable';

const ParameterizedEditableTable = ({ 
  titleKey, 
  titleValue, 
  name, 
  data, 
  onChange,
  parameters = []
}) => {

  const handleParameterToggle = (record, checked) => {
    let updatedParams = Array.isArray(parameters) ? [...parameters] : [];
    
    if (checked) {
      updatedParams.push({
        name: record.property,
        type: name === "headers" ? "header" : "query_param"
      });
    } else {
      updatedParams = updatedParams.filter(p => p.name !== record.property);
    }

    const e = {
      target: {
        name: "params",
        type: "checkbox",
        checked: checked,
        value: updatedParams
      }
    }
    
    onChange(e, false);
  };

  const handleDelete = (record) => {
    if (Array.isArray(parameters) && parameters.some(p => p.name === record.property)) {
      const updatedParams = parameters.filter(p => p.name !== record.property);
      
      const paramEvent = {
        target: {
          name: record.property,
          value: updatedParams
        }
      };

      onChange(paramEvent, true);
    }
  };

  const parameterColumn = {
    title: 'Es Parámetro',
    key: 'parameter',
    width: '15%',
    render: (_, record) => (
      <Checkbox
        checked={Array.isArray(parameters) && parameters.some(p => p.name === record.property)}
        onChange={(e) => handleParameterToggle(record, e.target.checked)}
      />
    )
  };

  return (
    <EditableTable
      titleKey={titleKey}
      titleValue={titleValue}
      name={name}
      data={data}
      onChange={onChange}
      onDelete={handleDelete}
      actions={[parameterColumn]}
    />
  );
};

export default ParameterizedEditableTable; 