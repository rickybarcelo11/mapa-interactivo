import type { SectorPolygon } from "@/types"

export const sectorsData: SectorPolygon[] = [
  {
    id: "1",
    name: "Sector Alpha",
    type: "Poda",
    direccion: "Calle Falsa 123",
    status: "pendiente",
    observaciones: "Requiere atención urgente. Árboles muy altos.",
    path: [
      { lng: -58.3816, lat: -34.6037 },
      { lng: -58.38, lat: -34.603 },
      { lng: -58.3805, lat: -34.605 },
      { lng: -58.382, lat: -34.6045 },
      { lng: -58.3816, lat: -34.6037 },
    ],
  },
  {
    id: "2",
    name: "Sector Beta",
    type: "Corte de pasto",
    direccion: "Avenida Siempreviva 742",
    status: "en proceso",
    observaciones: "Pasto crecido en la plaza principal.",
    path: [
      { lng: -58.3916, lat: -34.5937 },
      { lng: -58.39, lat: -34.593 },
      { lng: -58.39, lat: -34.595 },
      { lng: -58.392, lat: -34.5955 },
      { lng: -58.3925, lat: -34.594 },
      { lng: -58.3916, lat: -34.5937 },
    ],
  },
  // ... (incluir el resto de los 15 sectores de ejemplo)
  {
    id: "15",
    name: "Sector Omicron",
    type: "Poda",
    direccion: "Varios",
    status: "en proceso",
    observaciones: "Campaña de vacunación de mascotas.",
    path: [
      { lng: -58.3716, lat: -34.6137 },
      { lng: -58.37, lat: -34.614 },
      { lng: -58.37, lat: -34.6155 },
      { lng: -58.372, lat: -34.615 },
      { lng: -58.3716, lat: -34.6137 },
    ],
  },
]
