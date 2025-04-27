import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "../../../../components/ui/table";
import { Input } from "../../../../components/ui/input";
import { Button } from "../../../../components/ui/button";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";

const EditableTable = (props) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (Array.isArray(props.data)) {
      setTableData(
        props.data.map((value, index) => ({
          key: index,
          property: value.name,
          value: value.type,
        }))
      );
      return;
    }

    setTableData(
      Object.entries(props.data || {}).map(([key, value], index) => ({
        key: index,
        property: key,
        value: value,
      }))
    );
  }, [props.data]);

  const handleAddRow = () => {
    const newRow = {
      key: tableData.length > 0 ? Math.max(...tableData.map(item => item.key)) + 1 : 0,
      property: "",
      value: "",
    };
    setTableData([...tableData, newRow]);
  };

  const handleDeleteRow = (key) => {
    const newData = tableData.filter((item) => item.key !== key);
    setTableData(newData);
    handleTableChange(newData);
  };

  const handleTableChange = (newData) => {
    const jsonData = newData.reduce((acc, row) => {
      if (row.property && row.property.trim() !== "") {
        acc[row.property] = row.value;
      }
      return acc;
    }, {});

    const event = {
      target: {
        name: props.name,
        value: jsonData,
      },
    };

    props.onChange(event);
  };

  const handleInputChange = (key, field, value) => {
    const newData = tableData.map((item) => {
      if (item.key === key) {
        return { ...item, [field]: value };
      }
      return item;
    });
    setTableData(newData);
  };

  const handleInputBlur = (key) => {
    const currentRow = tableData.find((item) => item.key === key);
    if (
      currentRow.property.trim() === "" ||
      tableData.some(
        (item) => item.property === currentRow.property && item.key !== key
      )
    ) {
      handleDeleteRow(key);
    } else {
      handleTableChange(tableData);
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">{props.titleKey || "Propiedad"}</TableHead>
            <TableHead className="w-[50%]">{props.titleValue || "Valor"}</TableHead>
            <TableHead className="w-[10%] text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tableData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                No hay datos. Haga clic en "Agregar fila" para comenzar.
              </TableCell>
            </TableRow>
          ) : (
            tableData.map((row) => (
              <TableRow key={row.key}>
                <TableCell>
                  <Input
                    className="w-full"
                    value={row.property}
                    onChange={(e) => handleInputChange(row.key, 'property', e.target.value)}
                    onBlur={() => handleInputBlur(row.key)}
                    placeholder="Nombre"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    className="w-full"
                    value={row.value}
                    onChange={(e) => handleInputChange(row.key, 'value', e.target.value)}
                    onBlur={() => handleInputBlur(row.key)}
                    placeholder="Valor"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteRow(row.key)}
                    className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-100"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="flex justify-end p-2 bg-muted/20">
        <Button
          variant="outline"
          size="sm"
          onClick={handleAddRow}
          className="flex items-center gap-1"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Agregar fila</span>
        </Button>
      </div>
    </div>
  );
};

export default EditableTable; 