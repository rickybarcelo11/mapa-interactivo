"use client"

import { useState, useEffect, useCallback } from "react"
import TasksFilters from "@/components/tasks/tasks-filters"
import TasksTable from "@/components/tasks/tasks-table" // Legacy table (unused ahora)
import TasksExpandableList from "@/components/tasks/tasks-expandable-list"
import EditTaskModal from "@/components/tasks/edit-task-modal"
import AddTaskModal from "@/components/tasks/add-task-modal"
import type { Task, Worker, SectorStatus } from "@/src/types"
import { useTasksStore } from "@/src/stores/tasks-store"
import { useWorkersStore } from "@/src/stores/workers-store"
import { useSectorsStore } from "@/src/stores/sectors-store"
import { useSearchParams, useRouter } from "next/navigation"
import { useNotifications } from "@/src/hooks"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { getTasksPage } from "@/src/services/provider"

// Ahora cargamos desde la API

export default function TasksView() {
  const tasksStore = useTasksStore((s) => s)
  const tasks = useTasksStore((s) => s.tasks)
  const workersStore = useWorkersStore((s) => s)
  const sectorsStore = useSectorsStore((s) => s)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
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
    sectorsStore.initializeSectors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Aplicar filtros por query params y autoexpansión
  useEffect(() => {
    // Aplicar filtro por sector o worker solo si vienen en la URL con valores específicos
    let result = tasks
    if (sectorIdParam && sectorIdParam !== 'todos') {
      result = result.filter(t => t.sectorId === sectorIdParam)
    }
    if (workerIdParam && workerIdParam !== 'todos') {
      result = result.filter(t => t.assignedWorkerId === workerIdParam)
    }
    setFilteredTasks(result)
  }, [tasks, sectorIdParam, workerIdParam])

  // Si viene autoExpand=1 y no hay taskId específico, autoexpandir la primera tarea filtrada
  const autoExpandTaskId = taskIdParam || (autoExpandParam === '1' && filteredTasks.length > 0 ? filteredTasks[0].id : null)

  const handleUpdateTask = (updatedTask: Task) => {
    tasksStore.updateTask(updatedTask)
    // Optimista en la tabla: reflejar cambios de asignación/estado al instante
    setFilteredTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    )
    setEditingTask(null)
    showTaskUpdated(updatedTask.sectorName)
  }

  const handleCreateOrResetTask = async (payload: Omit<Task, 'id'>) => {
    // Regla: 1 sector = 1 tarea activa. Si existe, la "reiniciamos" (update);
    // si no existe, la creamos.
    const existing = tasksStore.getTasksBySector(payload.sectorId)[0]
    if (existing) {
      await tasksStore.updateTask({
        id: existing.id,
        sectorId: payload.sectorId,
        sectorName: payload.sectorName,
        type: payload.type,
        status: payload.status,
        startDate: payload.startDate,
        endDate: null,
        assignedWorkerId: payload.assignedWorkerId,
        assignedWorkerName: payload.assignedWorkerName,
        observations: payload.observations,
      })
    } else {
      await tasksStore.addTask(payload)
    }
    // Refrescar lista desde API para asegurar consistencia y forzar re-render
    await tasksStore.initializeTasks()
    setPage(1)
    setIsAddModalOpen(false)
  }

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasksStore.getTaskById(taskId)
    tasksStore.deleteTask(taskId)
    if (taskToDelete) showTaskDeleted(taskToDelete.sectorName)
  }

  const handleFinishTask = (taskId: string) => {
    const now = new Date().toISOString().split("T")[0]
    tasksStore.finishTask({ id: taskId, endDate: now })
    // Optimista en la tabla
    setFilteredTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: 'completado', endDate: now } : t))
    const finishedTask = tasksStore.getTaskById(taskId)
    if (finishedTask) showTaskFinished(finishedTask.sectorName)
  }

  const uniqueSectors = [
    ...new Map(sectorsStore.sectors.map((s) => [s.id, { id: s.id, name: s.name }])).values(),
  ]

  // Paginación server: cuando cambien filtros de TasksFilters reemplazamos filteredTasks y pedimos página
  const handleFiltersChange = useCallback((list: Task[]) => {
    setFilteredTasks(list)
    setPage(1)
  }, [])

  useEffect(() => {
    const fetchPage = async () => {
      try {
        // Derivamos parámetros básicos desde la lista filtrada (cuando sea posible)
        // Nota: como TasksFilters filtra local, aquí usamos server solo para recortar al pageSize
        setTotal(filteredTasks.length)
      } catch (e) {
        setTotal(filteredTasks.length)
      }
    }
    fetchPage()
  }, [filteredTasks])

  const currentPageTasks = filteredTasks.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className="space-y-6 p-1">
      <h1 className="text-3xl font-bold text-slate-100">Gestión de Tareas</h1>
      <TasksFilters
        workers={workersStore.workers}
        sectors={uniqueSectors}
        onFilterChange={handleFiltersChange}
        allTasks={tasksStore.tasks} // El filtro necesita todas las tareas para trabajar
      />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-slate-300">
          <span>Tamaño de página</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
            <SelectTrigger className="w-[100px] bg-slate-700 border-slate-600 text-slate-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="bg-slate-600 h-6" />
          <span className="text-slate-400">{total} resultados</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-2 border border-slate-600 text-slate-200 rounded hover:bg-slate-700 disabled:opacity-40"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </button>
          <span className="text-slate-300">Página {page} de {totalPages}</span>
          <button
            className="px-3 py-2 border border-slate-600 text-slate-200 rounded hover:bg-slate-700 disabled:opacity-40"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </button>
        </div>
      </div>
      <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
        <div className="flex justify-end p-3">
          <button
            className="px-3 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded"
            onClick={() => setIsAddModalOpen(true)}
          >
            Nueva tarea
          </button>
        </div>
        <TasksExpandableList
          tasks={currentPageTasks}
          autoExpandTaskId={autoExpandTaskId}
          onEdit={setEditingTask}
          onDelete={handleDeleteTask}
          onFinish={handleFinishTask}
          onStart={(taskId) => {
            const today = new Date().toISOString().slice(0,10)
            tasksStore.startTask({ id: taskId, startDate: today })
            // Optimista en la tabla
            setFilteredTasks((prev) => prev.map((t) => t.id === taskId ? { ...t, status: 'en proceso', startDate: today } : t))
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
      {isAddModalOpen && (
        <AddTaskModal
          isOpen={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          sectors={uniqueSectors}
          workers={workersStore.workers}
          onSave={(t) => handleCreateOrResetTask(t as any)}
        />
      )}
    </div>
  )
}
