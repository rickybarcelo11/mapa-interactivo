"use client"

import { Button } from "@/components/ui/button"

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-slate-900 text-slate-50">
          <h1 className="text-3xl font-bold">Ha ocurrido un error inesperado</h1>
          <p className="text-slate-300 mt-2 max-w-xl">{error?.message || "Intenta recargar la página."}</p>
          <div className="mt-6 flex gap-3">
            <Button onClick={() => reset()} className="bg-sky-600 hover:bg-sky-500">Reintentar</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/")} className="border-slate-600 text-slate-300 hover:bg-slate-700">Ir al inicio</Button>
          </div>
        </div>
      </body>
    </html>
  )
}
