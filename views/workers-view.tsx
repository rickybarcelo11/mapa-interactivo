"use client"

import { useState, useMemo, useEffect } from "react"
import WorkersFilters from "@/components/workers/workers-filters"
import WorkersTable from "@/components/workers/workers-table"
import AddEditWorkerModal from "@/components/workers/add-edit-worker-modal"
import ConfirmDeleteDialog from "@/components/tasks/confirm-delete-dialog" // Reutilizamos
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { Worker, Task } from "@/src/types"
import { useWorkersStore } from "@/src/stores/workers-store"
import { useTasksStore } from "@/src/stores/tasks-store"
import { useNotifications } from "@/src/hooks"

// Cargar desde stores (API real)

export default function WorkersView() {
  const workersStore = useWorkersStore((s) => s)
  const tasksStore = useTasksStore((s) => s)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null)
  const [filters, setFilters] = useState({ name: "", hasActiveTasks: false })
  const { showWorkerHasActiveTasks } = useNotifications()
  useEffect(() => {
    workersStore.initializeWorkers()
    tasksStore.initializeTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const workerTasks = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasksStore.tasks.forEach((task) => {
      if (!map.has(task.assignedWorkerId)) {
        map.set(task.assignedWorkerId, [])
      }
      map.get(task.assignedWorkerId)?.push(task)
    })
    return map
  }, [tasksStore.tasks])

  const filteredWorkers = useMemo(() => {
    return workersStore.workers.filter((worker) => {
      const nameMatch = worker.name.toLowerCase().includes(filters.name.toLowerCase())
      if (!filters.hasActiveTasks) {
        return nameMatch
      }
      const activeTasks = workerTasks
        .get(worker.id)
        ?.some((task) => task.status === "pendiente" || task.status === "en proceso")
      return nameMatch && activeTasks
    })
  }, [workersStore.workers, filters, workerTasks])

  const handleOpenModal = (worker: Worker | null = null) => {
    setEditingWorker(worker)
    setIsModalOpen(true)
  }

  const handleSaveWorker = (workerData: Worker) => {
    if (editingWorker) {
      workersStore.updateWorker(workerData)
    } else {
      const { id, ...rest } = workerData
      workersStore.addWorker(rest as Omit<Worker,'id'>)
    }
    setIsModalOpen(false)
    setEditingWorker(null)
  }

  const handleDeleteWorker = (worker: Worker) => {
    const activeTasks = workerTasks
      .get(worker.id)
      ?.some((task) => task.status === "pendiente" || task.status === "en proceso")
    if (activeTasks) {
      showWorkerHasActiveTasks(worker.name)
      return
    }
    setDeletingWorker(worker)
  }

  const confirmDelete = () => {
    if (deletingWorker) {
      workersStore.deleteWorker(deletingWorker.id)
      // Opcional: filtrar tareas del trabajador eliminado en UI
      setDeletingWorker(null)
    }
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Gestión de Trabajadores</h1>
        <Button onClick={() => handleOpenModal()} className="bg-sky-500 hover:bg-sky-600 text-white">
          <PlusCircle className="mr-2 h-5 w-5" />
          Agregar Nuevo Trabajador
        </Button>
      </div>
      <WorkersFilters filters={filters} onFilterChange={setFilters} />
      <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
        <WorkersTable
          workers={filteredWorkers}
          workerTasks={workerTasks}
          onEdit={handleOpenModal}
          onDelete={handleDeleteWorker}
        />
      </div>
      {isModalOpen && (
        <AddEditWorkerModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSave={handleSaveWorker}
          worker={editingWorker}
        />
      )}
      {deletingWorker && (
        <ConfirmDeleteDialog
          isOpen={!!deletingWorker}
          onOpenChange={() => setDeletingWorker(null)}
          onConfirm={confirmDelete}
          itemName={`al trabajador "${deletingWorker.name}"`}
        />
      )}
    </div>
  )
}
