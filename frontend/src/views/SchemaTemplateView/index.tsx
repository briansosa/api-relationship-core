import { useState, useEffect } from "react"
import { OperationsList } from "./components/operations-list"
import { OperationEditor } from "./components/operation-editor"
import { ResponseViewer } from "./components/response-viewer"
import { TemplateEditor } from "./components/template-editor"
import { TemplateParamsPanel } from "./components/template-params-panel"
import { PlusCircle, Search, X, FileText, FileCode, SortAsc, SortDesc } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useSchemaStore } from "@/stores/schema/store"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SortField, SortOrder } from "@/types/schema"

function SchemaTemplateView() {
  // Acceso al store global
  const { 
    loading, 
    error, 
    fetchSchemas,
    filter,
    setFilter,
    clearFilter,
    sortField,
    sortOrder,
    setSorting,
    getFilteredSchemas,
    selectedSchema
  } = useSchemaStore()
  
  // Estados locales
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"schemas" | "templates">("schemas")
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  
  // Cargar schemas al iniciar la vista y restaurar la selección si existe
  useEffect(() => {
    // Cargar los schemas solo si es necesario
    fetchSchemas()
    
    // Restaurar la selección desde el store
    if (selectedSchema && !selectedOperation) {
      setSelectedOperation(selectedSchema.id)
    }
  }, [fetchSchemas, selectedSchema, selectedOperation])
  
  // Actualizar filtro cuando cambie la búsqueda
  useEffect(() => {
    setFilter({ searchQuery })
  }, [searchQuery, setFilter])
  
  // Obtener schemas filtrados
  const filteredSchemas = getFilteredSchemas()
  
  // Manejar cambio de ordenamiento
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Si es el mismo campo, cambiar el orden
      setSorting(field, sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      // Si es un campo diferente, establecer orden ascendente
      setSorting(field, 'asc')
    }
  }
  
  // Manejar filtros de favoritos
  const handleFilterFavorites = () => {
    if (filter.favorite) {
      // Si ya está filtrando por favoritos, limpiar el filtro
      setFilter({ favorite: undefined })
    } else {
      // Establecer filtro de favoritos
      setFilter({ favorite: true })
    }
  }
  
  // Limpiar todos los filtros
  const handleClearFilters = () => {
    clearFilter()
    setSearchQuery('')
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center justify-between bg-card">
        <h1 className="text-xl font-bold">Operaciones API</h1>
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar operaciones..."
              className="pl-8 h-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "schemas" ? "default" : "ghost"}
              size="sm"
              className="rounded-none px-3 h-9"
              onClick={() => {
                setViewMode("schemas")
                setSelectedTemplate(null)
              }}
            >
              <FileText className="mr-2 h-4 w-4" />
              Schemas
            </Button>
            <Button
              variant={viewMode === "templates" ? "default" : "ghost"}
              size="sm"
              className="rounded-none px-3 h-9"
              onClick={() => setViewMode("templates")}
            >
              <FileCode className="mr-2 h-4 w-4" />
              Templates
            </Button>
          </div>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            {viewMode === "schemas" ? "Nuevo Schema" : "Nuevo Template"}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Operations list */}
        <div className="w-72 border-r flex flex-col">
          <div className="border-b p-2 flex items-center justify-between">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="all" onClick={handleClearFilters}>Todas</TabsTrigger>
                <TabsTrigger 
                  value="favorites" 
                  onClick={handleFilterFavorites}
                  data-state={filter.favorite ? "active" : "inactive"}
                >
                  Favoritas
                </TabsTrigger>
                <TabsTrigger value="recent" onClick={() => {
                  setSorting('lastUsed', 'desc')
                }}>
                  Recientes
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort('name')}>
                  Ordenar por nombre {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('method_type')}>
                  Ordenar por método {sortField === 'method_type' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort('lastUsed')}>
                  Ordenar por último uso {sortField === 'lastUsed' && (sortOrder === 'asc' ? '↑' : '↓')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <ScrollArea className="flex-1">
            <OperationsList
              selectedOperation={selectedOperation}
              onSelectOperation={setSelectedOperation}
              searchQuery={searchQuery}
              viewMode={viewMode}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
              loading={loading}
              schemas={filteredSchemas}
            />
          </ScrollArea>
        </div>

        {/* Middle panel - Operation/Template editor */}
        {viewMode === "schemas" && selectedOperation ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <OperationEditor operationId={selectedOperation} />
          </div>
        ) : viewMode === "templates" && selectedOperation ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <TemplateEditor operationId={selectedOperation} templateId={selectedTemplate} />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4 max-w-md p-8">
              <h2 className="text-2xl font-bold">
                {viewMode === "schemas" ? "Selecciona un Schema" : "Selecciona un Template"}
              </h2>
              <p className="text-muted-foreground">
                {viewMode === "schemas"
                  ? "Elige un schema existente o crea uno nuevo para comenzar a trabajar."
                  : "Elige un template existente o crea uno nuevo basado en un schema."}
              </p>
              <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                {viewMode === "schemas" ? "Crear nuevo Schema" : "Crear nuevo Template"}
              </Button>
            </div>
          </div>
        )}

        {/* Right panel - Response viewer or Template params */}
        {selectedOperation && (
          <>
            {viewMode === "schemas" ? (
              <div className="w-1/3 border-l flex flex-col">
                <ResponseViewer operationId={selectedOperation} />
              </div>
            ) : (
              selectedOperation && (
                <div className="w-1/3 border-l flex flex-col">
                  <TemplateParamsPanel operationId={selectedOperation} templateId={selectedTemplate} />
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default SchemaTemplateView;