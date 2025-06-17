"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface WorkersFiltersProps {
  filters: { name: string; hasActiveTasks: boolean }
  onFilterChange: (filters: { name: string; hasActiveTasks: boolean }) => void
}

export default function WorkersFilters({ filters, onFilterChange }: WorkersFiltersProps) {
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, name: e.target.value })
  }

  const handleActiveTasksChange = (checked: boolean) => {
    onFilterChange({ ...filters, hasActiveTasks: checked })
  }

  const clearFilters = () => {
    onFilterChange({ name: "", hasActiveTasks: false })
  }

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-md space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
      <div className="flex-grow md:mr-4">
        <Input
          placeholder="Buscar por nombre..."
          value={filters.name}
          onChange={handleNameChange}
          className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
        />
      </div>
      <div className="flex items-center space-x-2 pt-4 md:pt-0">
        <Switch
          id="active-tasks-filter"
          checked={filters.hasActiveTasks}
          onCheckedChange={handleActiveTasksChange}
          className="data-[state=checked]:bg-sky-500"
        />
        <Label htmlFor="active-tasks-filter" className="text-slate-300">
          Solo con tareas activas
        </Label>
      </div>
      <Button
        variant="ghost"
        onClick={clearFilters}
        className="text-slate-400 hover:bg-slate-700 hover:text-slate-200 mt-4 md:mt-0 md:ml-4"
      >
        <X className="mr-2 h-4 w-4" /> Limpiar
      </Button>
    </div>
  )
}
