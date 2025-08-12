"use client"

import { useState, useCallback } from "react"
import ReportFilters from "@/components/reports/report-filters"
import ReportSummary from "@/components/reports/report-summary"
import ReportCharts from "@/components/reports/report-charts"
import ReportTasksTable from "@/components/reports/report-tasks-table"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import type { Task, Worker } from "./tasks-view" // Reutilizar tipos
import type { SectorPolygon, SectorStatus } from "@/components/home/map-interactive-placeholder" // Reutilizar tipos
import { useNotifications } from "@/src/hooks"

// Usaremos los mismos datos de ejemplo que en TasksView para simular
const sampleWorkers: Worker[] = [
  { id: "w1", name: "Juan Pérez" },
  { id: "w2", name: "María García" },
  { id: "w3", name: "Carlos López" },
  { id: "w4", name: "Ana Martínez" },
  { id: "w5", name: "Laura Gómez" },
  { id: "w6", name: "David Fernández" },
]

const sampleSectorsForReport: Array<Pick<SectorPolygon, "id" | "name">> = [
  { id: "1", name: "Sector Alpha" },
  { id: "2", name: "Sector Beta" },
  { id: "3", name: "Sector Gamma" },
  { id: "4", name: "Sector Delta" },
  { id: "5", name: "Sector Epsilon" },
  { id: "6", name: "Sector Zeta" },
  { id: "7", name: "Sector Eta" },
  { id: "8", name: "Sector Theta" },
  { id: "9", name: "Sector Iota" },
  { id: "10", name: "Sector Kappa" },
]

const allTasksForReport: Task[] = [
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
    observations: "Revisar árbol grande.",
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
    id: "t3",
    sectorId: "3",
    sectorName: "Sector Gamma",
    type: "Poda",
    status: "completado",
    startDate: "2024-04-15",
    endDate: "2024-04-20",
    assignedWorkerId: "w1",
    assignedWorkerName: "Juan Pérez",
    observations: "Finalizada.",
  },
  {
    id: "t4",
    sectorId: "1",
    sectorName: "Sector Alpha",
    type: "Corte de pasto",
    status: "completado",
    startDate: "2024-04-25",
    endDate: "2024-04-28",
    assignedWorkerId: "w3",
    assignedWorkerName: "Carlos López",
    observations: "Mantenimiento de plaza.",
  },
  {
    id: "t5",
    sectorId: "2",
    sectorName: "Sector Beta",
    type: "Poda",
    status: "pendiente",
    startDate: "2024-05-20",
    endDate: null,
    assignedWorkerId: "w1",
    assignedWorkerName: "Juan Pérez",
    observations: "Rama peligrosa.",
  },
  {
    id: "t6",
    sectorId: "4",
    sectorName: "Sector Delta",
    type: "Poda",
    status: "completado",
    startDate: "2024-05-01",
    endDate: "2024-05-02",
    assignedWorkerId: "w5",
    assignedWorkerName: "Laura Gómez",
    observations: "Limpieza de sumideros.",
  },
  {
    id: "t7",
    sectorId: "5",
    sectorName: "Sector Epsilon",
    type: "Corte de pasto",
    status: "en proceso",
    startDate: "2024-05-11",
    endDate: null,
    assignedWorkerId: "w6",
    assignedWorkerName: "David Fernández",
    observations: "Reparación de juego infantil.",
  },
  {
    id: "t8",
    sectorId: "6",
    sectorName: "Sector Zeta",
    type: "Poda",
    status: "completado",
    startDate: "2024-03-10",
    endDate: "2024-03-15",
    assignedWorkerId: "w3",
    assignedWorkerName: "Carlos López",
    observations: "",
  },
  {
    id: "t9",
    sectorId: "7",
    sectorName: "Sector Eta",
    type: "Corte de pasto",
    status: "pendiente",
    startDate: "2024-05-19",
    endDate: null,
    assignedWorkerId: "w2",
    assignedWorkerName: "María García",
    observations: "Parque necesita corte urgente.",
  },
  {
    id: "t10",
    sectorId: "8",
    sectorName: "Sector Theta",
    type: "Poda",
    status: "completado",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    assignedWorkerId: "w4",
    assignedWorkerName: "Ana Martínez",
    observations: "Campaña de concientización vial.",
  },
  {
    id: "t11",
    sectorId: "9",
    sectorName: "Sector Iota",
    type: "Poda",
    status: "en proceso",
    startDate: "2024-05-14",
    endDate: null,
    assignedWorkerId: "w1",
    assignedWorkerName: "Juan Pérez",
    observations: "Despeje de ramas en tendido eléctrico.",
  },
  {
    id: "t12",
    sectorId: "10",
    sectorName: "Sector Kappa",
    type: "Corte de pasto",
    status: "pendiente",
    startDate: "2024-05-22",
    endDate: null,
    assignedWorkerId: "w5",
    assignedWorkerName: "Laura Gómez",
    observations: "Grafitis en paredón municipal.",
  },
  {
    id: "t13",
    sectorId: "1",
    sectorName: "Sector Alpha",
    type: "Poda",
    status: "completado",
    startDate: "2024-05-05",
    endDate: "2024-05-06",
    assignedWorkerId: "w6",
    assignedWorkerName: "David Fernández",
    observations: "Cambio de luminarias.",
  },
  {
    id: "t14",
    sectorId: "2",
    sectorName: "Sector Beta",
    type: "Corte de pasto",
    status: "completado",
    startDate: "2024-04-20",
    endDate: "2024-04-21",
    assignedWorkerId: "w2",
    assignedWorkerName: "María García",
    observations: "",
  },
  {
    id: "t15",
    sectorId: "3",
    sectorName: "Sector Gamma",
    type: "Poda",
    status: "pendiente",
    startDate: "2024-05-25",
    endDate: null,
    assignedWorkerId: "w3",
    assignedWorkerName: "Carlos López",
    observations: "Revisión de árbol añoso.",
  },
  {
    id: "t16",
    sectorId: "5",
    sectorName: "Sector Epsilon",
    type: "Corte de pasto",
    status: "completado",
    startDate: "2024-05-01",
    endDate: "2024-05-01",
    assignedWorkerId: "w4",
    assignedWorkerName: "Ana Martínez",
    observations: "Banquinas de ruta.",
  },
  {
    id: "t17",
    sectorId: "8",
    sectorName: "Sector Theta",
    type: "Poda",
    status: "en proceso",
    startDate: "2024-05-18",
    endDate: null,
    assignedWorkerId: "w1",
    assignedWorkerName: "Juan Pérez",
    observations: "",
  },
  {
    id: "t18",
    sectorId: "9",
    sectorName: "Sector Iota",
    type: "Corte de pasto",
    status: "completado",
    startDate: "2024-04-15",
    endDate: "2024-04-16",
    assignedWorkerId: "w2",
    assignedWorkerName: "María García",
    observations: "Plaza del barrio.",
  },
  {
    id: "t19",
    sectorId: "1",
    sectorName: "Sector Alpha",
    type: "Corte de pasto",
    status: "pendiente",
    startDate: "2024-05-29",
    endDate: null,
    assignedWorkerId: "w5",
    assignedWorkerName: "Laura Gómez",
    observations: "",
  },
  {
    id: "t20",
    sectorId: "4",
    sectorName: "Sector Delta",
    type: "Poda",
    status: "en proceso",
    startDate: "2024-05-20",
    endDate: null,
    assignedWorkerId: "w6",
    assignedWorkerName: "David Fernández",
    observations: "Pintura de sendas peatonales.",
  },
  {
    id: "t21",
    sectorId: "7",
    sectorName: "Sector Eta",
    type: "Poda",
    status: "completado",
    startDate: "2024-05-03",
    endDate: "2024-05-04",
    assignedWorkerId: "w3",
    assignedWorkerName: "Carlos López",
    observations: "Árboles frente a la escuela.",
  },
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

export interface ReportFiltersState {
  dateRange?: { from?: Date; to?: Date }
  taskType: string // "todos", "Poda", "Corte de pasto", etc.
  status: string // "todos", "pendiente", "en proceso", "completado"
  sectorId: string // "todos" o ID del sector
  workerId: string // "todos" o ID del trabajador
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

export default function ReportsView() {
  const [filters, setFilters] = useState<ReportFiltersState>({
    taskType: "todos",
    status: "todos",
    sectorId: "todos",
    workerId: "todos",
  })
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [showReport, setShowReport] = useState(false)
  const { showSimulatedFeature } = useNotifications()

  const handleApplyFilters = useCallback((currentFilters: ReportFiltersState) => {
    setFilters(currentFilters) // Guardar los filtros aplicados

    const filtered = allTasksForReport.filter((task) => {
      const taskStartDate = new Date(task.startDate)
      const dateMatch =
        !currentFilters.dateRange ||
        ((!currentFilters.dateRange.from || taskStartDate >= currentFilters.dateRange.from) &&
          (!currentFilters.dateRange.to || taskStartDate <= currentFilters.dateRange.to))

      return (
        dateMatch &&
        (currentFilters.taskType === "todos" || task.type === currentFilters.taskType) &&
        (currentFilters.status === "todos" || task.status === currentFilters.status) &&
        (currentFilters.sectorId === "todos" || task.sectorId === currentFilters.sectorId) &&
        (currentFilters.workerId === "todos" || task.assignedWorkerId === currentFilters.workerId)
      )
    })

    // Calcular estadísticas
    const totalTasks = filtered.length
    const completedTasks = filtered.filter((t) => t.status === "completado").length
    const pendingTasks = filtered.filter((t) => t.status === "pendiente").length
    const inProgressTasks = filtered.filter((t) => t.status === "en proceso").length
    const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

    const types = [...new Set(filtered.map((t) => t.type))]
    const completionByType = types.map((type) => {
      const tasksOfType = filtered.filter((t) => t.type === type)
      const completedOfType = tasksOfType.filter((t) => t.status === "completado").length
      return {
        type,
        total: tasksOfType.length,
        completed: completedOfType,
        percentage: tasksOfType.length > 0 ? (completedOfType / tasksOfType.length) * 100 : 0,
      }
    })

    const sectorCounts = filtered.reduce(
      (acc, task) => {
        acc[task.sectorName] = (acc[task.sectorName] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    const activeSectors = Object.entries(sectorCounts)
      .map(([name, taskCount]) => ({ name, taskCount }))
      .sort((a, b) => b.taskCount - a.taskCount)
      .slice(0, 5) // Top 5

    const tasksByStatusForChart: { name: SectorStatus; value: number }[] = [
      { name: "pendiente", value: pendingTasks },
      { name: "en proceso", value: inProgressTasks },
      { name: "completado", value: completedTasks },
    ]
    const tasksByTypeForChart = Object.entries(
      filtered.reduce(
        (acc, task) => {
          acc[task.type] = (acc[task.type] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      ),
    ).map(([name, value]) => ({ name, value }))

    setReportData({
      filteredTasks: filtered,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionPercentage,
      completionByType,
      activeSectors,
      tasksByStatusForChart,
      tasksByTypeForChart,
    })
    setShowReport(true)
  }, [])

  const handleExport = (format: "PDF" | "Excel" | "CSV") => {
    showSimulatedFeature(`Exportar informe como ${format}`)
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Informes y Estadísticas</h1>
      </div>

      <ReportFilters
        workers={sampleWorkers}
        sectors={sampleSectorsForReport}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />

      {showReport && reportData ? (
        <div className="space-y-6 mt-6">
          <ReportSummary reportData={reportData} />
          <ReportCharts reportData={reportData} />
          <div className="flex justify-end gap-2 flex-wrap">
            <Button
              variant="outline"
              onClick={() => handleExport("PDF")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <FileText className="mr-2 h-5 w-5" /> Exportar PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("Excel")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <FileSpreadsheet className="mr-2 h-5 w-5" /> Exportar Excel
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport("CSV")}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <Download className="mr-2 h-5 w-5" /> Exportar CSV
            </Button>
          </div>
          <ReportTasksTable tasks={reportData.filteredTasks} />
        </div>
      ) : (
        showReport && (
          <p className="text-center text-slate-400 mt-6">No hay datos para mostrar con los filtros seleccionados.</p>
        )
      )}
      {!showReport && (
        <p className="text-center text-slate-400 mt-10">
          Selecciona los filtros y presiona "Generar Informe" para ver los resultados.
        </p>
      )}
    </div>
  )
}
