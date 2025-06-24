"use client"

import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api"

const containerStyle = {
  width: "100%",
  height: "600px",
  background: "#fff"
}

const center = {
  lat: -34.6037, // Buenos Aires de ejemplo
  lng: -58.3816,
}

export default function GoogleMapComponent() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    // Puedes agregar otras librerías aquí si las necesitas (ej: libraries: ["places"])
  })

  console.log("API KEY:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)

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