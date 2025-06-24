"use client"

import { useState } from "react"
import GoogleMapComponent from "@/components/home/google-map"
import ToolsFab from "@/components/home/tools-fab"
import ToolsPanelSheet from "@/components/home/tools-panel-sheet"
import MapLegendDisplay from "@/components/home/map-legend-display"
import SectorDetailsDialog from "@/components/home/sector-details-dialog"
import NewSectorFormDialog from "@/components/home/new-sector-form-dialog"

const sampleSectors = [
  {
    id: "1",
    name: "Sector Centro",
    status: "pendiente",
    type: "Poda",
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
    status: "en proceso",
    type: "Corte de pasto",
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
    status: "completado",
    type: "Poda",
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
  const [selectedSector, setSelectedSector] = useState(null)
  const [isNewSectorModalOpen, setIsNewSectorModalOpen] = useState(false)
  const [sectors, setSectors] = useState(sampleSectors)

  const handlePolygonClick = (sector: any) => {
    setSelectedSector(sector)
  }

  const handleOpenNewSectorForm = () => {
    setIsNewSectorModalOpen(true)
  }

  const handleCreateNewSector = (newSectorData: any) => {
    const newId = String(Date.now())
    // Simulación de path para el nuevo sector. En la app real, esto vendría del dibujo del usuario.
    const newPath = [
      { lng: -58.385 + (Math.random() - 0.5) * 0.01, lat: -34.605 + (Math.random() - 0.5) * 0.01 },
      { lng: -58.384 + (Math.random() - 0.5) * 0.01, lat: -34.606 + (Math.random() - 0.5) * 0.01 },
      { lng: -58.386 + (Math.random() - 0.5) * 0.01, lat: -34.607 + (Math.random() - 0.5) * 0.01 },
      { lng: -58.387 + (Math.random() - 0.5) * 0.01, lat: -34.6055 + (Math.random() - 0.5) * 0.01 },
    ]
    const newSector = {
      ...newSectorData,
      id: newId,
      path: [...newPath, newPath[0]], // Cerrar el polígono
    }
    setSectors((prevSectors) => [...prevSectors, newSector])
    setIsNewSectorModalOpen(false)
    alert(`Sector "${newSector.name}" creado (simulado). Deberías poder dibujarlo en el mapa.`)
  }

  return (
    <div className="relative h-[calc(100vh-120px)] flex flex-col">
      <GoogleMapComponent />
      <MapLegendDisplay />
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
