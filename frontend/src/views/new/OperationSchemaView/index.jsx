import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import RequestForm from "../OperationSchema/components/RequestForm";

// Importar los handlers de Wails cuando estén disponibles
// import { SaveOperationSchema } from "../../../../wailsjs/go/handlers/OperationHandler";

const OperationSchemaView = () => {
  const [operationSchema, setOperationSchema] = useState({
    body: null,
    headers: {},
    method_type: "GET",
    name: "Nueva Operación Schema",
    query_params: {},
    request_type: "",
    timeout: 0,
    url: "",
    templates_id: []
  });

  const handleOperationSave = async (data) => {
    try {
      // Aquí iría la lógica para guardar la operación
      // await SaveOperationSchema(data);
      console.log("Operación guardada:", data);
      setOperationSchema(data);
    } catch (error) {
      console.error("Error al guardar la operación:", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardContent className="p-6">
          <RequestForm 
            entity={operationSchema} 
            onConfirm={handleOperationSave}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationSchemaView; 