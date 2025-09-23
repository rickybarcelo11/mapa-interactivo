"use client"

import { useState, useCallback, useEffect } from "react"
import ReportFilters from "@/components/reports/report-filters"
import ReportSummary from "@/components/reports/report-summary"
import ReportCharts from "@/components/reports/report-charts"
import ReportTasksTable from "@/components/reports/report-tasks-table"
import { Button } from "@/components/ui/button"
import { Download, FileText, FileSpreadsheet } from "lucide-react"
import type { Task, Worker, SectorPolygon, SectorStatus } from "@/src/types"
import { getReport } from "@/src/services/provider"
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
  const [workers, setWorkers] = useState<Worker[]>([])
  const [sectors, setSectors] = useState<Array<Pick<SectorPolygon, 'id' | 'name'>>>([])
  const [showReport, setShowReport] = useState(false)
  const { showSimulatedFeature } = useNotifications()

  useEffect(() => {
    const load = async () => {
      const [workersRes, sectorsRes] = await Promise.all([
        fetch('/api/workers', { cache: 'no-store' }),
        fetch('/api/sectores', { cache: 'no-store' }),
      ])
      const [w, s] = await Promise.all([
        workersRes.json(),
        sectorsRes.json(),
      ])
      setWorkers(w)
      setSectors((s as SectorPolygon[]).map(({ id, name }) => ({ id, name })))
    }
    load().catch(console.error)
  }, [])

  const handleApplyFilters = useCallback((currentFilters: ReportFiltersState) => {
    setFilters(currentFilters)
    const dateFrom = currentFilters.dateRange?.from ? new Date(currentFilters.dateRange.from).toISOString().slice(0,10) : undefined
    const dateTo = currentFilters.dateRange?.to ? new Date(currentFilters.dateRange.to).toISOString().slice(0,10) : undefined
    getReport({
      dateFrom,
      dateTo,
      status: currentFilters.status === 'todos' ? undefined : currentFilters.status,
      type: currentFilters.taskType === 'todos' ? undefined : currentFilters.taskType,
      sectorId: currentFilters.sectorId === 'todos' ? undefined : currentFilters.sectorId,
      workerId: currentFilters.workerId === 'todos' ? undefined : currentFilters.workerId,
    }).then((data) => {
      setReportData(data)
      setShowReport(true)
    }).catch((e) => {
      console.error(e)
      setReportData(null)
      setShowReport(true)
    })
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
