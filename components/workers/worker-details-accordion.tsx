"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Task, SectorStatus } from "@/views/tasks-view" // Ajusta la ruta si es necesario
import { Eye } from "lucide-react"
import { useNotifications } from "@/src/hooks"

interface WorkerDetailsAccordionProps {
  tasks: Task[]
  workerName: string
}

const statusBadgeVariant: Record<SectorStatus, "default" | "destructive" | "outline" | "secondary"> = {
  pendiente: "destructive",
  "en proceso": "default",
  completado: "secondary",
}

export default function WorkerDetailsAccordion({ tasks, workerName }: WorkerDetailsAccordionProps) {
  const { showSimulatedFeature } = useNotifications()
  
  const handleViewTask = (taskId: string) => {
    showSimulatedFeature(
      `Ver/Modificar tarea ID: ${taskId}`
    )
  }

  return (
    <div className="p-4 bg-slate-750">
      <Card className="bg-slate-800 border-slate-600 text-slate-50 shadow-inner">
        <CardHeader>
          <CardTitle className="text-lg text-sky-300">Tareas Asignadas a {workerName}</CardTitle>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-slate-400">Este trabajador no tiene tareas asignadas actualmente.</p>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  key={task.id}
                  className="p-3 bg-slate-650 rounded-md border border-slate-600 flex flex-col sm:flex-row justify-between items-start sm:items-center"
                >
                  <div>
                    <p className="font-semibold text-slate-100">
                      {task.type} en {task.sectorName}
                    </p>
                    <p className="text-xs text-slate-400">
                      Inicio: {task.startDate} {task.endDate ? `- Fin: ${task.endDate}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-2 sm:mt-0">
                    <Badge
                      variant={statusBadgeVariant[task.status]}
                      className={`capitalize 
                      ${task.status === "pendiente" ? "bg-red-600 text-red-50" : ""}
                      ${task.status === "en proceso" ? "bg-yellow-500 text-yellow-950" : ""}
                      ${task.status === "completado" ? "bg-green-600 text-green-50" : ""}`}
                    >
                      {task.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewTask(task.id)}
                      className="text-sky-400 hover:bg-sky-700/30 hover:text-sky-300"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
