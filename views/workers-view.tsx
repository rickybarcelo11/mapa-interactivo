"use client"

import { useState, useMemo } from "react"
import WorkersFilters from "@/components/workers/workers-filters"
import WorkersTable from "@/components/workers/workers-table"
import AddEditWorkerModal from "@/components/workers/add-edit-worker-modal"
import ConfirmDeleteDialog from "@/components/tasks/confirm-delete-dialog" // Reutilizamos
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { Worker, Task } from "./tasks-view" // Reutilizamos tipos de TasksView
import { useNotifications } from "@/src/hooks"

// Datos de ejemplo (podrían venir de un contexto o API)
const initialWorkers: Worker[] = [
  { id: "w1", name: "Juan Pérez", observaciones: "Experto en poda de altura." },
  { id: "w2", name: "María García", observaciones: "Eficiente en corte de pasto." },
  { id: "w3", name: "Carlos López", observaciones: "Nuevo ingreso, en capacitación." },
  { id: "w4", name: "Ana Martínez", observaciones: "Conductora de maquinaria pesada." },
  { id: "w5", name: "Laura Gómez", observaciones: "Especialista en limpieza urbana." },
  { id: "w6", name: "David Fernández", observaciones: "Técnico en mantenimiento general." },
  { id: "w7", name: "Sofía Rodríguez", observaciones: "Paisajista y experta en jardinería." },
  { id: "w8", name: "Miguel Torres", observaciones: "" },
]

const sampleTasksForWorkers: Task[] = [
  {
    id: "t1",
    sectorId: "1",
    sectorName: "Sector Alpha",
    type: "Poda",
    status: "en proceso",
    startDate: "2024-05-01",
    endDate: null,
    assignedWorkerId: "w1",
    assignedWorkerName: "Juan Pérez",
    observations: "Revisar el árbol más grande.",
  },
  {
    id: "t2",
    sectorId: "2",
    sectorName: "Sector Beta",
    type: "Corte de pasto",
    status: "pendiente",
    startDate: "2024-05-10",
    endDate: null,
    assignedWorkerId: "w2",
    assignedWorkerName: "María García",
    observations: "Césped alto.",
  },
  {
    id: "t5",
    sectorId: "5",
    sectorName: "Sector Epsilon",
    type: "Poda",
    status: "completado",
    startDate: "2024-03-01",
    endDate: "2024-03-05",
    assignedWorkerId: "w1",
    assignedWorkerName: "Juan Pérez",
    observations: "Finalizada.",
  },
  {
    id: "t6",
    sectorId: "6",
    sectorName: "Sector Zeta",
    type: "Corte de pasto",
    status: "en proceso",
    startDate: "2024-05-12",
    endDate: null,
    assignedWorkerId: "w4",
    assignedWorkerName: "Ana Martínez",
    observations: "Revisión de equipos.",
  },
  {
    id: "t7",
    sectorId: "7",
    sectorName: "Sector Eta",
    type: "Poda",
    status: "pendiente",
    startDate: "2024-05-21",
    endDate: null,
    assignedWorkerId: "w5",
    assignedWorkerName: "Laura Gómez",
    observations: "Limpiar fuente de la plaza.",
  },
  {
    id: "t8",
    sectorId: "8",
    sectorName: "Sector Theta",
    type: "Corte de pasto",
    status: "en proceso",
    startDate: "2024-05-15",
    endDate: null,
    assignedWorkerId: "w7",
    assignedWorkerName: "Sofía Rodríguez",
    observations: "Plantar nuevas flores.",
  },
  {
    id: "t9",
    sectorId: "1",
    sectorName: "Sector Alpha",
    type: "Poda",
    status: "completado",
    startDate: "2024-04-10",
    endDate: "2024-04-12",
    assignedWorkerId: "w3",
    assignedWorkerName: "Carlos López",
    observations: "Primera tarea completada.",
  },
  {
    id: "t10",
    sectorId: "2",
    sectorName: "Sector Beta",
    type: "Corte de pasto",
    status: "en proceso",
    startDate: "2024-05-18",
    endDate: null,
    assignedWorkerId: "w2",
    assignedWorkerName: "María García",
    observations: "Segunda pasada necesaria.",
  },
  {
    id: "t11",
    sectorId: "9",
    sectorName: "Sector Iota",
    type: "Mantenimiento",
    status: "pendiente",
    startDate: "2024-05-25",
    endDate: null,
    assignedWorkerId: "w6",
    assignedWorkerName: "David Fernández",
    observations: "Revisar iluminación del parque.",
  },
  {
    id: "t12",
    sectorId: "10",
    sectorName: "Sector Kappa",
    type: "Poda",
    status: "pendiente",
    startDate: "2024-05-28",
    endDate: null,
    assignedWorkerId: "w8",
    assignedWorkerName: "Miguel Torres",
    observations: "Tarea de iniciación.",
  },
  {
    id: "t13",
    sectorId: "4",
    sectorName: "Sector Delta",
    type: "Poda",
    status: "en proceso",
    startDate: "2024-05-19",
    endDate: null,
    assignedWorkerId: "w1",
    assignedWorkerName: "Juan Pérez",
    observations: "Usar equipo de altura.",
  },
]

export default function WorkersView() {
  const [workers, setWorkers] = useState<Worker[]>(initialWorkers)
  const [tasks, setTasks] = useState<Task[]>(sampleTasksForWorkers) // Para detalles y filtros
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null)
  const [deletingWorker, setDeletingWorker] = useState<Worker | null>(null)
  const [filters, setFilters] = useState({ name: "", hasActiveTasks: false })
  const { showWorkerHasActiveTasks } = useNotifications()

  const workerTasks = useMemo(() => {
    const map = new Map<string, Task[]>()
    tasks.forEach((task) => {
      if (!map.has(task.assignedWorkerId)) {
        map.set(task.assignedWorkerId, [])
      }
      map.get(task.assignedWorkerId)?.push(task)
    })
    return map
  }, [tasks])

  const filteredWorkers = useMemo(() => {
    return workers.filter((worker) => {
      const nameMatch = worker.name.toLowerCase().includes(filters.name.toLowerCase())
      if (!filters.hasActiveTasks) {
        return nameMatch
      }
      const activeTasks = workerTasks
        .get(worker.id)
        ?.some((task) => task.status === "pendiente" || task.status === "en proceso")
      return nameMatch && activeTasks
    })
  }, [workers, filters, workerTasks])

  const handleOpenModal = (worker: Worker | null = null) => {
    setEditingWorker(worker)
    setIsModalOpen(true)
  }

  const handleSaveWorker = (workerData: Worker) => {
    if (editingWorker) {
      setWorkers(workers.map((w) => (w.id === workerData.id ? workerData : w)))
    } else {
      setWorkers([...workers, { ...workerData, id: `w${Date.now()}` }]) // Simple ID generation
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
      setWorkers(workers.filter((w) => w.id !== deletingWorker.id))
      // También se deberían reasignar o manejar las tareas del trabajador eliminado
      setTasks(tasks.filter((task) => task.assignedWorkerId !== deletingWorker.id))
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
