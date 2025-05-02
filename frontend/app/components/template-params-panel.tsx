// Importamos el archivo para evitar el error de 'use client'
import useClient from '../../src/app/use-client'

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Link } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TemplateParamsPanelProps {
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

export function TemplateParamsPanel({ operationId, templateId }: TemplateParamsPanelProps) {
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

  const [activeSection, setActiveSection] = useState<"url" | "headers" | "body">("url")

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b bg-card flex items-center justify-between">
        <h3 className="font-semibold">Parámetros del Template</h3>
        <Badge variant="outline" className="font-mono text-xs">
          {template.parameters.length} parámetros
        </Badge>
      </div>

      {/* Tabs para secciones */}
      <div className="flex border-b">
        <Button
          variant={activeSection === "url" ? "default" : "ghost"}
          size="sm"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-1"
          data-state={activeSection === "url" ? "active" : "inactive"}
          onClick={() => setActiveSection("url")}
        >
          URL
        </Button>
        <Button
          variant={activeSection === "headers" ? "default" : "ghost"}
          size="sm"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-1"
          data-state={activeSection === "headers" ? "active" : "inactive"}
          onClick={() => setActiveSection("headers")}
        >
          Headers
        </Button>
        <Button
          variant={activeSection === "body" ? "default" : "ghost"}
          size="sm"
          className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary flex-1"
          data-state={activeSection === "body" ? "active" : "inactive"}
          onClick={() => setActiveSection("body")}
        >
          Body
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4">
          {/* Sección de parámetros de URL */}
          {activeSection === "url" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link className="h-4 w-4" />
                  Parámetros de URL
                </CardTitle>
                <CardDescription>Define los parámetros que se reemplazarán en la URL</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {operation.queryParams?.map((param, index) => (
                    <div key={index} className="space-y-2 pb-4 border-b last:border-0">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">{param.key}</Label>
                        <Switch
                          checked={!!template.parameters.find((p) => p.type === "query" && p.name === param.key)}
                          onCheckedChange={() => {
                            // Lógica para activar/desactivar parámetro
                          }}
                        />
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Valor original:</span>
                        <span className="font-mono">{param.value}</span>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`param-placeholder-${index}`} className="text-xs">
                          Placeholder
                        </Label>
                        <Input
                          id={`param-placeholder-${index}`}
                          placeholder="{{parametro}}"
                          defaultValue={
                            template.parameters.find((p) => p.type === "query" && p.name === param.key)?.placeholder ||
                            ""
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor={`param-description-${index}`} className="text-xs">
                          Descripción
                        </Label>
                        <Input
                          id={`param-description-${index}`}
                          placeholder="Descripción del parámetro..."
                          defaultValue={
                            template.parameters.find((p) => p.type === "query" && p.name === param.key)?.description ||
                            ""
                          }
                        />
                      </div>
                    </div>
                  ))}

                  {(!operation.queryParams || operation.queryParams.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground">
                      Esta operación no tiene parámetros de URL
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sección de parámetros de Headers */}
          {activeSection === "headers" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Headers</CardTitle>
                <CardDescription>Define los parámetros que se reemplazarán en los headers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2 pb-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Authorization</Label>
                      <Switch
                        checked={!!template.parameters.find((p) => p.type === "header" && p.name === "Authorization")}
                        onCheckedChange={() => {
                          // Lógica para activar/desactivar parámetro
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Valor original:</span>
                      <span className="font-mono">Bearer token123</span>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="header-placeholder" className="text-xs">
                        Placeholder
                      </Label>
                      <Input
                        id="header-placeholder"
                        placeholder="{{token}}"
                        defaultValue={
                          template.parameters.find((p) => p.type === "header" && p.name === "Authorization")
                            ?.placeholder || ""
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="header-description" className="text-xs">
                        Descripción
                      </Label>
                      <Input
                        id="header-description"
                        placeholder="Descripción del parámetro..."
                        defaultValue={
                          template.parameters.find((p) => p.type === "header" && p.name === "Authorization")
                            ?.description || ""
                        }
                      />
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    Agregar header
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sección de parámetros de Body */}
          {activeSection === "body" && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Body</CardTitle>
                <CardDescription>
                  Define los parámetros que se reemplazarán en el cuerpo de la solicitud
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {operation.method !== "GET" ? (
                    <>
                      <div className="space-y-2 pb-4 border-b">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">title</Label>
                          <Switch
                            checked={!!template.parameters.find((p) => p.type === "body" && p.name === "title")}
                            onCheckedChange={() => {
                              // Lógica para activar/desactivar parámetro
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Valor original:</span>
                          <span className="font-mono">"foo"</span>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="body-title-placeholder" className="text-xs">
                            Placeholder
                          </Label>
                          <Input
                            id="body-title-placeholder"
                            placeholder="{{titulo}}"
                            defaultValue={
                              template.parameters.find((p) => p.type === "body" && p.name === "title")?.placeholder ||
                              ""
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="body-title-description" className="text-xs">
                            Descripción
                          </Label>
                          <Input
                            id="body-title-description"
                            placeholder="Descripción del parámetro..."
                            defaultValue={
                              template.parameters.find((p) => p.type === "body" && p.name === "title")?.description ||
                              ""
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2 pb-4 border-b">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">body</Label>
                          <Switch
                            checked={!!template.parameters.find((p) => p.type === "body" && p.name === "body")}
                            onCheckedChange={() => {
                              // Lógica para activar/desactivar parámetro
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Valor original:</span>
                          <span className="font-mono">"bar"</span>
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="body-content-placeholder" className="text-xs">
                            Placeholder
                          </Label>
                          <Input
                            id="body-content-placeholder"
                            placeholder="{{contenido}}"
                            defaultValue={
                              template.parameters.find((p) => p.type === "body" && p.name === "body")?.placeholder || ""
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="body-content-description" className="text-xs">
                            Descripción
                          </Label>
                          <Input
                            id="body-content-description"
                            placeholder="Descripción del parámetro..."
                            defaultValue={
                              template.parameters.find((p) => p.type === "body" && p.name === "body")?.description || ""
                            }
                          />
                        </div>
                      </div>

                      <Button variant="outline" size="sm">
                        Agregar campo
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      Las solicitudes GET no tienen cuerpo para parametrizar
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Vista previa de parámetros */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-3">Vista previa de parámetros</h4>
            <div className="bg-muted p-3 rounded-md space-y-2">
              {template.parameters.length > 0 ? (
                template.parameters.map((param, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono text-xs">
                        {param.type}
                      </Badge>
                      <span className="font-medium">{param.name}</span>
                    </div>
                    <span className="font-mono text-primary">{param.placeholder}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-2 text-muted-foreground">
                  No hay parámetros definidos para este template
                </div>
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
