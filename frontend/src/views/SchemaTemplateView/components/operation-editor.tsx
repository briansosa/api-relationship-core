import { useEffect, useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlayCircle, Save, Copy, AlertCircle, Check, Info, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useSchemaStore } from "@/stores/schema/store"
import { Schema, SchemaUpdate } from "@/types/schema"

interface OperationEditorProps {
  operationId: string
}

export function OperationEditor({ operationId }: OperationEditorProps) {
  // Estado local para manejo de la UI
  const [activeTab, setActiveTab] = useState("body")
  const [localSchema, setLocalSchema] = useState<Schema | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [newHeaderKey, setNewHeaderKey] = useState("")
  const [newHeaderValue, setNewHeaderValue] = useState("")
  const [newParamKey, setNewParamKey] = useState("")
  const [newParamValue, setNewParamValue] = useState("")
  
  // Ref para evitar actualizaciones repetidas
  const initializedRef = useRef(false)
  const selectedIdRef = useRef<string | null>(null)

  // Acceso al store global
  const { 
    schemas, 
    selectedSchema, 
    loading,
    selectSchema, 
    updateSchema, 
    testOperation,
    transformJsonSchema
  } = useSchemaStore()

  // Cargar el schema cuando cambie el operationId
  useEffect(() => {
    if (operationId && schemas.length > 0 && operationId !== selectedIdRef.current) {
      selectedIdRef.current = operationId
      selectSchema(operationId)
    }
  }, [operationId, schemas, selectSchema])

  // Sincronizar estado local con el schema seleccionado
  useEffect(() => {
    if (selectedSchema && !initializedRef.current) {
      setLocalSchema(selectedSchema)
      initializedRef.current = true
    }
  }, [selectedSchema])

  // Manejar cambios en los campos
  const handleFieldChange = (field: keyof Schema, value: any) => {
    if (!localSchema) return
    
    setLocalSchema({
      ...localSchema,
      [field]: value
    })
  }

  // Actualizar headers
  const handleAddHeader = () => {
    if (!newHeaderKey || !localSchema) return
    
    const updatedHeaders = { 
      ...(localSchema.headers || {}), 
      [newHeaderKey]: newHeaderValue 
    }
    
    setLocalSchema({
      ...localSchema,
      headers: updatedHeaders
    })
    
    setNewHeaderKey("")
    setNewHeaderValue("")
  }

  const handleRemoveHeader = (key: string) => {
    if (!localSchema || !localSchema.headers) return
    
    const updatedHeaders = { ...localSchema.headers }
    delete updatedHeaders[key]
    
    setLocalSchema({
      ...localSchema,
      headers: updatedHeaders
    })
  }

  // Actualizar query params
  const handleAddQueryParam = () => {
    if (!newParamKey || !localSchema) return
    
    const updatedParams = { 
      ...(localSchema.query_params || {}), 
      [newParamKey]: newParamValue 
    }
    
    setLocalSchema({
      ...localSchema,
      query_params: updatedParams
    })
    
    setNewParamKey("")
    setNewParamValue("")
  }

  const handleRemoveQueryParam = (key: string) => {
    if (!localSchema || !localSchema.query_params) return
    
    const updatedParams = { ...localSchema.query_params }
    delete updatedParams[key]
    
    setLocalSchema({
      ...localSchema,
      query_params: updatedParams
    })
  }

  // Guardar cambios
  const handleSaveSchema = async () => {
    if (!localSchema) return
    
    setIsSaving(true)
    try {
      const schemaUpdate: SchemaUpdate = {
        name: localSchema.name,
        method_type: localSchema.method_type,
        url: localSchema.url,
        timeout: localSchema.timeout,
        request_type: localSchema.request_type,
        headers: localSchema.headers,
        body: localSchema.body,
        query_params: localSchema.query_params
      }
      
      await updateSchema(localSchema.id, schemaUpdate)
      // Reiniciamos el ref para permitir actualizaciones futuras
      initializedRef.current = false
      console.log("Schema actualizado correctamente")
    } catch (error) {
      console.error("Error al guardar", error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsSaving(false)
    }
  }

  // Probar operación
  const handleTestOperation = async () => {
    if (!localSchema) return
    
    setIsTesting(true)
    try {
      const response = await testOperation(localSchema)
      
      // Actualizar el schema local con la respuesta
      setLocalSchema({
        ...localSchema,
        response
      })
      
      console.log("Operación ejecutada correctamente")
    } catch (error) {
      console.error("Error en la operación", error instanceof Error ? error.message : "Error desconocido")
    } finally {
      setIsTesting(false)
    }
  }

  // Generar schema a partir de la respuesta
  const handleGenerateSchema = () => {
    if (!localSchema || !localSchema.response) return
    
    const schema = transformJsonSchema(localSchema.response)
    setLocalSchema({
      ...localSchema,
      schema
    })
    
    console.log("Schema generado correctamente")
  }

  // Construir la URL con parámetros para la vista previa
  const getPreviewUrl = () => {
    if (!localSchema || !localSchema.url) return ""
    
    try {
      const baseUrl = new URL(localSchema.url)
      
      if (localSchema.query_params) {
        Object.entries(localSchema.query_params).forEach(([key, value]) => {
          if (key && value) {
            baseUrl.searchParams.append(key, value)
          }
        })
      }
      
      return baseUrl.toString()
    } catch (e) {
      return localSchema.url
    }
  }

  // Si no hay schema seleccionado o está cargando, mostrar estado de carga
  if (loading || !localSchema) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Cargando operación...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header con información básica */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Select 
              value={localSchema.method_type} 
              onValueChange={(value) => handleFieldChange("method_type", value)}
            >
              <SelectTrigger className="w-28 h-9">
                <SelectValue placeholder="Método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
            <Input 
              className="w-64 font-medium" 
              placeholder="Nombre de la operación" 
              value={localSchema.name} 
              onChange={(e) => handleFieldChange("name", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Crear una copia de esta operación</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSaveSchema} 
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Guardar
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleTestOperation}
              disabled={isTesting}
            >
              {isTesting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <PlayCircle className="mr-2 h-4 w-4" />
              )}
              Ejecutar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={localSchema.url || ""}
              onChange={(e) => handleFieldChange("url", e.target.value)}
              className="flex-1"
              placeholder="URL de la operación"
            />
            <Select 
              value={localSchema.timeout.toString()} 
              onValueChange={(value) => handleFieldChange("timeout", parseInt(value))}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Timeout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10s</SelectItem>
                <SelectItem value="30">30s</SelectItem>
                <SelectItem value="60">60s</SelectItem>
                <SelectItem value="120">120s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Vista previa de URL */}
          <Alert variant="default" className="py-2 bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs font-mono truncate">{getPreviewUrl()}</AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Pestañas de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-4 pt-2 border-b bg-background">
          <TabsList>
            <TabsTrigger value="body">Body</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="params">Query Params</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="body" className="m-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Select 
                    value={localSchema.request_type} 
                    onValueChange={(value) => handleFieldChange("request_type", value)}
                  >
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        try {
                          const formattedBody = localSchema.body 
                            ? JSON.stringify(JSON.parse(localSchema.body), null, 2) 
                            : ""
                          handleFieldChange("body", formattedBody)
                        } catch (e) {
                          console.error("Error de formato: JSON no válido")
                        }
                      }}
                    >
                      Formatear
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleFieldChange("body", "")}
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
                <Textarea
                  className="font-mono min-h-[300px]"
                  placeholder="Ingresa el cuerpo de la solicitud aquí..."
                  value={localSchema.body || ""}
                  onChange={(e) => handleFieldChange("body", e.target.value)}
                  disabled={localSchema.method_type === "GET"}
                />
                {localSchema.method_type === "GET" && (
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
                      {localSchema.headers && Object.entries(localSchema.headers).map(([key, value], index) => (
                        <div key={key} className="grid grid-cols-12 gap-4">
                          <div className="col-span-5">
                            <Label htmlFor={`header-key-${index}`} className="text-xs mb-1 block">
                              Nombre
                            </Label>
                            <Input id={`header-key-${index}`} value={key} disabled />
                          </div>
                          <div className="col-span-6">
                            <Label htmlFor={`header-value-${index}`} className="text-xs mb-1 block">
                              Valor
                            </Label>
                            <Input 
                              id={`header-value-${index}`} 
                              value={value}
                              onChange={(e) => {
                                const updatedHeaders = { ...localSchema.headers }
                                updatedHeaders[key] = e.target.value
                                handleFieldChange("headers", updatedHeaders)
                              }} 
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive"
                              onClick={() => handleRemoveHeader(key)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5">
                          <Label htmlFor="new-header-key" className="text-xs mb-1 block">
                            Nombre
                          </Label>
                          <Input 
                            id="new-header-key" 
                            value={newHeaderKey}
                            onChange={(e) => setNewHeaderKey(e.target.value)}
                            placeholder="Content-Type" 
                          />
                        </div>
                        <div className="col-span-6">
                          <Label htmlFor="new-header-value" className="text-xs mb-1 block">
                            Valor
                          </Label>
                          <Input 
                            id="new-header-value" 
                            value={newHeaderValue}
                            onChange={(e) => setNewHeaderValue(e.target.value)}
                            placeholder="application/json" 
                          />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button 
                            variant="default" 
                            size="icon"
                            onClick={handleAddHeader}
                            disabled={!newHeaderKey}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => {
                      setNewHeaderKey("Accept")
                      setNewHeaderValue("application/json")
                    }}
                  >
                    Accept: application/json
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => {
                      setNewHeaderKey("Content-Type")
                      setNewHeaderValue("application/json")
                    }}
                  >
                    Content-Type: application/json
                  </Badge>
                  <Badge 
                    variant="outline" 
                    className="cursor-pointer"
                    onClick={() => {
                      setNewHeaderKey("Authorization")
                      setNewHeaderValue("Bearer ")
                    }}
                  >
                    Authorization: Bearer
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
                      {localSchema.query_params && Object.entries(localSchema.query_params).map(([key, value], index) => (
                        <div key={key} className="grid grid-cols-12 gap-4">
                          <div className="col-span-5">
                            <Label htmlFor={`param-key-${index}`} className="text-xs mb-1 block">
                              Nombre
                            </Label>
                            <Input id={`param-key-${index}`} value={key} disabled />
                          </div>
                          <div className="col-span-6">
                            <Label htmlFor={`param-value-${index}`} className="text-xs mb-1 block">
                              Valor
                            </Label>
                            <Input 
                              id={`param-value-${index}`} 
                              value={value}
                              onChange={(e) => {
                                const updatedParams = { ...localSchema.query_params }
                                updatedParams[key] = e.target.value
                                handleFieldChange("query_params", updatedParams)
                              }} 
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive"
                              onClick={() => handleRemoveQueryParam(key)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div className="grid grid-cols-12 gap-4">
                        <div className="col-span-5">
                          <Label htmlFor="new-param-key" className="text-xs mb-1 block">
                            Nombre
                          </Label>
                          <Input 
                            id="new-param-key" 
                            value={newParamKey}
                            onChange={(e) => setNewParamKey(e.target.value)}
                            placeholder="page" 
                          />
                        </div>
                        <div className="col-span-6">
                          <Label htmlFor="new-param-value" className="text-xs mb-1 block">
                            Valor
                          </Label>
                          <Input 
                            id="new-param-value" 
                            value={newParamValue}
                            onChange={(e) => setNewParamValue(e.target.value)}
                            placeholder="1" 
                          />
                        </div>
                        <div className="col-span-1 flex items-end">
                          <Button 
                            variant="default" 
                            size="icon"
                            onClick={handleAddQueryParam}
                            disabled={!newParamKey}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
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
                      <div>
                        <Label htmlFor="request-type" className="text-sm font-medium mb-1 block">
                          Tipo de solicitud
                        </Label>
                        <Select 
                          value={localSchema.request_type} 
                          onValueChange={(value) => handleFieldChange("request_type", value)}
                        >
                          <SelectTrigger id="request-type">
                            <SelectValue placeholder="Tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="json">JSON</SelectItem>
                            <SelectItem value="xml">XML</SelectItem>
                            <SelectItem value="form">Form Data</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="timeout" className="text-sm font-medium mb-1 block">
                          Tiempo de espera (segundos)
                        </Label>
                        <Input 
                          id="timeout" 
                          type="number" 
                          value={localSchema.timeout}
                          onChange={(e) => handleFieldChange("timeout", parseInt(e.target.value))}
                          min="1"
                          max="300"
                        />
                      </div>
                      
                      {localSchema.response && (
                        <div>
                          <Button 
                            onClick={handleGenerateSchema}
                            variant="secondary"
                          >
                            Generar schema a partir de la respuesta
                          </Button>
                        </div>
                      )}
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
