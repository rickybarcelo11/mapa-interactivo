"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Task } from "@/src/types"
import { useEffect, useState } from "react"
import { getTaskHistory } from "@/src/services/provider"

interface TaskHistoryPanelProps {
  task: Task
}

export default function TaskHistoryPanel({ task }: TaskHistoryPanelProps) {
  const [history, setHistory] = useState<{ id: string; date: string; action: string }[]>([])

  useEffect(() => {
    let mounted = true
    getTaskHistory(task.id)
      .then((rows) => {
        if (!mounted) return
        setHistory(rows.map(r => ({ id: r.id, date: r.createdAt, action: r.message })))
      })
      .catch(() => {
        // si falla, mostrar algo básico
        setHistory([
          { id: `${task.id}-h1`, date: task.startDate, action: `Tarea para ${task.sectorName}` },
        ])
      })
    return () => { mounted = false }
  }, [task.id, task.sectorName, task.startDate])

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
