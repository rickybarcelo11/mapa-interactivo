"use client"

import React from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { SectorPolygon } from "./map-interactive-placeholder" // Asegúrate que la ruta es correcta
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Edit3, MapPin } from "lucide-react"

interface SectorDetailsDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  sector: SectorPolygon
}

export default function SectorDetailsDialog({ isOpen, onOpenChange, sector }: SectorDetailsDialogProps) {
  // Simulación de edición
  const [isEditing, setIsEditing] = React.useState(false)
  const [formData, setFormData] = React.useState(sector)

  React.useEffect(() => {
    setFormData(sector) // Actualizar datos si el sector cambia
    setIsEditing(false) // Resetear modo edición
  }, [sector])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSaveChanges = () => {
    console.log("Guardando cambios:", formData)
    // Aquí llamarías a tu API para guardar los cambios
    setIsEditing(false)
    // Podrías actualizar el estado global de sectores aquí
    alert("Cambios guardados (simulado).")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-sky-400">{isEditing ? "Modificar Sector" : "Detalles del Sector"}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditing ? "Edita la información del sector." : `Información sobre ${sector.name}.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div>
            <Label htmlFor="sector-name" className="text-slate-300">
              Nombre
            </Label>
            <Input
              id="sector-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              readOnly={!isEditing}
              className="bg-slate-700 border-slate-600 text-slate-50 read-only:opacity-70"
            />
          </div>
          <div>
            <Label htmlFor="sector-type" className="text-slate-300">
              Tipo
            </Label>
            <Input
              id="sector-type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              readOnly={!isEditing}
              className="bg-slate-700 border-slate-600 text-slate-50 read-only:opacity-70"
            />
          </div>
          <div>
            <Label htmlFor="sector-direccion" className="text-slate-300">
              Dirección
            </Label>
            <Input
              id="sector-direccion"
              name="direccion"
              value={formData.direccion || ""}
              onChange={handleChange}
              readOnly={!isEditing}
              className="bg-slate-700 border-slate-600 text-slate-50 read-only:opacity-70"
            />
          </div>
          <div>
            <Label htmlFor="sector-observaciones" className="text-slate-300">
              Observaciones
            </Label>
            <Textarea
              id="sector-observaciones"
              name="observaciones"
              value={formData.observaciones || ""}
              onChange={handleChange}
              readOnly={!isEditing}
              className="bg-slate-700 border-slate-600 text-slate-50 read-only:opacity-70"
            />
          </div>
          <div className="text-xs text-slate-400">
            Estado actual: <span className="font-semibold capitalize">{sector.status}</span>
          </div>
        </div>
        <DialogFooter className="sm:justify-between">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancelar
              </Button>
              <Button onClick={handleSaveChanges} className="bg-sky-500 hover:bg-sky-600">
                Guardar Cambios
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
              >
                <MapPin size={16} /> Editar Forma Polígono
                <span className="text-xs text-slate-500">(Simulado)</span>
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-sky-500 hover:bg-sky-600 flex items-center gap-2"
              >
                <Edit3 size={16} /> Modificar Datos
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
