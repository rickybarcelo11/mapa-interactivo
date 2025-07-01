"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import MapInteractive from "@/components/home/map-interactive"
import ToolsFab from "@/components/home/tools-fab"
import ToolsPanelSheet from "@/components/home/tools-panel-sheet"
import MapLegendDisplay from "@/components/home/map-legend-display"
import SectorDetailsDialog from "@/components/home/sector-details-dialog"
import NewSectorFormDialog from "@/components/home/new-sector-form-dialog"
import type { SectorPolygon, SectorStatus, SectorType } from "@/src/types"

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
  const [pendingSectorData, setPendingSectorData] = useState<any>(null)

  const handlePolygonClick = (sector: SectorPolygon) => {
    setSelectedSector(sector)
  }

  const handleOpenNewSectorForm = () => {
    setIsNewSectorModalOpen(true)
  }

  const handleCreateNewSector = (newSectorData: any) => {
    // Guardar los datos del sector y activar modo dibujo
    setPendingSectorData(newSectorData)
    setIsNewSectorModalOpen(false)
    setIsDrawingMode(true)
  }

  const handleDrawingComplete = (path: { lat: number; lng: number }[]) => {
    if (!pendingSectorData) return

    const newId = String(Date.now())
    const newSector: SectorPolygon = {
      ...pendingSectorData,
      id: newId,
      path: [...path, path[0]], // Cerrar el polígono
    }
    
    setSectors((prevSectors) => [...prevSectors, newSector])
    setPendingSectorData(null)
    setIsDrawingMode(false)
    
    alert(`Sector "${newSector.name}" creado exitosamente!`)
  }

  return (
    <div className="relative h-screen flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl flex flex-col items-center mt-8 mb-8">
        <MapInteractiveComponent 
          sectors={sectors}
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
      />
      {selectedSector && (
        <SectorDetailsDialog
          isOpen={!!selectedSector}
          onOpenChange={() => setSelectedSector(null)}
          sector={selectedSector}
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
