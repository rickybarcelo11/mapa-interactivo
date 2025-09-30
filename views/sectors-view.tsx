"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import SectorsFilters from "@/components/sectors/sectors-filters"
import SectorsTable from "@/components/sectors/sectors-table"
import EditSectorModal from "@/components/sectors/edit-sector-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { SectorPolygon } from "@/src/types"
import { useSectorsStore } from "@/src/stores/sectors-store"
import { shallow } from "zustand/shallow"
import { useNotifications } from "@/src/hooks"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { getSectorsPage } from "@/src/services/provider"

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
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [total, setTotal] = useState(0)
  const [pagedSectors, setPagedSectors] = useState<SectorPolygon[]>([])

  useEffect(() => {
    sectorsStore.initializeSectors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadPage = useCallback(async () => {
    try {
      const resp = await getSectorsPage({
        page,
        pageSize,
        name: filters.nombre || undefined,
        type: filters.tipo !== 'todos' ? filters.tipo : undefined,
        status: filters.estado !== 'todos' ? filters.estado : undefined,
        direccion: filters.direccion || undefined,
      })
      setPagedSectors(resp.items)
      setTotal(resp.total)
    } catch (e) {
      // fallback básico local
      const localFiltered = sectorsStore.sectors.filter((sector) => {
        return (
          (filters.nombre === "" || sector.name.toLowerCase().includes(filters.nombre.toLowerCase())) &&
          (filters.tipo === "todos" || sector.type === filters.tipo) &&
          (filters.estado === "todos" || sector.status === filters.estado) &&
          (filters.direccion === "" ||
            (sector.direccion && sector.direccion.toLowerCase().includes(filters.direccion.toLowerCase())))
        )
      })
      setTotal(localFiltered.length)
      const start = (page - 1) * pageSize
      setPagedSectors(localFiltered.slice(start, start + pageSize))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, filters.nombre, filters.tipo, filters.estado, filters.direccion, sectorsStore.sectors])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const handleFilterChange = (newFilters: Partial<SectorFiltersState>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }))
  }

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

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
      <SectorsFilters filters={filters} onFilterChange={(f) => { setFilters((prev) => ({ ...prev, ...f })); setPage(1) }} />
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2 text-slate-300">
          <span>Tamaño de página</span>
          <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1) }}>
            <SelectTrigger className="w-[100px] bg-slate-700 border-slate-600 text-slate-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="25">25</SelectItem>
            </SelectContent>
          </Select>
          <Separator orientation="vertical" className="bg-slate-600 h-6" />
          <span className="text-slate-400">{total} resultados</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <span className="text-slate-300">Página {page} de {totalPages}</span>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-200 hover:bg-slate-700"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Siguiente
          </Button>
        </div>
      </div>
      <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
        <SectorsTable 
          sectors={pagedSectors}
          onEdit={(sector) => {
            setEditingSector(sector)
          }}
          onDelete={(sectorId) => {
            sectorsStore.deleteSector(sectorId).then(() => loadPage())
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
