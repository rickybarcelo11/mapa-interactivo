"use client"
import { useState, useEffect, useCallback, useMemo, memo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { CalendarIcon, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import type { DateRange } from "react-day-picker"
import type { Task, Worker } from "@/views/tasks-view"

interface TasksFiltersProps {
  workers: Worker[]
  sectors: { id: string; name: string }[]
  onFilterChange: (filteredTasks: Task[]) => void
  allTasks: Task[]
}

function TasksFilters({ workers, sectors, onFilterChange, allTasks }: TasksFiltersProps) {
  const [text, setText] = useState("")
  const [status, setStatus] = useState("todos")
  const [type, setType] = useState("todos")
  const [sectorId, setSectorId] = useState("todos")
  const [workerId, setWorkerId] = useState("todos")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const uniqueSectors = useMemo(() => 
    [...new Map(sectors.map((item) => [item["id"], item])).values()], 
    [sectors]
  )

  const clearFilters = useCallback(() => {
    setText("")
    setStatus("todos")
    setType("todos")
    setSectorId("todos")
    setWorkerId("todos")
    setDateRange(undefined)
  }, [])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value)
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value)
  }, [])

  const handleTypeChange = useCallback((value: string) => {
    setType(value)
  }, [])

  const handleSectorChange = useCallback((value: string) => {
    setSectorId(value)
  }, [])

  const handleWorkerChange = useCallback((value: string) => {
    setWorkerId(value)
  }, [])

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range)
  }, [])

  useEffect(() => {
    const filtered = allTasks.filter((task) => {
      const searchText = text.toLowerCase()
      const taskStartDate = new Date(task.startDate)

      const textMatch =
        !text ||
        task.sectorName.toLowerCase().includes(searchText) ||
        task.type.toLowerCase().includes(searchText) ||
        task.assignedWorkerName.toLowerCase().includes(searchText) ||
        task.observations.toLowerCase().includes(searchText)

      const statusMatch = status === "todos" || task.status === status
      const typeMatch = type === "todos" || task.type === type
      const sectorMatch = sectorId === "todos" || task.sectorId === sectorId
      const workerMatch = workerId === "todos" || task.assignedWorkerId === workerId

      const dateMatch =
        !dateRange ||
        (dateRange.from && dateRange.to && taskStartDate >= dateRange.from && taskStartDate <= dateRange.to) ||
        (dateRange.from && !dateRange.to && taskStartDate >= dateRange.from) ||
        (!dateRange.from && dateRange.to && taskStartDate <= dateRange.to)

      return textMatch && statusMatch && typeMatch && sectorMatch && workerMatch && dateMatch
    })
    onFilterChange(filtered)
  }, [text, status, type, sectorId, workerId, dateRange, allTasks, onFilterChange])

  const dateRangeText = useMemo(() => {
    if (dateRange?.from) {
      if (dateRange.to) {
        return `${format(dateRange.from, "LLL dd, y", { locale: es })} - ${format(dateRange.to, "LLL dd, y", { locale: es })}`
      }
      return format(dateRange.from, "LLL dd, y", { locale: es })
    }
    return "Rango de fechas"
  }, [dateRange])

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-md space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          placeholder="Búsqueda por texto libre..."
          value={text}
          onChange={handleTextChange}
          className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400 lg:col-span-3"
        />
        <Select value={status} onValueChange={handleStatusChange}>
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
        <Select value={type} onValueChange={handleTypeChange}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
            <SelectItem value="todos">Todos los Tipos</SelectItem>
            <SelectItem value="Poda">Poda</SelectItem>
            <SelectItem value="Corte de pasto">Corte de pasto</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sectorId} onValueChange={handleSectorChange}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectValue placeholder="Sector" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
            <SelectItem value="todos">Todos los Sectores</SelectItem>
            {uniqueSectors.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={workerId} onValueChange={handleWorkerChange}>
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
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal bg-slate-700 border-slate-600 text-slate-50 hover:bg-slate-600 hover:text-slate-50"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRangeText}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-slate-800 border-slate-700" align="start">
            <Calendar mode="range" selected={dateRange} onSelect={handleDateRangeChange} numberOfMonths={2} locale={es} />
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="text-slate-400 hover:bg-slate-700 hover:text-slate-200"
        >
          <X className="mr-2 h-4 w-4" /> Limpiar Filtros
        </Button>
      </div>
    </div>
  )
}

export default memo(TasksFilters)
