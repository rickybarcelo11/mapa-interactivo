"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import type { Worker } from "@/views/workers-view" // Ajusta la ruta si es necesario
import { useNotifications, useWorkerValidation } from "@/src/hooks"

interface AddEditWorkerModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (worker: Worker) => void
  worker: Worker | null // Si es null, es para agregar. Si tiene valor, es para editar.
}

const initialFormData: Omit<Worker, "id"> = {
  name: "",
  observaciones: "",
}

export default function AddEditWorkerModal({ isOpen, onOpenChange, onSave, worker }: AddEditWorkerModalProps) {
  const [formData, setFormData] = useState<Omit<Worker, "id">>(initialFormData)
  const { showRequiredFieldsError } = useNotifications()
  const { validateWorkerForm } = useWorkerValidation()

  useEffect(() => {
    if (worker) {
      setFormData({ name: worker.name, observaciones: worker.observaciones || "" })
    } else {
      setFormData(initialFormData)
    }
  }, [worker, isOpen]) // Resetear el form cuando se abre/cierra o cambia el worker

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validación con Zod
    const validated = validateWorkerForm(formData)
    if (!validated) {
      // Para compatibilidad, si falla, mostramos el requerido básico
      if (!formData.name.trim()) showRequiredFieldsError()
      return
    }
    onSave({
      id: worker?.id || "", // El ID se manejará en la lógica de guardado de WorkersView
      ...validated,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sky-400">
            {worker ? "Editar Trabajador" : "Agregar Nuevo Trabajador"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            {worker ? "Modifica los datos del trabajador." : "Completa los datos del nuevo trabajador."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 grid gap-4">
            <div>
              <Label htmlFor="worker-name" className="text-slate-300">
                Nombre Completo
              </Label>
              <Input
                id="worker-name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600 text-slate-50"
              />
            </div>
            <div>
              <Label htmlFor="worker-observaciones" className="text-slate-300">
                Observaciones Generales
              </Label>
              <Textarea
                id="worker-observaciones"
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-slate-50"
                rows={3}
              />
            </div>
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
              {worker ? "Guardar Cambios" : "Agregar Trabajador"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
