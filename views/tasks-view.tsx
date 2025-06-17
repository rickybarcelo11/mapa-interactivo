"use client"

import { useState, useEffect } from "react"
import TasksFilters from "@/components/tasks/tasks-filters"
import TasksTable from "@/components/tasks/tasks-table"
import EditTaskModal from "@/components/tasks/edit-task-modal"
import type { Task, Worker, SectorStatus } from "@/types"

// Importamos los datos simulados
import { tasksData } from "@/data/tasks.data"
import { workersData } from "@/data/workers.data"

export default function TasksView() {
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // Simulación de carga de datos desde una API
  useEffect(() => {
    // En una app real:
    // Promise.all([fetch('/api/tasks'), fetch('/api/workers')])
    //   .then(([tasksRes, workersRes]) => Promise.all([tasksRes.json(), workersRes.json()]))
    //   .then(([tasks, workers]) => {
    //     setAllTasks(tasks);
    //     setFilteredTasks(tasks);
    //     setWorkers(workers);
    //   });

    // Usando mocks:
    setAllTasks(tasksData)
    setFilteredTasks(tasksData) // Inicialmente mostramos todo
    setWorkers(workersData)
  }, [])

  const handleUpdateTask = (updatedTask: Task) => {
    const newTasks = allTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    setAllTasks(newTasks)
    // El componente de filtros se encargará de actualizar `filteredTasks`
    setEditingTask(null)
  }

  const handleDeleteTask = (taskId: string) => {
    const newTasks = allTasks.filter((task) => task.id !== taskId)
    setAllTasks(newTasks)
  }

  const handleFinishTask = (taskId: string) => {
    const now = new Date().toISOString().split("T")[0]
    const updateFn = (task: Task) =>
      task.id === taskId ? { ...task, status: "completado" as SectorStatus, endDate: now } : task
    const newTasks = allTasks.map(updateFn)
    setAllTasks(newTasks)
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
        <TasksTable
          tasks={filteredTasks}
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
