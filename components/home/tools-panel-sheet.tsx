"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface ToolsPanelSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onNewSector: () => void
}

export default function ToolsPanelSheet({ isOpen, onOpenChange, onNewSector }: ToolsPanelSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="bg-slate-800 text-slate-50 border-slate-700 w-full sm:max-w-sm">
        <SheetHeader>
          <SheetTitle className="text-sky-400">Panel de Herramientas</SheetTitle>
          <SheetDescription className="text-slate-400">Filtra sectores o crea uno nuevo.</SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Filtrar por Tipo de Sector</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-poda" className="text-slate-200">
                  Poda
                </Label>
                <Switch id="filter-poda" className="data-[state=checked]:bg-sky-500" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-corte-pasto" className="text-slate-200">
                  Corte de Pasto
                </Label>
                <Switch id="filter-corte-pasto" className="data-[state=checked]:bg-sky-500" />
              </div>
            </div>
          </div>
          <Separator className="bg-slate-700" />
          <div>
            <h4 className="text-sm font-medium text-slate-300 mb-2">Filtrar por Estado</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-pendiente" className="text-slate-200">
                  Pendiente
                </Label>
                <Switch id="filter-pendiente" className="data-[state=checked]:bg-red-500" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-en-proceso" className="text-slate-200">
                  En Proceso
                </Label>
                <Switch id="filter-en-proceso" className="data-[state=checked]:bg-yellow-500" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-completado" className="text-slate-200">
                  Completado
                </Label>
                <Switch id="filter-completado" className="data-[state=checked]:bg-green-500" />
              </div>
            </div>
          </div>
          <Separator className="bg-slate-700" />
          <Button
            variant="outline"
            className="w-full border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
            onClick={() => {
              onOpenChange(false) // Cierra el panel de herramientas
              onNewSector() // Abre el formulario de nuevo sector
            }}
          >
            Nuevo Sector
          </Button>
          <Button variant="ghost" className="w-full text-slate-400 hover:bg-slate-700">
            Limpiar Filtros
          </Button>
        </div>
        <SheetFooter>{/* Podría ir algo aquí si es necesario */}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
