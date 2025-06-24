import type { Task } from "../types"

// Una única fuente de verdad para todas las tareas de ejemplo
export const tasksData: Task[] = [
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
    observations: "Revisar el árbol más grande cerca de la esquina.",
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
    observations: "El césped está muy alto en la zona de juegos.",
  },
  {
    id: "t3",
    sectorId: "3",
    sectorName: "Sector Gamma",
    type: "Poda",
    status: "completado",
    startDate: "2024-04-15",
    endDate: "2024-04-20",
    assignedWorkerId: "w1",
    assignedWorkerName: "Juan Pérez",
    observations: "Trabajo finalizado sin inconvenientes.",
  },
  // ... (incluir el resto de las 22 tareas de ejemplo de la versión anterior)
  {
    id: "t22",
    sectorId: "10",
    sectorName: "Sector Kappa",
    type: "Corte de pasto",
    status: "pendiente",
    startDate: "2024-06-01",
    endDate: null,
    assignedWorkerId: "w4",
    assignedWorkerName: "Ana Martínez",
    observations: "",
  },
]
