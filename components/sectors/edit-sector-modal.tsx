"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import type { SectorPolygon } from "@/src/types"
import { useNotifications } from "@/src/hooks"
import { validateSectorForm } from "@/src/validations/sector-schemas"

interface EditSectorModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  sector: SectorPolygon | null
  onSave: (updated: SectorPolygon) => void
}

export default function EditSectorModal({ isOpen, onOpenChange, sector, onSave }: EditSectorModalProps) {
  const [formData, setFormData] = useState({ name: "", type: "Poda", status: "pendiente", direccion: "", observaciones: "" })
  const { showValidationError } = useNotifications()

  useEffect(() => {
    if (sector) {
      setFormData({
        name: sector.name,
        type: sector.type,
        status: sector.status,
        direccion: sector.direccion || "",
        observaciones: sector.observaciones || "",
      })
    }
  }, [sector, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const validated = validateSectorForm(formData)
      if (!sector) return
      onSave({ ...sector, ...validated })
      onOpenChange(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Datos inválidos'
      showValidationError(message)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sky-400">Editar Sector</DialogTitle>
          <DialogDescription className="text-slate-400">Modifica los datos del sector.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="name" className="text-slate-300">Nombre</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} className="bg-slate-700 border-slate-600 text-slate-50" />
            </div>
            <div>
              <Label htmlFor="type" className="text-slate-300">Tipo</Label>
              <Input id="type" name="type" value={formData.type} onChange={handleChange} className="bg-slate-700 border-slate-600 text-slate-50" />
            </div>
            <div>
              <Label htmlFor="status" className="text-slate-300">Estado</Label>
              <Input id="status" name="status" value={formData.status} onChange={handleChange} className="bg-slate-700 border-slate-600 text-slate-50" />
            </div>
            <div>
              <Label htmlFor="direccion" className="text-slate-300">Dirección</Label>
              <Input id="direccion" name="direccion" value={formData.direccion} onChange={handleChange} className="bg-slate-700 border-slate-600 text-slate-50" />
            </div>
            <div>
              <Label htmlFor="observaciones" className="text-slate-300">Observaciones</Label>
              <Textarea id="observaciones" name="observaciones" value={formData.observaciones} onChange={handleChange} className="bg-slate-700 border-slate-600 text-slate-50" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">Cancelar</Button>
            <Button type="submit" className="bg-sky-500 hover:bg-sky-600">Guardar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
