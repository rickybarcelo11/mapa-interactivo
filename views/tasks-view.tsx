"use client"

import { useState, useEffect } from "react"
import TasksFilters from "@/components/tasks/tasks-filters"
import TasksTable from "@/components/tasks/tasks-table" // Legacy table (unused ahora)
import TasksExpandableList from "@/components/tasks/tasks-expandable-list"
import EditTaskModal from "@/components/tasks/edit-task-modal"
import type { Task, Worker, SectorStatus } from "@/src/types"
import { useSearchParams, useRouter } from "next/navigation"
import { useNotifications } from "@/src/hooks"

// Ahora cargamos desde la API

export default function TasksView() {
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const { showTaskUpdated, showTaskDeleted, showTaskFinished } = useNotifications()
  const searchParams = useSearchParams()
  const router = useRouter()
  const taskIdParam = searchParams.get('taskId')
  const sectorIdParam = searchParams.get('sectorId')
  const workerIdParam = searchParams.get('workerId')
  const autoExpandParam = searchParams.get('autoExpand')

  // Carga de datos desde la API
  useEffect(() => {
    const load = async () => {
      const [tasksRes, workersRes] = await Promise.all([
        fetch('/api/tareas', { cache: 'no-store' }),
        fetch('/api/workers', { cache: 'no-store' })
      ])
      const [tasks, workers] = await Promise.all([
        tasksRes.json(),
        workersRes.json()
      ])
      setAllTasks(tasks)
      setFilteredTasks(tasks)
      setWorkers(workers)
    }
    load().catch(console.error)
  }, [])

  // Aplicar filtros por query params y autoexpansión
  useEffect(() => {
    // Aplicar filtro por sector o worker si vienen en la URL
    let result = allTasks
    if (sectorIdParam) {
      result = result.filter(t => t.sectorId === sectorIdParam)
    }
    if (workerIdParam) {
      result = result.filter(t => t.assignedWorkerId === workerIdParam)
    }
    setFilteredTasks(result)
  }, [allTasks, sectorIdParam, workerIdParam])

  // Si viene autoExpand=1 y no hay taskId específico, autoexpandir la primera tarea filtrada
  const autoExpandTaskId = taskIdParam || (autoExpandParam === '1' && filteredTasks.length > 0 ? filteredTasks[0].id : null)

  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = allTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    setAllTasks(newTasks)
    // El componente de filtros se encargará de actualizar `filteredTasks`
    setEditingTask(null)
    showTaskUpdated(updatedTask.sectorName)
  }

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = allTasks.find(task => task.id === taskId)
    const newTasks = allTasks.filter((task) => task.id !== taskId)
    setAllTasks(newTasks)
    if (taskToDelete) {
      showTaskDeleted(taskToDelete.sectorName)
    }
  }

  const handleFinishTask = (taskId: string) => {
    const now = new Date().toISOString().split("T")[0]
    const updateFn = (task: Task) =>
      task.id === taskId ? { ...task, status: "completado" as SectorStatus, endDate: now } : task
    const newTasks = allTasks.map(updateFn)
    setAllTasks(newTasks)
    
    const finishedTask = allTasks.find(task => task.id === taskId)
    if (finishedTask) {
      showTaskFinished(finishedTask.sectorName)
    }
  }

  const uniqueSectors = [
    ...new Map(allTasks.map((item) => [item.sectorId, { id: item.sectorId, name: item.sectorName }])).values(),
  ]

  return (
    <div className="space-y-6 p-1">
      <h1 className="text-3xl font-bold text-slate-100">Gestión de Tareas</h1>
      <TasksFilters
        workers={workers}
        sectors={uniqueSectors}
        onFilterChange={setFilteredTasks} // El filtro ahora recibe la lista filtrada
        allTasks={allTasks} // El filtro necesita todas las tareas para trabajar
      />
      <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
        <TasksExpandableList
          tasks={filteredTasks}
          autoExpandTaskId={autoExpandTaskId}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          onFinish={handleFinishTask}
        />
      </div>
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          workers={workers}
          isOpen={!!editingTask}
          onOpenChange={() => setEditingTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  )
}
