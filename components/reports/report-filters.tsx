"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Filter } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import type { ReportFiltersState } from "@/views/reports-view"
import type { Worker } from "@/views/tasks-view"
import type { SectorPolygon } from "@/components/home/map-interactive-placeholder"

interface ReportFiltersComponentProps {
  workers: Worker[]
  sectors: Array<Pick<SectorPolygon, "id" | "name">>
  onApplyFilters: (filters: ReportFiltersState) => void
  initialFilters: ReportFiltersState
}

export default function ReportFilters({
  workers,
  sectors,
  onApplyFilters,
  initialFilters,
}: ReportFiltersComponentProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialFilters.dateRange)
  const [taskType, setTaskType] = useState(initialFilters.taskType)
  const [status, setStatus] = useState(initialFilters.status)
  const [sectorId, setSectorId] = useState(initialFilters.sectorId)
  const [workerId, setWorkerId] = useState(initialFilters.workerId)

  const handleSubmit = () => {
    onApplyFilters({ dateRange, taskType, status, sectorId, workerId })
  }

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-md space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-slate-50 hover:bg-slate-600 hover:text-slate-50"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y", { locale: es })} -{" "}
                    {format(dateRange.to, "LLL dd, y", { locale: es })}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y", { locale: es })
                )
              ) : (
                <span>Rango de fechas</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
            <Calendar mode="range" selected={dateRange} onSelect={setDateRange} numberOfMonths={2} locale={es} />
          </PopoverContent>
        </Popover>

        <Select value={taskType} onValueChange={setTaskType}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectValue placeholder="Tipo de tarea" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
            <SelectItem value="todos">Todos los Tipos</SelectItem>
            <SelectItem value="Poda">Poda</SelectItem>
            <SelectItem value="Corte de pasto">Corte de pasto</SelectItem>
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
            <SelectItem value="todos">Todos los Estados</SelectItem>
            <SelectItem value="pendiente">Pendiente</SelectItem>
            <SelectItem value="en proceso">En Proceso</SelectItem>
            <SelectItem value="completado">Completado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sectorId} onValueChange={setSectorId}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
            <SelectItem value="todos">Todos los Sectores</SelectItem>
            {sectors.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={workerId} onValueChange={setWorkerId}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectValue placeholder="Trabajador" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
            <SelectItem value="todos">Todos los Trabajadores</SelectItem>
            {workers.map((w) => (
              <SelectItem key={w.id} value={w.id}>
                {w.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSubmit} className="bg-sky-500 hover:bg-sky-600 text-white w-full lg:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Generar Informe
        </Button>
      </div>
    </div>
  )
}
