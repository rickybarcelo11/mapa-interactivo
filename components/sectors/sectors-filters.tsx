"use client"

import type React from "react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { SectorFiltersState } from "@/views/sectors-view" // Ajusta la ruta si es necesario

interface SectorsFiltersProps {
  filters: SectorFiltersState
  onFilterChange: (newFilters: Partial<SectorFiltersState>) => void
}

const sectorTypes = ["todos", "Poda", "Corte de pasto"] // "todos" para no filtrar
const sectorStatuses = ["todos", "pendiente", "en proceso", "completado"] // "todos" para no filtrar

export default function SectorsFilters({ filters, onFilterChange }: SectorsFiltersProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: keyof SectorFiltersState, value: string) => {
    onFilterChange({ [name]: value })
  }

  const clearFilters = () => {
    onFilterChange({ nombre: "", tipo: "todos", estado: "todos", direccion: "" })
  }

  return (
    <div className="p-4 bg-slate-800 rounded-lg shadow-md space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Input
          type="text"
          name="nombre"
          placeholder="Buscar por nombre..."
          value={filters.nombre}
          onChange={handleInputChange}
          className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
        />
        <Select name="tipo" value={filters.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectValue placeholder="Tipo de sector" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
            {sectorTypes.map((type) => (
              <SelectItem key={type} value={type} className="capitalize hover:bg-slate-600">
                {type === "todos" ? "Todos los Tipos" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select name="estado" value={filters.estado} onValueChange={(value) => handleSelectChange("estado", value)}>
          <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
            {sectorStatuses.map((status) => (
              <SelectItem key={status} value={status} className="capitalize hover:bg-slate-600">
                {status === "todos" ? "Todos los Estados" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="text"
          name="direccion"
          placeholder="Buscar por dirección..."
          value={filters.direccion}
          onChange={handleInputChange}
          className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="text-slate-400 hover:bg-slate-700 hover:text-slate-200"
        >
          <X className="mr-2 h-4 w-4" /> Limpiar Filtros
        </Button>
        {/* El botón de búsqueda podría ser útil si el filtrado no es en tiempo real */}
        {/* <Button className="bg-sky-500 hover:bg-sky-600 text-white">
        <Search className="mr-2 h-4 w-4" /> Buscar
      </Button> */}
      </div>
    </div>
  )
}
