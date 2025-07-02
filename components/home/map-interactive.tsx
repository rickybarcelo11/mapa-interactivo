"use client"

import { useState, useEffect, useRef, Fragment } from "react"
import { MapContainer, TileLayer, Polygon, useMap, useMapEvents, Marker, Polyline } from "react-leaflet"
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
function DrawingHandler({ isDrawingMode, onDrawingComplete }: { 
  isDrawingMode: boolean; 
  onDrawingComplete: (path: { lat: number; lng: number }[]) => void 
}) {
  const [drawingPoints, setDrawingPoints] = useState<[number, number][]>([])
  const map = useMap()

  useMapEvents({
    click: (e) => {
      if (!isDrawingMode) return
      
      const { lat, lng } = e.latlng
      setDrawingPoints(prev => [...prev, [lat, lng]])
    },
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
  const getMarkerIcon = () => {
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
  };

  return (
    <>
      {/* Marcadores de los puntos dibujados */}
      {drawingPoints.map((point, index) => (
        <Marker
          key={`drawing-point-${index}`}
          position={point}
          icon={getMarkerIcon()}
        />
      ))}
      
      {/* Línea que conecta los puntos */}
      {drawingPoints.length > 1 && (
        <Polyline
          positions={drawingPoints}
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
}

// Calcula el centroide de un polígono
function getPolygonCentroid(path: { lat: number; lng: number }[]): [number, number] {
  let x = 0, y = 0, n = path.length;
  for (let i = 0; i < n; i++) {
    x += path[i].lat;
    y += path[i].lng;
  }
  return [x / n, y / n];
}

export default function MapInteractive({ 
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
  const mapRef = useRef<any>(null)

  // Si está en modo dibujo, usar DrawingHandler extendido
  useEffect(() => {
    if (!isDrawingMode) setDrawingPoints([])
  }, [isDrawingMode])

  const handleMapClick = (e: any) => {
    if (!isDrawingMode) return;
    const { lat, lng } = e.latlng;
    setDrawingPoints((prev) => [...prev, [lat, lng]]);
    setShowFinishButton(true);
  };

  // Agregar y limpiar el evento de click al mapa solo en modo dibujo
  useEffect(() => {
    const map = mapRef.current;
    if (isDrawingMode && map) {
      map.on('click', handleMapClick);
      return () => {
        map.off('click', handleMapClick);
      };
    }
  }, [isDrawingMode]);

  const handleFinishDrawing = () => {
    if (drawingPoints.length >= 3 && onDrawingComplete) {
      const path = drawingPoints.map(([lat, lng]) => ({ lat, lng }));
      onDrawingComplete(path);
      setDrawingPoints([]);
      setShowFinishButton(false);
    }
  };

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
        {sectors.map((sector) => (
          <Fragment key={sector.id}>
            <Polygon
              positions={toLatLngArray(sector.path)}
              pathOptions={{
                color:
                  sector.status === "pendiente"
                    ? "#ef4444"
                    : sector.status === "en proceso"
                    ? "#eab308"
                    : "#22c55e",
                fillOpacity: 0.5,
              }}
              eventHandlers={{
                click: () => onPolygonClick(sector),
              }}
            />
            {/* Nombre del sector centrado */}
            <Marker
              key={sector.id + "-label"}
              position={getPolygonCentroid(sector.path)}
              icon={(() => {
                if (typeof window === "undefined") return undefined;
                const L = require("leaflet");
                return L.divIcon({
                  className: 'sector-label-marker',
                  html: `<div style="
                    background: rgba(30,41,59,0.85);
                    color: #fff;
                    font-size: 0.95rem;
                    font-weight: 600;
                    padding: 2px 10px;
                    border-radius: 6px;
                    text-align: center;
                    text-transform: uppercase;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                    pointer-events: none;
                  ">${sector.name}</div>`,
                  iconSize: [120, 28],
                  iconAnchor: [60, 14],
                });
              })()}
              interactive={false}
            />
          </Fragment>
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

// Nota: Si usas Next.js, asegúrate de que este componente solo se renderice en el cliente (ya está con "use client").
// Si necesitas ajustar la proyección de coordenadas, puedes hacerlo en toLatLngArray o usando una librería como proj4. 