"use client"

import { useEffect, useMemo, useState, Fragment, useCallback, memo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import type { Task } from "@/src/types"
import TaskHistoryPanel from "./task-history-panel"
import { ChevronRight, ChevronDown } from "lucide-react"

interface TasksExpandableListProps {
  tasks: Task[]
  autoExpandTaskId?: string | null
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onFinish: (taskId: string) => void
  onStart: (taskId: string) => void
}

// Componente memoizado para la fila de tarea
const TaskRow = memo(({ 
  task, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  onFinish,
  onStart 
}: {
  task: Task
  isExpanded: boolean
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onFinish: (taskId: string) => void
  onStart: (taskId: string) => void
}) => {
  const handleToggle = useCallback(() => {
    onToggle(task.id)
  }, [task.id, onToggle])

  const handleEdit = useCallback(() => {
    onEdit(task)
  }, [task, onEdit])

  const handleDelete = useCallback(() => {
    onDelete(task.id)
  }, [task.id, onDelete])

  const handleFinish = useCallback(() => {
    onFinish(task.id)
  }, [task.id, onFinish])

  const handleStart = useCallback(() => {
    onStart(task.id)
  }, [task.id, onStart])

  const isCompleted = useMemo(() => task.status === "completado", [task.status])
  const canStart = useMemo(() => task.status === "pendiente" || !task.startDate, [task.status, task.startDate])

  return (
    <Fragment key={task.id}>
      <TableRow 
        className="border-b border-slate-700 hover:bg-slate-700 cursor-pointer data-[state=selected]:bg-slate-600"
        data-state={isExpanded ? "selected" : ""}
        onClick={handleToggle}
      >
        <TableCell className="py-3 px-4">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-sky-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-400" />
          )}
        </TableCell>
        <TableCell className="font-medium text-sky-400 py-3 px-4">{task.sectorName}</TableCell>
        <TableCell className="text-slate-300 py-3 px-4">{task.type}</TableCell>
        <TableCell className="text-slate-300 py-3 px-4 capitalize">{task.status}</TableCell>
        <TableCell className="text-slate-300 py-3 px-4">{task.assignedWorkerName}</TableCell>
        <TableCell className="text-slate-300 py-3 px-4">{task.startDate}</TableCell>
        <TableCell className="text-slate-300 py-3 px-4">{task.endDate || "N/A"}</TableCell>
        <TableCell className="py-3 px-4 space-x-2" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={handleEdit}>Editar</Button>
          {canStart && (
            <Button size="sm" onClick={handleStart} className="bg-blue-600 hover:bg-blue-500">Iniciar</Button>
          )}
          {!isCompleted && (
            <Button size="sm" onClick={handleFinish} className="bg-green-600 hover:bg-green-500">Finalizar</Button>
          )}
          <Button size="sm" variant="destructive" onClick={handleDelete}>Eliminar</Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow key={`${task.id}-expanded`} className="bg-slate-750 border-b-2 border-sky-500">
          <TableCell colSpan={8} className="p-4" onClick={(e) => e.stopPropagation()}>
            <TaskHistoryPanel task={task} />
          </TableCell>
        </TableRow>
      )}
    </Fragment>
  )
})

TaskRow.displayName = "TaskRow"

function TasksExpandableList({ tasks, autoExpandTaskId, onEdit, onDelete, onFinish, onStart }: TasksExpandableListProps) {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null)

  useEffect(() => {
    if (autoExpandTaskId) setExpandedTaskId(autoExpandTaskId)
  }, [autoExpandTaskId])

  const toggle = useCallback((id: string) => {
    setExpandedTaskId(prev => prev === id ? null : id)
  }, [])

  const memoizedTasks = useMemo(() => tasks, [tasks])

  if (memoizedTasks.length === 0) {
    return <p className="p-4 text-center text-slate-400">No se encontraron tareas.</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader className="bg-slate-750">
          <TableRow className="hover:bg-slate-700 border-slate-700">
            <TableHead className="w-[50px] text-slate-300"></TableHead>
            <TableHead className="text-slate-300">Sector</TableHead>
            <TableHead className="text-slate-300">Tipo</TableHead>
            <TableHead className="text-slate-300">Estado</TableHead>
            <TableHead className="text-slate-300">Trabajador</TableHead>
            <TableHead className="text-slate-300">Inicio</TableHead>
            <TableHead className="text-slate-300">Fin</TableHead>
            <TableHead className="text-slate-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memoizedTasks.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              isExpanded={expandedTaskId === task.id}
              onToggle={toggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onFinish={onFinish}
              onStart={onStart}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default memo(TasksExpandableList)
