"use client"

import { useState, useMemo } from "react"
import dynamic from "next/dynamic"
import MapInteractive from "@/components/home/map-interactive"
import ToolsFab from "@/components/home/tools-fab"
import ToolsPanelSheet from "@/components/home/tools-panel-sheet"
import MapLegendDisplay from "@/components/home/map-legend-display"
import SectorDetailsDialog from "@/components/home/sector-details-dialog"
import NewSectorFormDialog from "@/components/home/new-sector-form-dialog"
import type { SectorPolygon, SectorStatus, SectorType } from "@/src/types"
import { useNotifications } from "@/src/hooks"

const MapInteractiveComponent = dynamic(() => import("@/components/home/map-interactive"), { ssr: false })

const sampleSectors: SectorPolygon[] = [
  {
    id: "1",
    name: "Sector Centro",
    status: "pendiente" as SectorStatus,
    type: "Poda" as SectorType,
    // Polígono más irregular (ejemplo)
    path: [
      { lng: -58.3816, lat: -34.6037 },
      { lng: -58.38, lat: -34.603 },
      { lng: -58.3805, lat: -34.605 },
      { lng: -58.382, lat: -34.6045 },
      { lng: -58.3816, lat: -34.6037 },
    ],
    direccion: "Plaza Principal y alrededores",
    observaciones: "Requiere poda de árboles altos y revisión de estado general.",
  },
  {
    id: "2",
    name: "Parque Norte",
    status: "en proceso" as SectorStatus,
    type: "Corte de pasto" as SectorType,
    path: [
      { lng: -58.3916, lat: -34.5937 },
      { lng: -58.39, lat: -34.593 },
      { lng: -58.39, lat: -34.595 },
      { lng: -58.392, lat: -34.5955 },
      { lng: -58.3925, lat: -34.594 },
      { lng: -58.3916, lat: -34.5937 },
    ],
    direccion: "Zona norte de la ciudad, parque principal",
    observaciones: "Corte de césped en progreso, verificar áreas de juegos.",
  },
  {
    id: "3",
    name: "Barrio Residencial Sur",
    status: "completado" as SectorStatus,
    type: "Poda" as SectorType,
    path: [
      { lng: -58.3716, lat: -34.6137 },
      { lng: -58.37, lat: -34.614 },
      { lng: -58.37, lat: -34.6155 },
      { lng: -58.372, lat: -34.615 },
      { lng: -58.3716, lat: -34.6137 },
    ],
    direccion: "Calles internas del barrio sur",
    observaciones: "Poda de seguridad completada en todas las calles asignadas.",
  },
]

export default function HomeView() {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false)
  const [selectedSector, setSelectedSector] = useState<SectorPolygon | null>(null)
  const [isNewSectorModalOpen, setIsNewSectorModalOpen] = useState(false)
  const [sectors, setSectors] = useState<SectorPolygon[]>(sampleSectors)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [pendingSectorData, setPendingSectorData] = useState<Partial<SectorPolygon> | null>(null)
  const [typeFilters, setTypeFilters] = useState({ poda: true, cortePasto: true })
  const [statusFilters, setStatusFilters] = useState({ pendiente: true, enProceso: true, completado: true })
  const { showSectorCreated, showSectorUpdated } = useNotifications()

  const handlePolygonClick = (sector: SectorPolygon) => {
    setSelectedSector(sector)
  }

  const handleOpenNewSectorForm = () => {
    setIsNewSectorModalOpen(true)
  }

  const handleCreateNewSector = (newSectorData: Partial<SectorPolygon>) => {
    // Guardar los datos del sector y activar modo dibujo
    setPendingSectorData(newSectorData)
    setIsNewSectorModalOpen(false)
    setIsDrawingMode(true)
  }

  const handleDrawingComplete = (path: { lat: number; lng: number }[]) => {
    if (!pendingSectorData) return;

    // Si el pendingSectorData ya tiene id, es un redibujo, si no, es uno nuevo
    let newSector: SectorPolygon;
    if (pendingSectorData.id) {
      newSector = {
        ...pendingSectorData,
        path: [...path, path[0]], // Cerrar el polígono
      };
      setSectors((prevSectors) => prevSectors.map(s => s.id === newSector.id ? newSector : s));
      showSectorUpdated(newSector.name);
    } else {
      const newId = String(Date.now());
      newSector = {
        ...pendingSectorData,
        id: newId,
        path: [...path, path[0]], // Cerrar el polígono
      };
      setSectors((prevSectors) => [...prevSectors, newSector]);
      showSectorCreated(newSector.name);
    }
    setPendingSectorData(null);
    setIsDrawingMode(false);
  };

  const filteredSectors = useMemo(() => {
    return sectors.filter((s) => {
      const typeOk = (s.type === "Poda" && typeFilters.poda) || (s.type === "Corte de pasto" && typeFilters.cortePasto)
      const statusOk = (s.status === "pendiente" && statusFilters.pendiente) || (s.status === "en proceso" && statusFilters.enProceso) || (s.status === "completado" && statusFilters.completado)
      return typeOk && statusOk
    })
  }, [sectors, typeFilters, statusFilters])

  return (
    <div className="flex flex-col">
      <div className="w-full max-w-5xl mx-auto p-6">
        <MapInteractiveComponent 
          sectors={filteredSectors}
          onPolygonClick={handlePolygonClick}
          isDrawingMode={isDrawingMode}
          onDrawingComplete={handleDrawingComplete}
        />
        <MapLegendDisplay />
      </div>
      <ToolsFab onOpenTools={() => setIsToolsPanelOpen(true)} />
      <ToolsPanelSheet
        isOpen={isToolsPanelOpen}
        onOpenChange={setIsToolsPanelOpen}
        onNewSector={handleOpenNewSectorForm}
        onApplyFilters={({ types, status }) => {
          setTypeFilters(types)
          setStatusFilters(status)
        }}
        initialFilters={{ types: typeFilters, status: statusFilters }}
      />
      {selectedSector && (
        <SectorDetailsDialog
          isOpen={!!selectedSector}
          onOpenChange={() => setSelectedSector(null)}
          sector={selectedSector}
          onRedrawSector={(sector) => {
            setSelectedSector(null);
            setPendingSectorData(sector);
            setIsDrawingMode(true);
          }}
          onSave={(updated) => {
            setSectors((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
            setSelectedSector(null)
          }}
        />
      )}
      <NewSectorFormDialog
        isOpen={isNewSectorModalOpen}
        onOpenChange={setIsNewSectorModalOpen}
        onSubmit={handleCreateNewSector}
      />
    </div>
  )
}
