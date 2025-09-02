"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { useState, useEffect } from "react"

interface ToolsPanelSheetProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onNewSector: () => void
  onApplyFilters?: (filters: { types: { poda: boolean; cortePasto: boolean }; status: { pendiente: boolean; enProceso: boolean; completado: boolean } }) => void
  initialFilters?: { types: { poda: boolean; cortePasto: boolean }; status: { pendiente: boolean; enProceso: boolean; completado: boolean } }
}

export default function ToolsPanelSheet({ isOpen, onOpenChange, onNewSector, onApplyFilters, initialFilters }: ToolsPanelSheetProps) {
  const [types, setTypes] = useState({ poda: true, cortePasto: true })
  const [status, setStatus] = useState({ pendiente: true, enProceso: true, completado: true })

  useEffect(() => {
    if (!isOpen || !initialFilters) return
    // Sincronizar valores iniciales solo al abrir para evitar bucles por identidad distinta
    setTypes((prev) => {
      const next = initialFilters.types
      return prev.poda === next.poda && prev.cortePasto === next.cortePasto ? prev : next
    })
    setStatus((prev) => {
      const next = initialFilters.status
      return (
        prev.pendiente === next.pendiente &&
        prev.enProceso === next.enProceso &&
        prev.completado === next.completado
      ) ? prev : next
    })
  }, [isOpen])

  const handleApply = () => {
    onApplyFilters?.({ types, status })
  }

  const handleClear = () => {
    const clearedTypes = { poda: true, cortePasto: true }
    const clearedStatus = { pendiente: true, enProceso: true, completado: true }
    setTypes(clearedTypes)
    setStatus(clearedStatus)
    onApplyFilters?.({ types: clearedTypes, status: clearedStatus })
  }

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
                <Switch id="filter-poda" checked={types.poda} onCheckedChange={(v) => setTypes((t) => ({ ...t, poda: v }))} className="data-[state=checked]:bg-sky-500" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-corte-pasto" className="text-slate-200">
                  Corte de Pasto
                </Label>
                <Switch id="filter-corte-pasto" checked={types.cortePasto} onCheckedChange={(v) => setTypes((t) => ({ ...t, cortePasto: v }))} className="data-[state=checked]:bg-sky-500" />
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
                <Switch id="filter-pendiente" checked={status.pendiente} onCheckedChange={(v) => setStatus((s) => ({ ...s, pendiente: v }))} className="data-[state=checked]:bg-red-500" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-en-proceso" className="text-slate-200">
                  En Proceso
                </Label>
                <Switch id="filter-en-proceso" checked={status.enProceso} onCheckedChange={(v) => setStatus((s) => ({ ...s, enProceso: v }))} className="data-[state=checked]:bg-yellow-500" />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="filter-completado" className="text-slate-200">
                  Completado
                </Label>
                <Switch id="filter-completado" checked={status.completado} onCheckedChange={(v) => setStatus((s) => ({ ...s, completado: v }))} className="data-[state=checked]:bg-green-500" />
              </div>
            </div>
          </div>
          <Separator className="bg-slate-700" />
          <div className="space-y-2">
            <Button
              variant="default"
              className="w-full bg-sky-600 hover:bg-sky-500"
              onClick={() => {
                handleApply()
                onOpenChange(false)
              }}
            >
              Aplicar Filtros
            </Button>
            <Button variant="ghost" className="w-full text-slate-400 hover:bg-slate-700" onClick={handleClear}>
              Limpiar Filtros
            </Button>
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
        </div>
        <SheetFooter>{/* Podría ir algo aquí si es necesario */}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
