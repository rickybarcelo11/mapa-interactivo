"use client"

import { useState, useMemo, useEffect } from "react"
import dynamic from "next/dynamic"
import MapInteractive from "@/components/home/map-interactive"
import ToolsFab from "@/components/home/tools-fab"
import ToolsPanelSheet from "@/components/home/tools-panel-sheet"
import MapLegendDisplay from "@/components/home/map-legend-display"
import SectorDetailsDialog from "@/components/home/sector-details-dialog"
import NewSectorFormDialog from "@/components/home/new-sector-form-dialog"
import type { SectorPolygon, SectorStatus, SectorType } from "@/src/types"
import { useNotifications } from "@/src/hooks"
import { useSectorsStore } from "@/src/stores/sectors-store"

const MapInteractiveComponent = dynamic(() => import("@/components/home/map-interactive"), { ssr: false })

// Los sectores vienen del store (API real)

export default function HomeView() {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false)
  const [selectedSector, setSelectedSector] = useState<SectorPolygon | null>(null)
  const [isNewSectorModalOpen, setIsNewSectorModalOpen] = useState(false)
  const sectors = useSectorsStore((s) => s.sectors)
  const initializeSectors = useSectorsStore((s) => s.initializeSectors)
  const updateSector = useSectorsStore((s) => s.updateSector)
  const addSector = useSectorsStore((s) => s.addSector)
  const [isDrawingMode, setIsDrawingMode] = useState(false)
  const [pendingSectorData, setPendingSectorData] = useState<Partial<SectorPolygon> | null>(null)
  const [typeFilters, setTypeFilters] = useState({ poda: true, cortePasto: true })
  const [statusFilters, setStatusFilters] = useState({ pendiente: true, enProceso: true, completado: true })
  const { showSectorCreated, showSectorUpdated } = useNotifications()

  useEffect(() => {
    initializeSectors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
    if (!pendingSectorData) return
    const closedPath = [...path, path[0]]
    if (pendingSectorData.id) {
      updateSector({ id: pendingSectorData.id, path: closedPath } as Partial<SectorPolygon> & { id: string })
      showSectorUpdated(pendingSectorData.name || 'Sector')
    } else {
      addSector({
        name: pendingSectorData.name!,
        type: pendingSectorData.type as SectorType,
        status: pendingSectorData.status as SectorStatus,
        direccion: pendingSectorData.direccion,
        observaciones: pendingSectorData.observaciones,
        path: closedPath,
      } as Omit<SectorPolygon, 'id'>)
      showSectorCreated(pendingSectorData.name || 'Sector')
    }
    setPendingSectorData(null)
    setIsDrawingMode(false)
  }

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
            updateSector(updated)
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
