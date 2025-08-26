"use client"

import { useState, useCallback, useEffect } from "react"
import ReportFilters from "@/components/reports/report-filters"
import ReportSummary from "@/components/reports/report-summary"
import ReportCharts from "@/components/reports/report-charts"
import ReportTasksTable from "@/components/reports/report-tasks-table"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import type { Task, Worker, SectorPolygon, SectorStatus } from "@/src/types"
import { useNotifications } from "@/src/hooks"

// Datos desde API

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
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [sectors, setSectors] = useState<Array<Pick<SectorPolygon, 'id' | 'name'>>>([])
  const [showReport, setShowReport] = useState(false)
  const { showSimulatedFeature } = useNotifications()

  useEffect(() => {
    const load = async () => {
      const [tasksRes, workersRes, sectorsRes] = await Promise.all([
        fetch('/api/tareas', { cache: 'no-store' }),
        fetch('/api/workers', { cache: 'no-store' }),
        fetch('/api/sectores', { cache: 'no-store' }),
      ])
      const [t, w, s] = await Promise.all([
        tasksRes.json(),
        workersRes.json(),
        sectorsRes.json(),
      ])
      setAllTasks(t)
      setWorkers(w)
      setSectors((s as SectorPolygon[]).map(({ id, name }) => ({ id, name })))
    }
    load().catch(console.error)
  }, [])

  const handleApplyFilters = useCallback((currentFilters: ReportFiltersState) => {
    setFilters(currentFilters) // Guardar los filtros aplicados

    const filtered = allTasks.filter((task) => {
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
        workers={workers}
        sectors={sectors}
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
