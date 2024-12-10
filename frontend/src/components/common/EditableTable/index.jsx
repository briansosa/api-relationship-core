import React, { useState, useEffect } from 'react';
import { Table, Input, Button } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const EditableTable = (props) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if(Array.isArray(props.data)) {
      setTableData(props.data.map((value, index) => ({
        key: index,
        property: value.name,
        value: value.type,
      })))
      return
    }

    setTableData(Object.entries(props.data).map(([key, value], index) => ({
      key: index,
      property: key,
      value: value,
    })));
  }, [props.data]);

  const handleAddRow = () => {
    const newRow = {
      key: tableData.length,
      property: '',
      value: '',
    };
    setTableData([...tableData, newRow]);
  };

  const handleDeleteRow = (key) => {
    const newData = tableData.filter(item => item.key !== key);
    setTableData(newData);
    handleTableChange(newData);
  };

  const handleTableChange = (newData) => {
    const jsonData = newData.reduce((acc, row) => {
      if (row.property && row.property.trim() !== '') {
        acc[row.property] = row.value;
      }
      return acc;
    }, {});

    const event = {
        target: {
            name: props.name,
            value: jsonData
        }
    }

    props.onChange(event);
  };

  const handleInputChange = (key, field, value) => {
    const newData = tableData.map(item => {
      if (item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setTableData(newData);
  };

  const handleInputBlur = (key) => {
    const currentRow = tableData.find(item => item.key === key);
    if (currentRow.property.trim() === '' || tableData.some(item => item.property === currentRow.property && item.key !== key)) {
      handleDeleteRow(key);
    } else {
      handleTableChange(tableData);
    }
  };

  const getColumns = () => {
    const baseColumns = [
      {
        title: props.titleKey,
        dataIndex: 'property',
        key: 'property',
        render: (text, record) => (
          <Input
            value={text}
            onChange={(e) => handleInputChange(record.key, 'property', e.target.value)}
            onBlur={() => handleInputBlur(record.key)}
            onPressEnter={() => handleInputBlur(record.key)}
          />
        ),
      },
      {
        title: props.titleValue,
        dataIndex: 'value',
        key: 'value',
        render: (text, record) => (
          <Input
            value={text}
            onChange={(e) => handleInputChange(record.key, 'value', e.target.value)}
            onBlur={() => handleTableChange(tableData)}
            onPressEnter={() => handleTableChange(tableData)}
          />
        ),
      }
    ];

    if (props.actions) {
      baseColumns.push(...props.actions);
    }

    baseColumns.push({
      key: 'delete',
      render: (text, record) => (
        <Button
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteRow(record.key)}
        />
      ),
    });

    return baseColumns;
  };

  const footer = () => {
    return (
        <Button
        type="dashed"
        onClick={handleAddRow}
        style={{ marginBottom: 16 }}
        icon={<PlusOutlined />}
      >
        Add
      </Button>
    )
  }

  return (
    <>
      <Table
        columns={getColumns()}
        dataSource={tableData}
        pagination={false}
        rowKey="key"
        footer={footer}
      />
    </>
  );
};

export default EditableTable;