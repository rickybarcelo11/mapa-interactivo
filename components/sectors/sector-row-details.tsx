"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { SectorPolygon } from "@/components/home/map-interactive-placeholder"
import { Edit, History, MapPin, Trash2 } from "lucide-react"
import { useNotifications } from "@/src/hooks"

interface SectorRowDetailsProps {
  sector: SectorPolygon
  onEdit?: (sector: SectorPolygon) => void
  onDelete?: (sectorId: string) => void
  onViewHistory?: (sector: SectorPolygon) => void
}

export default function SectorRowDetails({ sector, onEdit, onDelete, onViewHistory }: SectorRowDetailsProps) {
  const { showSimulatedFeature } = useNotifications()
  
  const handleEditData = () => {
    if (onEdit) onEdit(sector)
    else showSimulatedFeature(`Editar datos del sector: ${sector.name}`)
  }

  const handleViewHistory = () => {
    if (onViewHistory) onViewHistory(sector)
    else showSimulatedFeature(`Ver historial/tareas del sector: ${sector.name}`)
  }

  const handleDelete = () => {
    if (onDelete) onDelete(sector.id)
    else showSimulatedFeature(`Eliminar sector: ${sector.name}`)
  }

  return (
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
            <div className="bg-slate-700 h-40 rounded-md flex items-center justify-center">
              <MapPin className="w-12 h-12 text-slate-500" />
              <p className="ml-2 text-slate-500">Mapa centrado en {sector.name}</p>
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
  )
}
