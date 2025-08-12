"use client"

import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"
import { useNotifications } from "@/src/hooks"

const containerStyle = {
  width: "100%",
  height: "600px",
  background: "#fff"
}

const center = {
  lat: -31.4491197637593, 
  lng: -60.93034489351039,
}


export default function GoogleMapComponent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    // Puedes agregar otras librerías aquí si las necesitas (ej: libraries: ["places"])
  })

  // Nota: En producción, no deberías hacer console.log de API keys
  // console.log("API KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

  if (!isLoaded) return <div className="flex items-center justify-center h-full">Cargando mapa...</div>

  return (
    <div className="flex-grow rounded-lg shadow-xl relative overflow-hidden">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={14}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
        }}
      >
        <Marker position={center} />
      </GoogleMap>
    </div>
  )
} 