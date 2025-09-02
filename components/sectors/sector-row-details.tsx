"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { SectorPolygon } from "@/src/types"
import { Edit, History, MapPin, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button as UIButton } from "@/components/ui/button"
import SectorMiniMap from "./sector-mini-map"
import dynamic from "next/dynamic"
const SectorLeafletThumbnail = dynamic(() => import("./sector-leaflet-thumbnail"), { ssr: false })
import { useNotifications } from "@/src/hooks"

interface SectorRowDetailsProps {
  sector: SectorPolygon
  onEdit?: (sector: SectorPolygon) => void
  onDelete?: (sectorId: string) => void
  onViewHistory?: (sector: SectorPolygon) => void
}

export default function SectorRowDetails({ sector, onEdit, onDelete, onViewHistory }: SectorRowDetailsProps) {
  const { showSimulatedFeature } = useNotifications()
  const [confirmOpen, setConfirmOpen] = React.useState(false)
  
  const handleEditData = () => {
    if (onEdit) onEdit(sector)
    else showSimulatedFeature(`Editar datos del sector: ${sector.name}`)
  }

  const handleViewHistory = () => {
    if (onViewHistory) onViewHistory(sector)
    else showSimulatedFeature(`Ver historial/tareas del sector: ${sector.name}`)
  }

  const handleDelete = () => setConfirmOpen(true)

  return (<>
    <Card className="bg-slate-800 border-slate-700 text-slate-50 shadow-inner">
      <CardHeader>
        <CardTitle className="text-xl text-sky-400">Detalles de: {sector.name}</CardTitle>
        <CardDescription className="text-slate-400">Información completa y acciones para este sector.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-slate-300">Información General</h4>
            <p className="text-sm">
              <strong className="text-slate-400">Tipo:</strong> {sector.type}
            </p>
            <p className="text-sm">
              <strong className="text-slate-400">Estado:</strong> <span className="capitalize">{sector.status}</span>
            </p>
            <p className="text-sm">
              <strong className="text-slate-400">Dirección:</strong> {sector.direccion || "No especificada"}
            </p>
            {sector.observaciones && (
              <p className="text-sm mt-2">
                <strong className="text-slate-400">Observaciones:</strong> {sector.observaciones}
              </p>
            )}
          </div>
          <div>
            <h4 className="font-semibold text-slate-300 mb-2">Miniatura del Mapa</h4>
            {/* Contenedor cuadrado: usa aspect-square para 1:1 */}
            <div className="hidden sm:block aspect-square w-2/3 mx-auto">
              <SectorLeafletThumbnail path={sector.path} className="bg-slate-700 h-full w-full" />
            </div>
            {/* Fallback SVG en móviles, también cuadrado */}
            <div className="sm:hidden aspect-square w-2/3 mx-auto">
              <SectorMiniMap path={sector.path} height={undefined} className="bg-slate-700 h-full w-full" />
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-700">
          <Button
            variant="outline"
            onClick={handleEditData}
            className="border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white w-full sm:w-auto"
          >
            <Edit className="mr-2 h-4 w-4" /> Editar Datos
          </Button>
          <Button
            variant="outline"
            onClick={handleViewHistory}
            className="border-slate-600 text-slate-300 hover:bg-slate-700 w-full sm:w-auto"
          >
            <History className="mr-2 h-4 w-4" /> Ver Historial/Tareas
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="w-full sm:w-auto"
          >
            <Trash2 className="mr-2 h-4 w-4" /> Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
    <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-sky-400">Eliminar sector</DialogTitle>
          <DialogDescription className="text-slate-400">
            Se eliminarán el sector "{sector.name}" y todas sus tareas asociadas. Esta acción no se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <UIButton variant="outline" onClick={() => setConfirmOpen(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</UIButton>
          <UIButton
            variant="destructive"
            onClick={() => { setConfirmOpen(false); onDelete?.(sector.id) }}
          >Eliminar</UIButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>)
}
