"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SectorStatus, SectorType } from "@/src/types"
import { useSectorValidation } from "@/src/hooks"

interface NewSectorFormDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSubmit: (data: {
    name: string
    type: SectorType
    status: SectorStatus
    direccion?: string
    observaciones?: string
  }) => void
}

const initialFormData = {
  name: "",
  type: "Poda" as SectorType,
  status: "pendiente" as SectorStatus,
  direccion: "",
  observaciones: "",
}

export default function NewSectorFormDialog({ isOpen, onOpenChange, onSubmit }: NewSectorFormDialogProps) {
  const [formData, setFormData] = useState(initialFormData)
  const { validateSectorForm } = useSectorValidation()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validated = validateSectorForm(formData)
    if (!validated) return
    onSubmit(validated)
    setFormData(initialFormData) // Reset form
    // onOpenChange(false); // Dialog se cierra desde el padre
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) setFormData(initialFormData)
      }}
    >
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sky-400">Nuevo Sector</DialogTitle>
          <DialogDescription className="text-slate-400">
            Completa los datos del nuevo sector. El polígono se definirá en el mapa.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 grid gap-4">
            <div>
              <Label htmlFor="new-sector-name" className="text-slate-300">
                Nombre del Sector
              </Label>
              <Input
                id="new-sector-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-sector-type" className="text-slate-300">
                  Tipo de Tarea
                </Label>
                <Select name="type" value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                    <SelectItem value="Poda" className="hover:bg-slate-600">
                      Poda
                    </SelectItem>
                    <SelectItem value="Corte de pasto" className="hover:bg-slate-600">
                      Corte de pasto
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="new-sector-status" className="text-slate-300">
                  Estado Inicial
                </Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                    <SelectItem value="pendiente" className="hover:bg-slate-600">
                      Pendiente
                    </SelectItem>
                    <SelectItem value="en proceso" className="hover:bg-slate-600">
                      En Proceso
                    </SelectItem>
                    <SelectItem value="completado" className="hover:bg-slate-600">
                      Completado
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="new-sector-direccion" className="text-slate-300">
                Dirección (opcional)
              </Label>
              <Input
                id="new-sector-direccion"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
            <div>
              <Label htmlFor="new-sector-observaciones" className="text-slate-300">
                Observaciones (opcional)
              </Label>
              <Textarea
                id="new-sector-observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
            <p className="text-xs text-slate-400">
              Nota: Después de guardar, se activará el modo de dibujo en el mapa para definir el polígono del sector
              (simulación).
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-sky-500 hover:bg-sky-600">
              Guardar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
