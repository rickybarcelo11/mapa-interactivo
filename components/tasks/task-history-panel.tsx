"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Task } from "@/src/types"
import { useEffect, useMemo, useState } from "react"
import { getTaskHistory } from "@/src/services/provider"

interface TaskHistoryPanelProps {
  task: Task
}

type RawHistory = { id: string; eventType: string; message: string; createdAt: string }

interface CycleItem {
  id: string
  startAt: string
  endAt?: string
  worker?: string
  observations?: string
}

export default function TaskHistoryPanel({ task }: TaskHistoryPanelProps) {
  const [history, setHistory] = useState<RawHistory[]>([])

  useEffect(() => {
    let mounted = true
    getTaskHistory(task.id)
      .then((rows) => {
        if (!mounted) return
        setHistory(rows)
      })
      .catch(() => {
        setHistory([
          { id: `${task.id}-start`, eventType: 'start', message: `Inicio: ${task.assignedWorkerName} - ${task.observations || ''}`.trim(), createdAt: task.startDate },
          ...(task.endDate ? [{ id: `${task.id}-end`, eventType: 'end', message: `Fin`, createdAt: task.endDate }] : []),
        ])
      })
    return () => { mounted = false }
  }, [task.id, task.sectorName, task.startDate, task.endDate, task.assignedWorkerName, task.observations])

  const cycles = useMemo<CycleItem[]>(() => {
    if (!history || history.length === 0) return []
    const result: CycleItem[] = []
    let current: CycleItem | null = null
    const sorted = [...history].sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    for (const h of sorted) {
      const type = (h.eventType || '').toLowerCase()
      if (type.includes('start') || type.includes('inicio')) {
        if (current) result.push(current)
        current = { id: h.id, startAt: h.createdAt }
        const m = h.message || ''
        const workerMatch = m.match(/empleado[:\s-]+([^|]+)|trabajador[:\s-]+([^|]+)/i)
        const worker = workerMatch ? (workerMatch[1] || workerMatch[2])?.trim() : undefined
        current.worker = worker
        const obsMatch = m.match(/observaciones?[:\s-]+(.+)/i)
        const observations = obsMatch ? obsMatch[1].trim() : undefined
        current.observations = observations
      } else if (type.includes('end') || type.includes('fin') || type.includes('stop')) {
        if (!current) current = { id: h.id, startAt: h.createdAt }
        current.endAt = h.createdAt
        result.push(current)
        current = null
      } else {
        if (!current) current = { id: h.id, startAt: h.createdAt }
        const m = h.message || ''
        const workerMatch = m.match(/empleado[:\s-]+([^|]+)|trabajador[:\s-]+([^|]+)/i)
        const worker = workerMatch ? (workerMatch[1] || workerMatch[2])?.trim() : undefined
        if (worker) current.worker = worker
        const obsMatch = m.match(/observaciones?[:\s-]+(.+)/i)
        const observations = obsMatch ? obsMatch[1].trim() : undefined
        if (observations) current.observations = observations
      }
    }
    if (current) result.push(current)
    return result
  }, [history])

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-50">
      <CardHeader>
        <CardTitle className="text-sky-400">Historial</CardTitle>
        <CardDescription className="text-slate-400">Eventos registrados para esta tarea.</CardDescription>
      </CardHeader>
      <CardContent>
        {cycles.length === 0 ? (
          <p className="text-slate-400">Sin historial disponible.</p>
        ) : (
          <div className="space-y-3">
            {cycles.map((c) => (
              <div key={c.id} className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
                <div className="flex flex-wrap gap-4 text-xs text-slate-300">
                  <div>
                    <span className="text-slate-400">Inicio:</span> {c.startAt}
                  </div>
                  {c.endAt && (
                    <div>
                      <span className="text-slate-400">Fin:</span> {c.endAt}
                    </div>
                  )}
                </div>
                {(c.worker || c.observations) && (
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {c.worker && (
                      <div>
                        <span className="text-slate-400">Empleado:</span> {c.worker}
                      </div>
                    )}
                    {c.observations && (
                      <div>
                        <span className="text-slate-400">Observaciones:</span> {c.observations}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
