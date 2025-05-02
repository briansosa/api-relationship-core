import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Copy, Download, RefreshCw, Clock, FileJson, FileText, FileCode } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ResponseViewerProps {
  operationId: string
  isTemplate?: boolean
  templateId?: string | null
}

export function ResponseViewer({ operationId, isTemplate = false, templateId = null }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState("body")

  // Datos de ejemplo basados en el ID
  const response =
    operationId === "3"
      ? {
          status: 200,
          time: "320ms",
          size: "1.2KB",
          body: `{
  "parametros": {
    "lat": -34.610016,
    "lon": -58.467947
  },
  "ubicacion": {
    "departamento": {
      "id": "02077",
      "nombre": "Comuna 11"
    },
    "lat": -34.610016,
    "lon": -58.467947,
    "municipio": {
      "id": "022077",
      "nombre": "Comuna 11"
    },
    "provincia": {
      "id": "02",
      "nombre": "Ciudad Autónoma de Buenos Aires"
    }
  }
}`,
          headers: [
            { name: "Content-Type", value: "application/json; charset=utf-8" },
            { name: "Cache-Control", value: "no-cache" },
            { name: "Connection", value: "keep-alive" },
            { name: "Date", value: "Wed, 01 May 2024 22:09:23 GMT" },
          ],
          history: [
            { date: "2024-05-01T22:09:23Z", status: 200, time: "320ms" },
            { date: "2024-05-01T21:45:12Z", status: 200, time: "315ms" },
            { date: "2024-05-01T20:30:05Z", status: 200, time: "350ms" },
          ],
        }
      : {
          status: 200,
          time: "250ms",
          size: "0.8KB",
          body: `{
  "title": "foo",
  "body": "bar",
  "userId": 1,
  "id": 101
}`,
          headers: [
            { name: "Content-Type", value: "application/json; charset=utf-8" },
            { name: "Cache-Control", value: "no-cache" },
            { name: "Connection", value: "keep-alive" },
            { name: "Date", value: "Wed, 01 May 2024 22:09:23 GMT" },
          ],
          history: [
            { date: "2024-05-01T22:09:23Z", status: 200, time: "250ms" },
            { date: "2024-05-01T21:45:12Z", status: 404, time: "215ms" },
            { date: "2024-05-01T20:30:05Z", status: 200, time: "280ms" },
          ],
        }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-500/10 text-green-600 border-green-200"
    if (status >= 400 && status < 500) return "bg-amber-500/10 text-amber-600 border-amber-200"
    if (status >= 500) return "bg-red-500/10 text-red-600 border-red-200"
    return "bg-gray-500/10 text-gray-600 border-gray-200"
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold">Respuesta</h3>
          {isTemplate && templateId && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              <FileCode className="h-3 w-3 mr-1" />
              Template
            </Badge>
          )}
          <Badge variant="outline" className={cn("font-mono text-xs", getStatusColor(response.status))}>
            {response.status} OK
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Copy className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Información de tiempo y tamaño */}
      <div className="flex items-center gap-3 px-3 py-2 border-b bg-muted/30 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{response.time}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          <span>{response.size}</span>
        </div>
        <div className="flex items-center gap-1">
          <FileJson className="h-3 w-3" />
          <span>application/json</span>
        </div>
      </div>

      {/* Pestañas de contenido */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-3 pt-2 border-b">
          <TabsList className="h-8">
            <TabsTrigger value="body" className="text-xs px-3">
              Body
            </TabsTrigger>
            <TabsTrigger value="headers" className="text-xs px-3">
              Headers
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs px-3">
              Historial
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <TabsContent value="body" className="p-0 m-0">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap">{response.body}</pre>
          </TabsContent>

          <TabsContent value="headers" className="p-4 m-0">
            <div className="space-y-2">
              {response.headers.map((header, index) => (
                <div key={index} className="grid grid-cols-2 text-sm">
                  <div className="font-medium">{header.name}</div>
                  <div className="font-mono">{header.value}</div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-4 m-0">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Historial de ejecuciones</CardTitle>
                <CardDescription>
                  {isTemplate && templateId
                    ? "Últimas ejecuciones de este template"
                    : "Últimas ejecuciones de esta operación"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {response.history.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 px-6">
                      <div className="text-sm">{new Date(item.date).toLocaleString()}</div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={cn("font-mono text-xs", getStatusColor(item.status))}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
