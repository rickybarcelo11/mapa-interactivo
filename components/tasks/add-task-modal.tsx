"use client"

import { useEffect, useMemo, useState } from "react"
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
import type { Worker, Task } from "@/src/types"
import { useNotifications } from "@/src/hooks"

type NewTaskPayload = Omit<Task, 'id' | 'endDate'> & { endDate?: string | null }

interface AddTaskModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  sectors: { id: string; name: string }[]
  workers: Worker[]
  presetSectorId?: string | null
  onSave: (task: NewTaskPayload) => void
}

export default function AddTaskModal({ isOpen, onOpenChange, sectors, workers, presetSectorId, onSave }: AddTaskModalProps) {
  const { showValidationError } = useNotifications()

  const today = useMemo(() => new Date().toISOString().slice(0,10), [])
  const defaultSectorId = presetSectorId || (sectors[0]?.id ?? "")
  const [sectorId, setSectorId] = useState<string>(defaultSectorId)
  const [type, setType] = useState<string>("Poda")
  const [status, setStatus] = useState<"pendiente" | "en proceso">("pendiente")
  const defaultWorkerId = useMemo(() => (workers.find(w => w.name === 'Sin asignar')?.id ?? workers[0]?.id ?? ''), [workers])
  const [assignedWorkerId, setAssignedWorkerId] = useState<string>(defaultWorkerId)
  const [startDate, setStartDate] = useState<string>(today)
  const [observations, setObservations] = useState<string>("")

  useEffect(() => {
    if (isOpen) {
      setSectorId(presetSectorId || (sectors[0]?.id ?? ""))
      setAssignedWorkerId(defaultWorkerId)
      setType("Poda")
      setStatus("pendiente")
      setStartDate(today)
      setObservations("")
    }
  }, [isOpen, presetSectorId, sectors, workers, today])

  const handleSave = () => {
    if (!sectorId || !assignedWorkerId || !type || !startDate) {
      showValidationError("Completa los campos obligatorios")
      return
    }
    const sector = sectors.find(s => s.id === sectorId)
    const worker = workers.find(w => w.id === assignedWorkerId)
    if (!sector || !worker) {
      showValidationError("Sector o trabajador inválido")
      return
    }
    const payload: NewTaskPayload = {
      sectorId,
      sectorName: sector.name,
      type,
      status,
      startDate,
      endDate: null,
      assignedWorkerId,
      assignedWorkerName: worker.name,
      observations,
    }
    onSave(payload)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sky-400">Nueva Tarea</DialogTitle>
          <DialogDescription className="text-slate-400">Crea una nueva tarea para un sector.</DialogDescription>
        </DialogHeader>
        <div className="py-4 grid gap-4">
          <div>
            <Label className="text-slate-300">Sector</Label>
            <Select value={sectorId} onValueChange={setSectorId}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                {sectors.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                <SelectItem value="Poda">Poda</SelectItem>
                <SelectItem value="Corte de pasto">Corte de pasto</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Estado inicial</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "pendiente" | "en proceso") }>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en proceso">Iniciar ahora</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Trabajador Asignado</Label>
            <Select value={assignedWorkerId} onValueChange={setAssignedWorkerId}>
              <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                {workers.map((w) => (
                  <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-slate-300">Fecha de inicio</Label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-2 w-full rounded-md bg-slate-700 border border-slate-600 px-3 py-2 text-sm text-slate-50"
            />
          </div>
          <div>
            <Label className="text-slate-300">Observaciones</Label>
            <Textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
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
          <Button onClick={handleSave} className="bg-sky-500 hover:bg-sky-600">
            Crear Tarea
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


