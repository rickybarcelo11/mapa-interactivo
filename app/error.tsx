"use client"

import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl font-semibold text-slate-100">Ocurrió un error</h1>
      <p className="text-slate-400 mt-2 max-w-xl">{error?.message || "Algo salió mal al cargar esta sección."}</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()} className="bg-sky-600 hover:bg-sky-500">Reintentar</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/")} className="border-slate-600 text-slate-300 hover:bg-slate-700">Ir al inicio</Button>
      </div>
    </div>
  )
}
