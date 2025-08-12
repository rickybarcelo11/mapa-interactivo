"use client"

import { useState } from "react"
import SectorsFilters from "@/components/sectors/sectors-filters"
import SectorsTable from "@/components/sectors/sectors-table"
import EditSectorModal from "@/components/sectors/edit-sector-modal"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import type { SectorPolygon } from "@/components/home/map-interactive-placeholder" // Reutilizamos el tipo
import { useNotifications } from "@/src/hooks"
import { useRouter } from "next/navigation"

// Datos de ejemplo para los sectores
const sampleSectorsData: SectorPolygon[] = [
  {
    id: "1",
    name: "Sector Alpha",
    type: "Poda",
    direccion: "Calle Falsa 123",
    status: "pendiente",
    observaciones: "Requiere atención urgente. Árboles muy altos.",
    path: [],
  },
  {
    id: "2",
    name: "Sector Beta",
    type: "Corte de pasto",
    direccion: "Avenida Siempreviva 742",
    status: "en proceso",
    observaciones: "Pasto crecido en la plaza principal.",
    path: [],
  },
  {
    id: "3",
    name: "Sector Gamma",
    type: "Poda",
    direccion: "Boulevard de los Sueños Rotos 45",
    status: "completado",
    observaciones: "Trabajo finalizado correctamente.",
    path: [],
  },
  {
    id: "4",
    name: "Sector Delta",
    type: "Poda",
    direccion: "Pasaje Estrecho 99",
    status: "pendiente",
    observaciones: "Ramas obstruyendo cableado.",
    path: [],
  },
  {
    id: "5",
    name: "Sector Epsilon",
    type: "Corte de pasto",
    direccion: "Ruta Perdida Km 50",
    status: "en proceso",
    observaciones: "Mantenimiento de banquinas.",
    path: [],
  },
  {
    id: "6",
    name: "Sector Zeta",
    type: "Poda",
    direccion: "Plaza Central",
    status: "completado",
    observaciones: "Limpieza post-evento finalizada.",
    path: [],
  },
  {
    id: "7",
    name: "Sector Eta",
    type: "Corte de pasto",
    direccion: "Puente sobre el río",
    status: "pendiente",
    observaciones: "Revisión estructural necesaria.",
    path: [],
  },
  {
    id: "8",
    name: "Sector Theta",
    type: "Poda",
    direccion: "Calle Ancha 2000",
    status: "en proceso",
    observaciones: "Poda formativa en árboles jóvenes.",
    path: [],
  },
  {
    id: "9",
    name: "Sector Iota",
    type: "Corte de pasto",
    direccion: "Barrio Las Flores",
    status: "pendiente",
    observaciones: "Múltiples quejas de vecinos.",
    path: [],
  },
  {
    id: "10",
    name: "Sector Kappa",
    type: "Poda",
    direccion: "Avenida de los Árboles 1-100",
    status: "completado",
    observaciones: "Despeje de luminarias completo.",
    path: [],
  },
  {
    id: "11",
    name: "Sector Lambda",
    type: "Poda",
    direccion: "Mercado Municipal",
    status: "en proceso",
    observaciones: "Limpieza profunda semanal.",
    path: [],
  },
  {
    id: "12",
    name: "Sector Mu",
    type: "Corte de pasto",
    direccion: "Red de semáforos Centro",
    status: "pendiente",
    observaciones: "Semáforo en intermitente.",
    path: [],
  },
  {
    id: "13",
    name: "Sector Nu",
    type: "Corte de pasto",
    direccion: "Parque del Este",
    status: "completado",
    observaciones: "Finalizado para el fin de semana.",
    path: [],
  },
  {
    id: "14",
    name: "Sector Xi",
    type: "Poda",
    direccion: "Zona Residencial Norte",
    status: "pendiente",
    observaciones: "Árbol caído por tormenta.",
    path: [],
  },
  {
    id: "15",
    name: "Sector Omicron",
    type: "Poda",
    direccion: "Varios",
    status: "en proceso",
    observaciones: "Campaña de vacunación de mascotas.",
    path: [],
  },
]

export interface SectorFiltersState {
  nombre: string
  tipo: string
  estado: string
  direccion: string
}

export default function SectorsView() {
  const [sectors, setSectors] = useState<SectorPolygon[]>(sampleSectorsData)
  const [editingSector, setEditingSector] = useState<SectorPolygon | null>(null)
  const [filters, setFilters] = useState<SectorFiltersState>({
    nombre: "",
    tipo: "todos",
    estado: "todos",
    direccion: "",
  })
  const { showSimulatedFeature } = useNotifications()
  const router = useRouter()

  const handleFilterChange = (newFilters: Partial<SectorFiltersState>) => {
    setFilters((prevFilters) => ({ ...prevFilters, ...newFilters }))
  }

  // Simulación de filtrado
  const filteredSectors = sectors.filter((sector) => {
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
            setSectors((prev) => prev.filter((s) => s.id !== sectorId))
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
            setSectors((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
            setEditingSector(null)
          }}
        />
      )}
    </div>
  )
}
