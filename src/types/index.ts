// Tipos Generales y de Sectores
export type SectorStatus = "pendiente" | "en proceso" | "completado"
export type SectorType = "Poda" | "Corte de pasto"

export interface SectorPolygon {
  id: string
  name: string
  status: SectorStatus
  type: SectorType
  path: { lat: number; lng: number }[]
  direccion?: string
  observaciones?: string
}

// Tipos de Tareas y Trabajadores
export interface Worker {
  id: string
  name: string
  observaciones?: string
}

export interface Task {
  id: string
  sectorId: string
  sectorName: string
  type: string
  status: SectorStatus
  startDate: string
  endDate: string | null
  assignedWorkerId: string
  assignedWorkerName: string
  observations: string
}

// Tipos de Arbolado
export type SidewalkSide = "Norte" | "Sur" | "Este" | "Oeste" | "Ambas" | "Ninguna"
export type TreeStatus = "Sano" | "Enfermo" | "Necesita Poda" | "Seco" | "Recién Plantado" | "Malo"

export interface TreeSection {
  id: string
  addressRange: string
  sidewalkSide: "Norte" | "Sur" | "Este" | "Oeste" | "Ambas"
  predominantSpecies: string
  treeCount: number
  generalStatus: "Bueno" | "Regular" | "Malo" | "Necesita Intervención"
}

export interface StreetWithSections {
  id: string
  name: string
  sections: TreeSection[]
}

export interface IndividualTree {
  id: string
  species: string
  status: TreeStatus
  streetName: string
  streetNumber: string
  sidewalk?: SidewalkSide
  location?: { lat: number; lng: number }
  plantingDate?: string
  lastPruningDate?: string
  observations?: string
}

// Tipos de Informes
export interface ReportFiltersState {
  dateRange?: { from?: Date; to?: Date }
  taskType: string
  status: string
  sectorId: string
  workerId: string
}

export interface ReportData {
  filteredTasks: Task[]
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  completionPercentage: number
  completionByType: { type: string; percentage: number; total: number; completed: number }[]
  activeSectors: { name: string; taskCount: number }[]
  tasksByStatusForChart: { name: SectorStatus; value: number }[]
  tasksByTypeForChart: { name: string; value: number }[]
}
