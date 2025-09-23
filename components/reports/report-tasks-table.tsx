"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Task } from "@/src/types"

interface ReportTasksTableProps {
  tasks: Task[]
}

export default function ReportTasksTable({ tasks }: ReportTasksTableProps) {
  const [visibleCount, setVisibleCount] = useState(15) // Para simular scroll infinito

  const loadMore = () => {
    setVisibleCount((prevCount) => prevCount + 15)
  }

  if (tasks.length === 0) {
    return <p className="p-4 text-center text-slate-400">No hay tareas para mostrar en este informe.</p>
  }

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
      <h3 className="text-lg font-semibold text-slate-200 p-4 border-b border-slate-700">
        Detalle de Tareas Incluidas en el Informe
      </h3>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-750">
            <TableRow className="hover:bg-slate-700 border-slate-700">
              <TableHead className="text-slate-300">Sector</TableHead>
              <TableHead className="text-slate-300">Tipo</TableHead>
              <TableHead className="text-slate-300">Estado</TableHead>
              <TableHead className="text-slate-300">Trabajador</TableHead>
              <TableHead className="text-slate-300">Fecha Inicio</TableHead>
              <TableHead className="text-slate-300">Fecha Fin</TableHead>
              <TableHead className="text-slate-300">Observaciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.slice(0, visibleCount).map((task) => (
              <TableRow key={task.id} className="border-b border-slate-700">
                <TableCell className="font-medium text-sky-400 py-3 px-4">{task.sectorName}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{task.type}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4 capitalize">{task.status}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{task.assignedWorkerName}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{task.startDate}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{task.endDate || "N/A"}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4 truncate max-w-xs">{task.observations}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {visibleCount < tasks.length && (
        <div className="p-4 text-center">
          <Button
            onClick={loadMore}
            variant="outline"
            className="border-sky-500 text-sky-500 hover:bg-sky-500 hover:text-white"
          >
            Cargar más tareas ({tasks.length - visibleCount} restantes)
          </Button>
        </div>
      )}
    </div>
  )
}
