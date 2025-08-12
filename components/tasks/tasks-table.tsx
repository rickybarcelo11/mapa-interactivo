"use client"

import type React from "react"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, CheckCircle, Clock, AlertTriangle, History } from "lucide-react"
import type { Task } from "@/views/tasks-view"
import type { SectorStatus } from "@/components/home/map-interactive-placeholder"
import ConfirmDeleteDialog from "./confirm-delete-dialog"
import { useNotifications } from "@/src/hooks"

interface TasksTableProps {
  tasks: Task[]
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onFinish: (taskId: string) => void
}

const statusIcons: Record<SectorStatus, React.ReactElement> = {
  pendiente: <AlertTriangle className="h-5 w-5 text-red-500" />,
  "en proceso": <Clock className="h-5 w-5 text-yellow-500" />,
  completado: <CheckCircle className="h-5 w-5 text-green-500" />,
}

export default function TasksTable({ tasks, onEdit, onDelete, onFinish }: TasksTableProps) {
  const [deletingTask, setDeletingTask] = useState<Task | null>(null)
  const [visibleCount, setVisibleCount] = useState(10) // Para simular scroll infinito
  const { showSimulatedFeature } = useNotifications()

  const loadMore = () => {
    setVisibleCount((prevCount) => prevCount + 10)
  }

  if (tasks.length === 0) {
    return <p className="p-4 text-center text-slate-400">No se encontraron tareas.</p>
  }

  return (
    <>
      <div className="overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader className="bg-slate-750">
            <TableRow className="hover:bg-slate-700 border-slate-700">
              <TableHead className="w-[50px] text-slate-300">Estado</TableHead>
              <TableHead className="text-slate-300">Sector</TableHead>
              <TableHead className="text-slate-300">Tipo</TableHead>
              <TableHead className="text-slate-300">Trabajador Asignado</TableHead>
              <TableHead className="text-slate-300">Fecha Inicio</TableHead>
              <TableHead className="text-slate-300">Fecha Fin</TableHead>
              <TableHead className="text-slate-300">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.slice(0, visibleCount).map((task) => (
              <TableRow key={task.id} className="border-b border-slate-700">
                <TableCell className="py-3 px-4">{statusIcons[task.status]}</TableCell>
                <TableCell className="font-medium text-sky-400 py-3 px-4">{task.sectorName}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{task.type}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{task.assignedWorkerName}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{task.startDate}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{task.endDate || "N/A"}</TableCell>
                <TableCell className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 text-slate-50 border-slate-700">
                      <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer hover:!bg-slate-700">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => showSimulatedFeature(`Historial de ${task.sectorName}`)}
                        className="cursor-pointer hover:!bg-slate-700"
                      >
                        <History className="mr-2 h-4 w-4" /> Ver Historial
                      </DropdownMenuItem>
                      {task.status !== "completado" && (
                        <DropdownMenuItem
                          onClick={() => onFinish(task.id)}
                          className="cursor-pointer hover:!bg-slate-700"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Finalizar Tarea
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator className="bg-slate-700" />
                      <DropdownMenuItem
                        onClick={() => setDeletingTask(task)}
                        className="cursor-pointer !text-red-500 hover:!bg-red-900/50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
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
            Cargar más tareas
          </Button>
        </div>
      )}
      {deletingTask && (
        <ConfirmDeleteDialog
          isOpen={!!deletingTask}
          onOpenChange={() => setDeletingTask(null)}
          onConfirm={() => {
            onDelete(deletingTask.id)
            setDeletingTask(null)
          }}
          itemName={`la tarea en "${deletingTask.sectorName}"`}
        />
      )}
    </>
  )
}
