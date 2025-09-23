"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useNotifications } from "@/src/hooks"

interface ImportPreviewModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onImported?: () => void
}

export default function ImportPreviewModal({ isOpen, onOpenChange, onImported }: ImportPreviewModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rows, setRows] = useState<Array<{ species: string; streetName: string; streetNumber: string; status: string; sidewalk: string; observations: string }>>([])
  const [suggestions, setSuggestions] = useState<Array<{ canonical: string; variants: string[]; details?: Array<{ name: string; count: number; score: number }> }>>([])
  const [duplicates, setDuplicates] = useState<Array<{ streetName: string; streetNumber: string; species: string; sidewalk: string; count: number }>>([])
  const [invalids, setInvalids] = useState<Array<{ row: number; reason: string }>>([])
  const { showError, showSuccess, showInfo } = useNotifications()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
  }

  const analyzeFile = async () => {
    if (!file) {
      showError("Seleccioná un archivo .xlsx o .xls")
      return
    }
    try {
      setIsAnalyzing(true)
      const fd = new FormData()
      fd.set("file", file)
      const res = await fetch("/api/trees/preview", { method: "POST", body: fd })
      if (!res.ok) throw new Error("No se pudo analizar el archivo")
      const data = await res.json()
      setRows(data.rows || [])
      setSuggestions(data.suggestions || [])
      setDuplicates(data.duplicates || [])
      setInvalids(data.invalids || [])
      if ((data.rows || []).length === 0) showInfo("No hay filas válidas para importar")
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error inesperado al analizar")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const applyUnifications = () => {
    if (!suggestions || suggestions.length === 0) return
    const map = new Map<string, string>()
    suggestions.forEach((s) => s.variants.forEach((v) => map.set(v, s.canonical)))
    setRows((prev) => prev.map((r) => ({ ...r, streetName: map.get(r.streetName) || r.streetName })))
    // Recalcular métricas luego de la unificación
    const unified = rows.map((r) => ({ ...r, streetName: map.get(r.streetName) || r.streetName }))
    const dupMap = new Map<string, number>()
    for (const r of unified) {
      const key = `${r.streetName}|${r.streetNumber}|${r.species}|${r.sidewalk || ''}`
      dupMap.set(key, (dupMap.get(key) || 0) + 1)
    }
    setDuplicates(Array.from(dupMap.entries()).filter(([_, c]) => c > 1).map(([key, count]) => {
      const [streetName, streetNumber, species, sidewalk] = key.split('|')
      return { streetName, streetNumber, species, sidewalk, count }
    }))
    showInfo("Se aplicaron las unificaciones de calle")
  }

  const dedupePreview = () => {
    const seen = new Set<string>()
    const unique: typeof rows = []
    for (const r of rows) {
      const key = `${r.streetName.trim().toLowerCase()}|${r.streetNumber.trim()}|${r.species.trim().toLowerCase()}|${r.sidewalk || ''}`
      if (seen.has(key)) continue
      seen.add(key)
      unique.push(r)
    }
    setRows(unique)
    setDuplicates([])
    showInfo("Se removieron duplicados en la previsualización")
  }

  const handleImport = async () => {
    if (!file) {
      showError("Seleccioná un archivo .xlsx o .xls")
      return
    }
    try {
      setIsSubmitting(true)
      let res: Response
      if (rows.length > 0) {
        res = await fetch("/api/trees", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ rows }) })
      } else {
        const fd = new FormData()
        fd.set("file", file)
        res = await fetch("/api/trees", { method: "POST", body: fd })
      }
      if (!res.ok) throw new Error("No se pudo importar el archivo")
      const data = await res.json()
      const created = data.created ?? 0
      const skipped = data.skipped ?? 0
      const duplicates = data.duplicateSkipped ?? 0
      showSuccess(`Importación completa: ${created} creados, ${duplicates} duplicados, ${skipped} saltados`)
      if (onImported) onImported()
      onOpenChange(false)
      setRows([])
      setSuggestions([])
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error inesperado al importar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-sky-400">Previsualizar importación de árboles</DialogTitle>
          <DialogDescription className="text-slate-400">
            Subí un archivo .xlsx/.xls, previsualizá, unificá calles y quitá duplicados antes de importar.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-50 hover:file:bg-slate-600"
          />
          {rows.length === 0 ? (
            <div className="flex items-center justify-between rounded-md border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Analizá el archivo para ver la previsualización y sugerencias.</p>
              <Button onClick={analyzeFile} disabled={!file || isAnalyzing} className="bg-slate-700 hover:bg-slate-600">
                {isAnalyzing ? "Analizando…" : "Analizar"}
              </Button>
            </div>
          ) : (
            <div className="space-y-3 rounded-md border border-slate-700 p-3">
              <div className="text-sm text-slate-300 flex flex-wrap gap-4">
                <span>Filas válidas: <span className="text-sky-400 font-semibold">{rows.length}</span></span>
                <span>Calles detectadas: <span className="text-sky-400 font-semibold">{new Set(rows.map(r => r.streetName)).size}</span></span>
                <span>Duplicados exactos: <span className="text-sky-400 font-semibold">{duplicates.length}</span></span>
                <span>Filas inválidas: <span className="text-yellow-400 font-semibold">{invalids.length}</span></span>
              </div>
              {suggestions.length > 0 && (
                <div className="text-xs text-slate-300">
                  <p className="mb-2">Sugerencias de unificación de calles:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {suggestions.map((s, idx) => (
                      <li key={idx}>
                        <span className="text-slate-400">{s.variants.join(', ')}</span>
                        {" "}→{" "}
                        <span className="text-sky-400">{s.canonical}</span>
                        {s.details && s.details.length > 0 && (
                          <span className="ml-2 text-slate-500">(
                            {s.details.map((d, i) => (
                              <span key={i}>{d.name}: {d.count} [{Math.round(d.score*100)}%]{i < s.details!.length-1 ? ', ' : ''}</span>
                            ))}
                          )</span>
                        )}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2">
                    <Button variant="outline" onClick={applyUnifications} className="border-slate-600 text-slate-300 hover:bg-slate-700">Aplicar unificaciones</Button>
                    <Button variant="outline" onClick={dedupePreview} className="ml-2 border-slate-600 text-slate-300 hover:bg-slate-700">Quitar duplicados</Button>
                  </div>
                </div>
              )}
              {duplicates.length > 0 && (
                <div className="text-xs text-slate-300">
                  <p className="mt-3 mb-1">Top duplicados:</p>
                  <ul className="list-disc pl-5 space-y-1 max-h-24 overflow-auto">
                    {duplicates.slice(0, 20).map((d, i) => (
                      <li key={i}>{d.streetName} {d.streetNumber} — {d.species} ({d.sidewalk || '—'}): x{d.count}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="max-h-64 overflow-auto text-xs">
                <table className="w-full">
                  <thead>
                    <tr className="text-slate-400">
                      <th className="text-left pr-2">Especie</th>
                      <th className="text-left pr-2">Calle</th>
                      <th className="text-left pr-2">Altura</th>
                      <th className="text-left pr-2">Vereda</th>
                      <th className="text-left pr-2">Estado</th>
                      <th className="text-left pr-2">Obs.</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 100).map((r, i) => (
                      <tr key={i} className="border-b border-slate-700">
                        <td className="pr-2 py-1">{r.species}</td>
                        <td className="pr-2 py-1">{r.streetName}</td>
                        <td className="pr-2 py-1">{r.streetNumber}</td>
                        <td className="pr-2 py-1">{r.sidewalk || '—'}</td>
                        <td className="pr-2 py-1">{r.status || '—'}</td>
                        <td className="pr-2 py-1">{r.observations || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || isSubmitting} className="bg-sky-500 hover:bg-sky-600">
            {isSubmitting ? "Importando…" : "Importar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
