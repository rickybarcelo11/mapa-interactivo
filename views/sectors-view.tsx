"use client"

import { useEffect, useState } from "react"
import SectorsFilters from "@/components/sectors/sectors-filters"
import SectorsTable from "@/components/sectors/sectors-table"
import EditSectorModal from "@/components/sectors/edit-sector-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { SectorPolygon } from "@/src/types"
import { useSectorsStore } from "@/src/stores/sectors-store"
import { useNotifications } from "@/src/hooks"
import { useRouter } from "next/navigation"

// Datos desde API

export interface SectorFiltersState {
  nombre: string
  tipo: string
  estado: string
  direccion: string
}

export default function SectorsView() {
  const sectorsStore = useSectorsStore((s) => s)
  const [editingSector, setEditingSector] = useState<SectorPolygon | null>(null)
  const [filters, setFilters] = useState<SectorFiltersState>({
    nombre: "",
    tipo: "todos",
    estado: "todos",
    direccion: "",
  })
  const { showSimulatedFeature } = useNotifications()
  const router = useRouter()

  useEffect(() => {
    sectorsStore.initializeSectors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleFilterChange = (newFilters: Partial<SectorFiltersState>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }))
  }

  // Simulación de filtrado
  const filteredSectors = sectorsStore.sectors.filter((sector) => {
    return (
      (filters.nombre === "" || sector.name.toLowerCase().includes(filters.nombre.toLowerCase())) &&
      (filters.tipo === "todos" || sector.type === filters.tipo) &&
      (filters.estado === "todos" || sector.status === filters.estado) &&
      (filters.direccion === "" ||
        (sector.direccion && sector.direccion.toLowerCase().includes(filters.direccion.toLowerCase())))
    )
  })

  const handleAddNewSector = () => {
    router.push("/")
  }

  const handleViewHistory = (sector: SectorPolygon) => {
    // Redirigir a tareas filtradas por sector y autoexpandir primera tarea
    router.push(`/tareas?sectorId=${encodeURIComponent(sector.id)}&autoExpand=1`)
  }

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Gestión de Sectores</h1>
        <Button onClick={handleAddNewSector} className="bg-sky-500 hover:bg-sky-600 text-white">
          <PlusCircle className="mr-2 h-5 w-5" />
          Agregar Nuevo Sector (en Mapa)
        </Button>
      </div>
      <SectorsFilters filters={filters} onFilterChange={handleFilterChange} />
      <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
        <SectorsTable 
          sectors={filteredSectors}
          onEdit={(sector) => {
            setEditingSector(sector)
          }}
          onDelete={(sectorId) => {
            sectorsStore.deleteSector(sectorId)
          }}
          onViewHistory={handleViewHistory}
        />
      </div>
      {editingSector && (
        <EditSectorModal
          isOpen={!!editingSector}
          onOpenChange={() => setEditingSector(null)}
          sector={editingSector}
          onSave={(updated) => {
            sectorsStore.updateSector(updated)
            setEditingSector(null)
          }}
        />
      )}
    </div>
  )
}
