import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { PlayCircle, Star, Trash2, FileCode, ChevronRight, ChevronDown, Loader2, Copy, AlertCircle, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Schema } from "@/types/schema"
import { useSchemaStore } from "@/stores/schema/store"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface OperationsListProps {
  selectedOperation: string | null
  onSelectOperation: (id: string) => void
  searchQuery: string
  viewMode: "schemas" | "templates"
  selectedTemplate: string | null
  onSelectTemplate: (id: string | null) => void
  loading?: boolean
  schemas?: Schema[]
}

export function OperationsList({
  selectedOperation,
  onSelectOperation,
  searchQuery,
  viewMode,
  selectedTemplate,
  onSelectTemplate,
  loading = false,
  schemas = []
}: OperationsListProps) {
  const [expandedOperations, setExpandedOperations] = useState<Record<string, boolean>>({})
  const { toggleFavorite, testOperation, duplicateSchema, deleteSchema } = useSchemaStore()
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [schemasToDelete, setSchemasToDelete] = useState<Set<string>>(new Set())
  const [deletionInProgress, setDeletionInProgress] = useState<string | null>(null)
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Filtrar schemas por nombre según la búsqueda
  const filteredSchemas = schemas.filter((schema) => 
    schema.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
  
  const handleToggleFavorite = (e: React.MouseEvent, schemaId: string) => {
    e.stopPropagation()
    toggleFavorite(schemaId)
    setOpenMenuId(null)
  }
  
  const handleTestOperation = (e: React.MouseEvent, schema: Schema) => {
    e.stopPropagation()
    testOperation(schema)
  }

  const handleDuplicateSchema = async (e: React.MouseEvent, schemaId: string) => {
    e.stopPropagation()
    setDuplicatingId(schemaId)
    try {
      const duplicatedSchema = await duplicateSchema(schemaId)
      // Si la duplicación tuvo éxito, seleccionamos el nuevo schema
      if (duplicatedSchema) {
        onSelectOperation(duplicatedSchema.id)
      }
    } catch (error) {
      console.error("Error al duplicar schema:", error)
    } finally {
      setDuplicatingId(null)
      setOpenMenuId(null)
    }
  }

  const handleDeleteSchema = async (e: React.MouseEvent, schemaId: string) => {
    e.stopPropagation()
    
    // Si el schema ya está marcado para eliminar, procedemos con la eliminación
    if (schemasToDelete.has(schemaId)) {
      setDeletionInProgress(schemaId)
      try {
        await deleteSchema(schemaId)
        
        // Si el schema eliminado es el que estaba seleccionado, limpiamos la selección
        if (selectedOperation === schemaId) {
          onSelectOperation("")
        }
        
        // Limpiar el estado de eliminación
        const updatedSchemasToDelete = new Set(schemasToDelete)
        updatedSchemasToDelete.delete(schemaId)
        setSchemasToDelete(updatedSchemasToDelete)
      } catch (error) {
        console.error("Error al eliminar schema:", error)
      } finally {
        setDeletionInProgress(null)
      }
    } else {
      // Marcar el schema para eliminar (primer paso)
      const updatedSchemasToDelete = new Set(schemasToDelete)
      updatedSchemasToDelete.add(schemaId)
      setSchemasToDelete(updatedSchemasToDelete)
      
      // Configuramos un timer para quitar la marca después de 3 segundos si no se confirma
      setTimeout(() => {
        setSchemasToDelete(prev => {
          const updated = new Set(prev)
          updated.delete(schemaId)
          return updated
        })
      }, 3000)
    }
    
    setOpenMenuId(null)
  }

  // Mostrar spinner mientras se cargan los datos
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-sm text-muted-foreground">Cargando operaciones...</p>
        </div>
      </div>
    )
  }

  // Mostrar mensaje cuando no hay resultados
  if (filteredSchemas.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {schemas.length === 0 
              ? "No hay operaciones disponibles" 
              : "No se encontraron operaciones que coincidan con la búsqueda"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-2">
      {filteredSchemas.map((schema) => {
        const isMarkedForDeletion = schemasToDelete.has(schema.id)
        const isMenuOpen = openMenuId === schema.id
        const showMenu = (hoveredCardId === schema.id || isMenuOpen) && !isMarkedForDeletion && viewMode === "schemas"
        
        return (
          <div key={schema.id} className="space-y-1">
            <Card
              className={cn(
                "p-2 cursor-pointer transition-all border hover:shadow-sm",
                isMarkedForDeletion 
                  ? "border-red-500 bg-red-50 dark:bg-red-950/20" 
                  : selectedOperation === schema.id && viewMode === "schemas"
                    ? "border-primary/50 bg-primary/5"
                    : "hover:border-muted-foreground/20",
              )}
              onClick={(e) => {
                console.log("🔍 Card onClick", {
                  target: e.target,
                  currentTarget: e.currentTarget,
                  isFromMenu: Boolean((e.target as HTMLElement).closest('[data-dropdown-menu="true"]')),
                  schemaId: schema.id
                });
                
                // Si el clic viene del menú, no hacer nada
                if ((e.target as HTMLElement).closest('[data-dropdown-menu="true"]')) {
                  console.log("🛑 Click desde menú, deteniendo propagación");
                  return;
                }
                
                // Cancelar marcado para eliminación si hacemos clic en la card
                if (isMarkedForDeletion) {
                  const updatedSchemasToDelete = new Set(schemasToDelete)
                  updatedSchemasToDelete.delete(schema.id)
                  setSchemasToDelete(updatedSchemasToDelete)
                  return
                }
                
                onSelectOperation(schema.id)
                if (viewMode === "templates") {
                  const hasTemplates = schema.templates_id && schema.templates_id.length > 0
                  if (hasTemplates) {
                    setExpandedOperations((prev) => ({
                      ...prev,
                      [schema.id]: true,
                    }))
                  } else {
                    onSelectTemplate(null)
                  }
                }
              }}
              onMouseEnter={() => {
                setHoveredCardId(schema.id);
              }}
              onMouseLeave={() => {
                // Solo actualizar hoveredCardId si el menú no está abierto
                if (!isMenuOpen) {
                  setHoveredCardId(null);
                }
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1 min-w-0">
                  <Badge variant="outline" className={cn("font-mono text-xs px-2 py-0 mr-2", getMethodColor(schema.method_type))}>
                    {schema.method_type}
                  </Badge>
                  <h3 className="font-medium text-sm truncate">{schema.name}</h3>
                </div>
                
                {showMenu && (
                  <div 
                    data-dropdown-menu="true" 
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                      e.stopPropagation();
                    }}
                  >
                    <DropdownMenu open={isMenuOpen} onOpenChange={(open: boolean) => {
                      if (open) {
                        setOpenMenuId(schema.id);
                      } else {
                        setOpenMenuId(null);
                      }
                    }}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-3 w-4 ml-2 text-muted-foreground hover:bg-muted"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        align="end" 
                        onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                        }}
                        onFocus={(e: React.FocusEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                        }}
                        onPointerDown={(e: React.PointerEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                        }}
                        onMouseDown={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.stopPropagation();
                        }}
                        sideOffset={5}
                        collisionPadding={10}
                      >
                        <DropdownMenuItem 
                          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.stopPropagation();
                            handleToggleFavorite(e, schema.id);
                          }}
                          className="cursor-pointer"
                        >
                          <Star className="h-4 w-4 mr-2" fill={schema.favorite ? "currentColor" : "none"} />
                          {schema.favorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.stopPropagation();
                            handleDuplicateSchema(e, schema.id);
                          }}
                          className="cursor-pointer"
                          disabled={duplicatingId === schema.id}
                        >
                          {duplicatingId === schema.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Copy className="h-4 w-4 mr-2" />
                          )}
                          Duplicar schema
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                            e.stopPropagation();
                            handleDeleteSchema(e, schema.id);
                          }}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar schema
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
                
                {isMarkedForDeletion && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-6 w-6 ml-2"
                          onClick={(e) => handleDeleteSchema(e, schema.id)}
                          disabled={deletionInProgress === schema.id}
                        >
                          {deletionInProgress === schema.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right" align="center" className="bg-destructive text-white">
                        Haz clic otra vez para confirmar eliminación
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              
              {viewMode === "templates" && (
                <div className="flex justify-between items-center mt-1">
                  <p className="text-xs text-muted-foreground">
                    {schema.templates_id?.length || 0} 
                    {!schema.templates_id || schema.templates_id.length === 1 ? " template" : " templates"}
                  </p>
                  {schema.templates_id && schema.templates_id.length > 0 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-muted-foreground/40"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleExpand(schema.id)
                      }}
                    >
                      {expandedOperations[schema.id] ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              )}
            </Card>

            {/* Templates list - Esto necesitará integrarse con el store de templates */}
            {viewMode === "templates" && 
             expandedOperations[schema.id] && 
             schema.templates_id && 
             schema.templates_id.length > 0 && (
              <div className="pl-4 border-l ml-3 space-y-1">
                {/* Aquí necesitaremos obtener los detalles de los templates */}
                {schema.templates_id.map((templateId) => (
                  <Card
                    key={templateId}
                    className={cn(
                      "p-2 cursor-pointer transition-all border hover:shadow-sm",
                      selectedTemplate === templateId && selectedOperation === schema.id
                        ? "border-primary/50 bg-primary/5"
                        : "hover:border-muted-foreground/20",
                    )}
                    onClick={() => {
                      onSelectOperation(schema.id)
                      onSelectTemplate(templateId)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Template {templateId.substring(0, 6)}</span>
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
                          <PlayCircle className="h-4 w-4" />
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
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
