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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Task, Worker } from "@/views/tasks-view"
import type { SectorStatus } from "@/src/types"
import { SECTOR_STATUSES } from "@/src/utils/status"
import { useNotifications } from "@/src/hooks"
import { validateTaskForm, validateTask } from "@/src/validations/task-schemas"

interface EditTaskModalProps {
  task: Task
  workers: Worker[]
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (task: Task) => void
}

export default function EditTaskModal({ task, workers, isOpen, onOpenChange, onSave }: EditTaskModalProps) {
  const [formData, setFormData] = useState<Task>(task)
  const { showValidationError } = useNotifications()

  useEffect(() => {
    setFormData(task)
  }, [task])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: keyof Task, value: string) => {
    if (name === "assignedWorkerId") {
      const worker = workers.find((w) => w.id === value)
      setFormData({ ...formData, assignedWorkerId: value, assignedWorkerName: worker?.name || "" })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validar campos mínimos del formulario
    const subset = {
      sectorId: formData.sectorId,
      type: formData.type,
      status: formData.status,
      startDate: formData.startDate,
      endDate: formData.endDate || undefined,
      assignedWorkerId: formData.assignedWorkerId,
      observations: formData.observations || undefined,
    }
    const validatedSubset = validateTaskForm(subset)
    if (!validatedSubset) {
      showValidationError("Revisa los campos de la tarea")
      return
    }
    // Validar la entidad completa resultante
    try {
      const validatedFull = validateTask({ ...formData, ...validatedSubset })
      onSave(validatedFull as Task)
    } catch (err) {
      showValidationError("Datos de tarea inválidos")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sky-400">Editar Tarea</DialogTitle>
          <DialogDescription className="text-slate-400">
            Modifica los detalles de la tarea para el sector "{task.sectorName}".
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 grid gap-4">
            <div>
              <Label htmlFor="assignedWorkerId" className="text-slate-300">
                Trabajador Asignado
              </Label>
              <Select
                value={formData.assignedWorkerId}
                onValueChange={(value) => handleSelectChange("assignedWorkerId", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                  {workers.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status" className="text-slate-300">
                Estado
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange("status", value as SectorStatus)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                  {SECTOR_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="observations" className="text-slate-300">
                Observaciones
              </Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600 text-slate-50"
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
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
