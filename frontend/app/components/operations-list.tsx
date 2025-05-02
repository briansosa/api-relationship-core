"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlayCircle, Star, Trash2, FileCode, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface OperationsListProps {
  selectedOperation: string | null
  onSelectOperation: (id: string) => void
  searchQuery: string
  viewMode: "schemas" | "templates"
  selectedTemplate: string | null
  onSelectTemplate: (id: string | null) => void
}

// Datos de ejemplo para schemas
const operations = [
  {
    id: "1",
    name: "Post",
    method: "POST",
    favorite: true,
    lastUsed: "2024-05-01T10:30:00Z",
    templates: [
      { id: "1-1", name: "Post con ID" },
      { id: "1-2", name: "Post con datos personalizados" },
    ],
  },
  {
    id: "2",
    name: "Ubicación",
    method: "GET",
    favorite: false,
    lastUsed: "2024-04-29T14:20:00Z",
    templates: [{ id: "2-1", name: "Ubicación por coordenadas" }],
  },
  {
    id: "3",
    name: "Locacion",
    method: "GET",
    favorite: true,
    lastUsed: "2024-05-01T09:15:00Z",
    templates: [
      { id: "3-1", name: "Locación por lat/lon" },
      { id: "3-2", name: "Locación por dirección" },
      { id: "3-3", name: "Locación por código postal" },
    ],
  },
  {
    id: "4",
    name: "Json test post by user",
    method: "GET",
    favorite: false,
    lastUsed: "2024-04-28T11:45:00Z",
    templates: [],
  },
  {
    id: "5",
    name: "Actualizar usuario",
    method: "PUT",
    favorite: false,
    lastUsed: "2024-04-27T16:30:00Z",
    templates: [
      { id: "5-1", name: "Actualizar nombre" },
      { id: "5-2", name: "Actualizar email" },
    ],
  },
  {
    id: "6",
    name: "Eliminar registro",
    method: "DELETE",
    favorite: false,
    lastUsed: "2024-04-26T13:10:00Z",
    templates: [],
  },
]

export function OperationsList({
  selectedOperation,
  onSelectOperation,
  searchQuery,
  viewMode,
  selectedTemplate,
  onSelectTemplate,
}: OperationsListProps) {
  const [expandedOperations, setExpandedOperations] = useState<Record<string, boolean>>({
    "1": true,
    "3": true,
  })

  const filteredOperations = operations.filter((op) => op.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-green-500/10 text-green-600 border-green-200"
      case "POST":
        return "bg-blue-500/10 text-blue-600 border-blue-200"
      case "PUT":
        return "bg-amber-500/10 text-amber-600 border-amber-200"
      case "DELETE":
        return "bg-red-500/10 text-red-600 border-red-200"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-200"
    }
  }

  const toggleExpand = (id: string) => {
    setExpandedOperations((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="p-3 space-y-2">
      {filteredOperations.map((operation) => (
        <div key={operation.id} className="space-y-1">
          <Card
            className={cn(
              "p-3 cursor-pointer transition-all border hover:shadow-sm",
              selectedOperation === operation.id && viewMode === "schemas"
                ? "border-primary/50 bg-primary/5"
                : "hover:border-muted-foreground/20",
            )}
            onClick={() => {
              onSelectOperation(operation.id)
              if (viewMode === "templates") {
                if (operation.templates.length > 0) {
                  setExpandedOperations((prev) => ({
                    ...prev,
                    [operation.id]: true,
                  }))
                } else {
                  onSelectTemplate(null)
                }
              }
            }}
          >
            <div className="flex items-center justify-between mb-1">
              <Badge variant="outline" className={cn("font-mono text-xs px-2 py-0", getMethodColor(operation.method))}>
                {operation.method}
              </Badge>
              <div className="flex gap-1">
                {viewMode === "schemas" ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Lógica para ejecutar
                      }}
                    >
                      <PlayCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-6 w-6",
                        operation.favorite ? "text-amber-500" : "text-muted-foreground hover:text-amber-500",
                      )}
                      onClick={(e) => {
                        e.stopPropagation()
                        // Lógica para marcar como favorito
                      }}
                    >
                      <Star className="h-4 w-4" fill={operation.favorite ? "currentColor" : "none"} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Lógica para eliminar
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  operation.templates.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(operation.id)
                      }}
                    >
                      {expandedOperations[operation.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  )
                )}
              </div>
            </div>
            <h3 className="font-medium text-sm">{operation.name}</h3>
            {viewMode === "schemas" && (
              <p className="text-xs text-muted-foreground mt-1">
                Última ejecución: {new Date(operation.lastUsed).toLocaleDateString()}
              </p>
            )}
            {viewMode === "templates" && (
              <p className="text-xs text-muted-foreground mt-1">
                {operation.templates.length} {operation.templates.length === 1 ? "template" : "templates"}
              </p>
            )}
          </Card>

          {/* Templates list */}
          {viewMode === "templates" && expandedOperations[operation.id] && operation.templates.length > 0 && (
            <div className="pl-4 border-l ml-3 space-y-1">
              {operation.templates.map((template) => (
                <Card
                  key={template.id}
                  className={cn(
                    "p-2 cursor-pointer transition-all border hover:shadow-sm",
                    selectedTemplate === template.id && selectedOperation === operation.id
                      ? "border-primary/50 bg-primary/5"
                      : "hover:border-muted-foreground/20",
                  )}
                  onClick={() => {
                    onSelectOperation(operation.id)
                    onSelectTemplate(template.id)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{template.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Lógica para ejecutar template
                        }}
                      >
                        <PlayCircle className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          // Lógica para eliminar template
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}
      {filteredOperations.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">No se encontraron operaciones</div>
      )}
    </div>
  )
}
