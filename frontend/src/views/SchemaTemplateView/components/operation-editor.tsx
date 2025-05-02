import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlayCircle, Save, Copy, AlertCircle, Check, Info, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface OperationEditorProps {
  operationId: string
}

export function OperationEditor({ operationId }: OperationEditorProps) {
  const [activeTab, setActiveTab] = useState("body")
  const [method, setMethod] = useState("GET")
  const [url, setUrl] = useState("https://apis.datos.gob.ar/georef/api/ubicacion")
  const [queryParams, setQueryParams] = useState([
    { key: "lat", value: "-34.610016" },
    { key: "lon", value: "-58.467947" },
  ])

  // Construir la URL con parámetros para la vista previa
  const previewUrl = () => {
    try {
      const baseUrl = new URL(url)
      queryParams.forEach((param) => {
        if (param.key && param.value) {
          baseUrl.searchParams.append(param.key, param.value)
        }
      })
      return baseUrl.toString()
    } catch (e) {
      return url
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header con información básica */}
      <div className="p-4 border-b bg-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Select value={method} onValueChange={setMethod}>
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
            <Input className="w-64 font-medium" placeholder="Nombre de la operación" defaultValue="Locacion" />
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
            <Button variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Guardar
            </Button>
            <Button variant="default" size="sm">
              <PlayCircle className="mr-2 h-4 w-4" />
              Ejecutar
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
              placeholder="URL de la operación"
            />
            <Select defaultValue="30">
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
          <Alert variant="outline" className="py-2 bg-muted/50">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs font-mono truncate">{previewUrl()}</AlertDescription>
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
                    method === "POST"
                      ? `{
  "title": "foo",
  "body": "bar",
  "userId": 1
}`
                      : ""
                  }
                  disabled={method === "GET"}
                />
                {method === "GET" && (
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
                      {queryParams.map((param, index) => (
                        <div key={index} className="grid grid-cols-12 gap-4">
                          <div className="col-span-5">
                            <Label htmlFor={`param-key-${index}`} className="text-xs mb-1 block">
                              Nombre
                            </Label>
                            <Input
                              id={`param-key-${index}`}
                              value={param.key}
                              onChange={(e) => {
                                const newParams = [...queryParams]
                                newParams[index].key = e.target.value
                                setQueryParams(newParams)
                              }}
                            />
                          </div>
                          <div className="col-span-6">
                            <Label htmlFor={`param-value-${index}`} className="text-xs mb-1 block">
                              Valor
                            </Label>
                            <Input
                              id={`param-value-${index}`}
                              value={param.value}
                              onChange={(e) => {
                                const newParams = [...queryParams]
                                newParams[index].value = e.target.value
                                setQueryParams(newParams)
                              }}
                            />
                          </div>
                          <div className="col-span-1 flex items-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => {
                                const newParams = queryParams.filter((_, i) => i !== index)
                                setQueryParams(newParams)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQueryParams([...queryParams, { key: "", value: "" }])
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
