"use client"

import { useState, useEffect } from "react"
import TasksFilters from "@/components/tasks/tasks-filters"
import TasksTable from "@/components/tasks/tasks-table" // Legacy table (unused ahora)
import TasksExpandableList from "@/components/tasks/tasks-expandable-list"
import EditTaskModal from "@/components/tasks/edit-task-modal"
import type { Task, Worker, SectorStatus } from "@/src/types"
import { useTasksStore } from "@/src/stores/tasks-store"
import { useWorkersStore } from "@/src/stores/workers-store"
import { useSearchParams, useRouter } from "next/navigation"
import { useNotifications } from "@/src/hooks"

// Ahora cargamos desde la API

export default function TasksView() {
  const tasksStore = useTasksStore((s) => s)
  const workersStore = useWorkersStore((s) => s)
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
    tasksStore.initializeTasks()
    workersStore.initializeWorkers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aplicar filtros por query params y autoexpansión
  useEffect(() => {
    // Aplicar filtro por sector o worker solo si vienen en la URL con valores específicos
    let result = tasksStore.tasks
    if (sectorIdParam && sectorIdParam !== 'todos') {
      result = result.filter(t => t.sectorId === sectorIdParam)
    }
    if (workerIdParam && workerIdParam !== 'todos') {
      result = result.filter(t => t.assignedWorkerId === workerIdParam)
    }
    setFilteredTasks(result)
  }, [tasksStore.tasks, sectorIdParam, workerIdParam])

  // Si viene autoExpand=1 y no hay taskId específico, autoexpandir la primera tarea filtrada
  const autoExpandTaskId = taskIdParam || (autoExpandParam === '1' && filteredTasks.length > 0 ? filteredTasks[0].id : null)

  const handleUpdateTask = (updatedTask: Task) => {
    tasksStore.updateTask(updatedTask)
    setEditingTask(null)
    showTaskUpdated(updatedTask.sectorName)
  }

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasksStore.getTaskById(taskId)
    tasksStore.deleteTask(taskId)
    if (taskToDelete) showTaskDeleted(taskToDelete.sectorName)
  }

  const handleFinishTask = (taskId: string) => {
    const now = new Date().toISOString().split("T")[0]
    tasksStore.finishTask({ id: taskId, endDate: now })
    const finishedTask = tasksStore.getTaskById(taskId)
    if (finishedTask) showTaskFinished(finishedTask.sectorName)
  }

  const uniqueSectors = [
    ...new Map(tasksStore.tasks.map((item) => [item.sectorId, { id: item.sectorId, name: item.sectorName }])).values(),
  ]

  return (
    <div className="space-y-6 p-1">
      <h1 className="text-3xl font-bold text-slate-100">Gestión de Tareas</h1>
      <TasksFilters
        workers={workersStore.workers}
        sectors={uniqueSectors}
        onFilterChange={setFilteredTasks} // El filtro ahora recibe la lista filtrada
        allTasks={tasksStore.tasks} // El filtro necesita todas las tareas para trabajar
      />
      <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
        <TasksExpandableList
          tasks={filteredTasks}
          autoExpandTaskId={autoExpandTaskId}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          onFinish={handleFinishTask}
          onStart={(taskId) => {
            const today = new Date().toISOString().slice(0,10)
            tasksStore.startTask({ id: taskId, startDate: today })
          }}
        />
      </div>
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          workers={workersStore.workers}
          isOpen={!!editingTask}
          onOpenChange={() => setEditingTask(null)}
          onSave={handleUpdateTask}
        />
      )}
    </div>
  )
}
