import type { ReactNode } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PlusCircle, Download } from "lucide-react"

interface SidebarProps {
  children: ReactNode
}

export function Sidebar({ children }: SidebarProps) {
  return (
    <div className="w-64 border-r bg-card flex flex-col h-full">
      <div className="p-3 border-b flex items-center justify-between">
        <h1 className="text-lg font-bold">Operaciones</h1>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" title="Nueva operación">
            <PlusCircle className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" title="Importar desde cURL">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-2 border-b">
        <Input placeholder="Buscar..." className="h-8" />
      </div>
      <ScrollArea className="flex-1">{children}</ScrollArea>
    </div>
  )
}
