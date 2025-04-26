import React from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';

const NewOperationSchemaView = () => {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Operation Schema (Nueva Versión)</h1>
          <div className="space-x-4">
            <Button variant="outline" className="shadow-sm">
              Nuevo desde CURL
            </Button>
            <Button className="shadow-sm">
              Nuevo Schema
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <div className="col-span-3">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl">Schemas</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Lista de schemas irá aquí</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="col-span-9 space-y-6">
            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl">Request Form</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-6">
                  <div className="bg-gray-50/30 rounded-lg p-4 border">
                    <p className="text-sm text-muted-foreground">Formulario irá aquí</p>
                  </div>
                  <div className="flex space-x-4">
                    <Button variant="secondary" className="shadow-sm">
                      Probar Request
                    </Button>
                    <Button className="shadow-sm">
                      Guardar Schema
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-md">
              <CardHeader className="border-b bg-gray-50/50">
                <CardTitle className="text-xl">Response</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="bg-gray-50/30 rounded-lg p-4 border">
                  <p className="text-sm text-muted-foreground">Respuesta JSON irá aquí</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewOperationSchemaView; 