"use client"

import { useState, useEffect, useRef, Fragment, useCallback, useMemo, memo } from "react"
import { MapContainer, TileLayer, Polygon, useMap, useMapEvents, Marker, Polyline, Tooltip } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { SectorPolygon } from "@/src/types"

interface MapInteractiveProps {
  sectors: SectorPolygon[]
  onPolygonClick: (sector: SectorPolygon) => void
  isDrawingMode?: boolean
  onDrawingComplete?: (path: { lat: number; lng: number }[]) => void
}

// Helper para convertir lat/lng a [lat, lng] para Leaflet
const toLatLngArray = (path: { lat: number; lng: number }[]) =>
  path.map((p) => [p.lat, p.lng] as [number, number])

// Componente para manejar el dibujo
const DrawingHandler = memo(({ isDrawingMode, onDrawingComplete }: { 
  isDrawingMode: boolean; 
  onDrawingComplete: (path: { lat: number; lng: number }[]) => void 
}) => {
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([])
  const map = useMap()

  const handleMapClick = useCallback((e: { latlng: { lat: number; lng: number } }) => {
    if (!isDrawingMode) return
    
    const { lat, lng } = e.latlng
    setDrawingPoints(prev => [...prev, [lat, lng]])
  }, [isDrawingMode])

  useMapEvents({
    click: handleMapClick,
  })

  // Limpiar puntos cuando se desactiva el modo dibujo
  useEffect(() => {
    if (!isDrawingMode) {
      setDrawingPoints([])
    }
  }, [isDrawingMode])

  // Cuando hay suficientes puntos, completar el dibujo
  useEffect(() => {
    if (drawingPoints.length >= 3 && isDrawingMode) {
      const path = drawingPoints.map(([lat, lng]) => ({ lat, lng }))
      onDrawingComplete(path)
      setDrawingPoints([])
    }
  }, [drawingPoints, isDrawingMode, onDrawingComplete])

  // Solo crea el icono si estamos en el cliente
  const getMarkerIcon = useCallback(() => {
    if (typeof window === "undefined") return undefined;
    // Usar require para evitar SSR
    const L = require("leaflet");
    return L.divIcon({
      className: 'drawing-point-marker',
      html: `<div style="
        width: 12px; 
        height: 12px; 
        background-color: #3b82f6; 
        border: 2px solid white; 
        border-radius: 50%; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });
  }, []);

  const memoizedDrawingPoints = useMemo(() => drawingPoints, [drawingPoints])

  return (
    <>
      {/* Marcadores de los puntos dibujados */}
      {memoizedDrawingPoints.map((point, index) => (
        <Marker
          key={`drawing-point-${index}`}
          position={point}
          icon={getMarkerIcon()}
        />
      ))}
      
      {/* Línea que conecta los puntos */}
      {memoizedDrawingPoints.length > 1 && (
        <Polyline
          positions={memoizedDrawingPoints}
          pathOptions={{
            color: '#3b82f6',
            weight: 3,
            opacity: 0.8,
            dashArray: '5, 5'
          }}
        />
      )}
    </>
  )
})

DrawingHandler.displayName = "DrawingHandler"

// Componente memoizado para el polígono de sector
const SectorPolygon = memo(({ 
  sector, 
  onPolygonClick 
}: { 
  sector: SectorPolygon; 
  onPolygonClick: (sector: SectorPolygon) => void 
}) => {
  const handleClick = useCallback(() => {
    onPolygonClick(sector)
  }, [sector, onPolygonClick])

  const positions = useMemo(() => toLatLngArray(sector.path), [sector.path])
  
  const pathOptions = useMemo(() => ({
    color:
      sector.status === "pendiente"
        ? "#ef4444"
        : sector.status === "en proceso"
        ? "#eab308"
        : "#22c55e",
    fillOpacity: 0.5,
  }), [sector.status])

  return (
    <Fragment key={sector.id}>
      <Polygon
        positions={positions}
        pathOptions={pathOptions}
        eventHandlers={{
          click: handleClick,
        }}
      >
        {/* Etiqueta en hover: se muestra al pasar el mouse por el polígono */}
        <Tooltip direction="top" offset={[0, -8]} opacity={1} sticky>
          <span className="bg-slate-800/80 text-white border border-slate-600 rounded-md px-2 py-1 text-[10px] font-semibold uppercase">
            {sector.name}
          </span>
        </Tooltip>
      </Polygon>
    </Fragment>
  )
})

SectorPolygon.displayName = "SectorPolygon"

function MapInteractive({ 
  sectors, 
  onPolygonClick, 
  isDrawingMode = false,
  onDrawingComplete 
}: MapInteractiveProps) {
  // Centro y zoom inicial (Esperanza, Santa Fe)
  const center: [number, number] = [-31.4487, -60.9317]
  const zoom = 15

  // Estado para puntos de dibujo y control de botón
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([])
  const [showFinishButton, setShowFinishButton] = useState(false)
  const mapRef = useRef<import('leaflet').Map | null>(null)

  // Si está en modo dibujo, usar DrawingHandler extendido
  useEffect(() => {
    if (!isDrawingMode) setDrawingPoints([])
  }, [isDrawingMode])

  const handleMapClick = useCallback((e: { latlng: { lat: number; lng: number } }) => {
    if (!isDrawingMode) return;
    const { lat, lng } = e.latlng;
    setDrawingPoints((prev) => [...prev, [lat, lng]]);
    setShowFinishButton(true);
  }, [isDrawingMode]);

  // Agregar y limpiar el evento de click al mapa solo en modo dibujo
  useEffect(() => {
    const map = mapRef.current;
    if (isDrawingMode && map) {
      map.on('click', handleMapClick);
      return () => {
        map.off('click', handleMapClick);
      };
    }
  }, [isDrawingMode, handleMapClick]);

  const handleFinishDrawing = useCallback(() => {
    if (drawingPoints.length >= 3 && onDrawingComplete) {
      const path = drawingPoints.map(([lat, lng]) => ({ lat, lng }));
      onDrawingComplete(path);
      setDrawingPoints([]);
      setShowFinishButton(false);
    }
  }, [drawingPoints, onDrawingComplete]);

  const memoizedSectors = useMemo(() => sectors, [sectors])

  return (
    <div className="flex-grow rounded-lg shadow-xl relative overflow-hidden" style={{ height: 770, width: '100%' }}>
      {isDrawingMode && (
        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">Modo Dibujo Activo</p>
          <p className="text-xs">Haz clic en el mapa para dibujar el polígono del sector</p>
          <p className="text-xs mt-1">Haz clic para agregar puntos. Cuando termines, haz clic en 'Finalizar dibujo'.</p>
          {showFinishButton && drawingPoints.length >= 3 && (
            <button
              className="mt-2 px-3 py-1 bg-green-500 rounded hover:bg-green-600 text-white text-xs font-semibold shadow"
              onClick={handleFinishDrawing}
            >
              Finalizar dibujo
            </button>
          )}
        </div>
      )}
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: "100%", height: "100%" }} 
        className="absolute inset-0 z-0"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {memoizedSectors.map((sector) => (
          <SectorPolygon
            key={sector.id}
            sector={sector}
            onPolygonClick={onPolygonClick}
          />
        ))}
        {/* Dibujo en curso */}
        {isDrawingMode && drawingPoints.length > 0 && (
          <>
            {/* Línea que conecta los puntos */}
            <Polyline
              positions={drawingPoints}
              pathOptions={{
                color: '#3b82f6',
                weight: 3,
                opacity: 0.8,
                dashArray: '5, 5'
              }}
            />
            {/* Marcadores de los puntos dibujados */}
            {drawingPoints.map((point, index) => {
              const getMarkerIcon = () => {
                if (typeof window === "undefined") return undefined;
                const L = require("leaflet");
                return L.divIcon({
                  className: 'drawing-point-marker',
                  html: `<div style="
                    width: 12px; 
                    height: 12px; 
                    background-color: #3b82f6; 
                    border: 2px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  "></div>`,
                  iconSize: [12, 12],
                  iconAnchor: [6, 6]
                });
              };
              return (
                <Marker
                  key={`drawing-point-${index}`}
                  position={point}
                  icon={getMarkerIcon()}
                />
              );
            })}
          </>
        )}
      </MapContainer>
    </div>
  )
}

export default memo(MapInteractive) 