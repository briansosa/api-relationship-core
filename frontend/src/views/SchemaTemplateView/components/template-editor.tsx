import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlayCircle, Save, AlertCircle, Check, Info, Trash2, FileText, FileCode, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TemplateEditorProps {
  operationId: string
  templateId: string | null
}

// Datos de ejemplo para los templates
const templates = {
  "3-1": {
    id: "3-1",
    name: "Locación por lat/lon",
    description: "Obtiene la ubicación usando coordenadas de latitud y longitud",
    operationId: "3",
    parameters: [
      { type: "query", name: "lat", placeholder: "{{latitud}}", description: "Latitud de la ubicación" },
      { type: "query", name: "lon", placeholder: "{{longitud}}", description: "Longitud de la ubicación" },
    ],
  },
  "3-2": {
    id: "3-2",
    name: "Locación por dirección",
    description: "Obtiene la ubicación usando una dirección",
    operationId: "3",
    parameters: [{ type: "query", name: "direccion", placeholder: "{{direccion}}", description: "Dirección completa" }],
  },
  "3-3": {
    id: "3-3",
    name: "Locación por código postal",
    description: "Obtiene la ubicación usando un código postal",
    operationId: "3",
    parameters: [{ type: "query", name: "codigo_postal", placeholder: "{{cp}}", description: "Código postal" }],
  },
  "1-1": {
    id: "1-1",
    name: "Post con ID",
    description: "Crea un post con un ID específico",
    operationId: "1",
    parameters: [
      { type: "body", name: "id", placeholder: "{{id}}", description: "ID del post" },
      { type: "body", name: "title", placeholder: "{{titulo}}", description: "Título del post" },
    ],
  },
}

// Datos de ejemplo para las operaciones
const operations = {
  "3": {
    id: "3",
    name: "Locacion",
    method: "GET",
    url: "https://apis.datos.gob.ar/georef/api/ubicacion",
    queryParams: [
      { key: "lat", value: "-34.610016" },
      { key: "lon", value: "-58.467947" },
    ],
  },
  "1": {
    id: "1",
    name: "Post",
    method: "POST",
    url: "https://jsonplaceholder.typicode.com/posts",
    body: `{
  "title": "foo",
  "body": "bar",
  "userId": 1
}`,
  },
}

export function TemplateEditor({ operationId, templateId }: TemplateEditorProps) {
  const [activeTab, setActiveTab] = useState("body")

  // Obtener el template seleccionado o crear uno nuevo basado en la operación
  const template = templateId
    ? templates[templateId]
    : {
        id: null,
        name: `Nuevo template de ${operations[operationId]?.name || "operación"}`,
        description: "",
        operationId,
        parameters: [],
      }

  // Obtener la operación base
  const operation = operations[operationId]

  // Construir la URL con parámetros para la vista previa
  const previewUrl = () => {
    try {
      const baseUrl = new URL(operation.url)
      operation.queryParams?.forEach((param) => {
        const templateParam = template.parameters.find((p) => p.type === "query" && p.name === param.key)
        const value = templateParam ? templateParam.placeholder : param.value
        baseUrl.searchParams.append(param.key, value)
      })
      return baseUrl.toString()
    } catch (e) {
      return operation.url
    }
  }

  // Función para renderizar un parámetro con su valor original y el placeholder
  const renderParameterValue = (type: string, name: string, originalValue: string) => {
    const param = template.parameters.find((p) => p.type === type && p.name === name)
    if (param) {
      return (
        <div className="flex items-center gap-2">
          <span className="line-through text-muted-foreground">{originalValue}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium text-primary">{param.placeholder}</span>
        </div>
      )
    }
    return originalValue
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header con información básica */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{operation.name}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <FileCode className="h-4 w-4 text-primary" />
              <Input className="w-64 font-medium" placeholder="Nombre del template" defaultValue={template.name} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
            <Button variant="default" size="sm">
              <PlayCircle className="mr-2 h-4 w-4" />
              Probar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="template-description" className="text-xs mb-1 block">
                Descripción
              </Label>
              <Input
                id="template-description"
                placeholder="Descripción del template..."
                defaultValue={template.description}
              />
            </div>
            <div className="w-24 flex flex-col justify-end">
              <Badge variant="outline" className="font-mono text-xs self-end">
                {operation.method}
              </Badge>
            </div>
          </div>

          {/* Vista previa de URL */}
          <Alert variant="outline" className="py-2 bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs font-mono truncate">{previewUrl()}</AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Contenido principal - Similar a OperationEditor */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b bg-background">
          <TabsList>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="params">Query Params</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="body" className="m-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Select defaultValue="json">
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Formato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="form">Form Data</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Formatear
                    </Button>
                    <Button variant="outline" size="sm">
                      Limpiar
                    </Button>
                  </div>
                </div>
                <Textarea
                  className="font-mono min-h-[300px]"
                  placeholder="Ingresa el cuerpo de la solicitud aquí..."
                  defaultValue={
                    operation.method === "POST"
                      ? `{
  "title": ${renderParameterValue("body", "title", '"foo"')},
  "body": ${renderParameterValue("body", "body", '"bar"')},
  "userId": 1${template.parameters.find((p) => p.type === "body" && p.name === "id") ? ',\n  "id": ' + renderParameterValue("body", "id", '"101"') : ""}
}`
                      : ""
                  }
                  disabled={operation.method === "GET"}
                />
                {operation.method === "GET" && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Las solicitudes GET no suelen incluir un cuerpo. Considera usar parámetros de consulta en su
                      lugar.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </TabsContent>

            <TabsContent value="headers" className="m-0">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5">
                          <Label htmlFor="header-key-1" className="text-xs mb-1 block">
                            Nombre
                          </Label>
                          <Input id="header-key-1" defaultValue="Content-Type" />
                        </div>
                        <div className="col-span-6">
                          <Label htmlFor="header-value-1" className="text-xs mb-1 block">
                            Valor
                          </Label>
                          <Input id="header-value-1" defaultValue="application/json" />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5">
                          <Label htmlFor="header-key-2" className="text-xs mb-1 block">
                            Nombre
                          </Label>
                          <Input id="header-key-2" defaultValue="Authorization" />
                        </div>
                        <div className="col-span-6">
                          <Label htmlFor="header-value-2" className="text-xs mb-1 block">
                            Valor
                          </Label>
                          <Input
                            id="header-value-2"
                            defaultValue={renderParameterValue("header", "Authorization", "Bearer token123")}
                          />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        Agregar encabezado
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="cursor-pointer">
                    Accept: application/json
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    Authorization: Bearer
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer">
                    Cache-Control: no-cache
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Haz clic en un encabezado común para agregarlo rápidamente.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="params" className="m-0">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {operation.queryParams?.map((param, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4">
                          <div className="col-span-5">
                            <Label htmlFor={`param-key-${index}`} className="text-xs mb-1 block">
                              Nombre
                            </Label>
                            <Input id={`param-key-${index}`} value={param.key} readOnly />
                          </div>
                          <div className="col-span-6">
                            <Label htmlFor={`param-value-${index}`} className="text-xs mb-1 block">
                              Valor
                            </Label>
                            <Input
                              id={`param-value-${index}`}
                              value={
                                template.parameters.find((p) => p.type === "query" && p.name === param.key)
                                  ?.placeholder || param.value
                              }
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className={
                                      template.parameters.find((p) => p.type === "query" && p.name === param.key)
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                    }
                                  >
                                    {template.parameters.find((p) => p.type === "query" && p.name === param.key) ? (
                                      <Check className="h-4 w-4" />
                                    ) : (
                                      <Info className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {template.parameters.find((p) => p.type === "query" && p.name === param.key)
                                    ? "Este parámetro está parametrizado"
                                    : "Parámetro original del schema"}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Lógica para agregar parámetro
                        }}
                      >
                        Agregar parámetro
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Alert variant="outline" className="bg-muted/50">
                  <Check className="h-4 w-4" />
                  <AlertDescription>
                    Los parámetros se agregarán automáticamente a la URL al ejecutar la solicitud.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>

            <TabsContent value="auth" className="m-0">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="auth-type">Tipo de autenticación</Label>
                        <Select defaultValue="none">
                          <SelectTrigger id="auth-type">
                            <SelectValue placeholder="Seleccionar tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sin autenticación</SelectItem>
                            <SelectItem value="basic">Basic Auth</SelectItem>
                            <SelectItem value="bearer">Bearer Token</SelectItem>
                            <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                            <SelectItem value="apikey">API Key</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="pt-2">
                        <p className="text-sm text-muted-foreground">
                          Selecciona un tipo de autenticación para configurar las credenciales.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="m-0">
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="timeout">Timeout (segundos)</Label>
                          <Input id="timeout" type="number" defaultValue="30" min="1" max="120" />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="redirect">Seguir redirecciones</Label>
                          <Select defaultValue="follow">
                            <SelectTrigger id="redirect">
                              <SelectValue placeholder="Redirecciones" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="follow">Seguir redirecciones</SelectItem>
                              <SelectItem value="error">Error en redirección</SelectItem>
                              <SelectItem value="manual">Manual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe el propósito de esta operación..."
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
