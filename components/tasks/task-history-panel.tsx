"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Task } from "@/src/types"

interface TaskHistoryPanelProps {
  task: Task
}

export default function TaskHistoryPanel({ task }: TaskHistoryPanelProps) {
  // Historial simulado por ahora
  const history = [
    { id: `${task.id}-h1`, date: task.startDate, action: `Tarea creada para ${task.sectorName}` },
    task.assignedWorkerName ? { id: `${task.id}-h2`, date: task.startDate, action: `Asignada a ${task.assignedWorkerName}` } : null,
    task.endDate ? { id: `${task.id}-h3`, date: task.endDate, action: `Marcada como ${task.status}` } : null,
  ].filter(Boolean) as { id: string; date: string; action: string }[]

  return (
    <Card className="bg-slate-800 border-slate-700 text-slate-50">
      <CardHeader>
        <CardTitle className="text-sky-400">Historial</CardTitle>
        <CardDescription className="text-slate-400">Eventos registrados para esta tarea.</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-slate-400">Sin historial disponible.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="text-sm">
                <span className="text-slate-400">{h.date}:</span> {h.action}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
