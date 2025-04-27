import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import RequestForm from "../OperationSchema/components/RequestForm";
import CurlModal from "../OperationSchema/components/CurlModal";

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

  const [showCurlModal, setShowCurlModal] = useState(false);

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

  const handleCurlConfirm = (data) => {
    setOperationSchema({
      ...operationSchema,
      ...data
    });
    setShowCurlModal(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Schema de Operación</h1>
        <Button 
          onClick={() => setShowCurlModal(true)}
          variant="outline"
        >
          Importar desde cURL
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <RequestForm 
            entity={operationSchema} 
            onConfirm={handleOperationSave}
          />
        </CardContent>
      </Card>

      {showCurlModal && (
        <CurlModal
          onConfirm={handleCurlConfirm}
          onCancel={() => setShowCurlModal(false)}
        />
      )}
    </div>
  );
};

export default OperationSchemaView; 