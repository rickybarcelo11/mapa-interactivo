"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useNotifications } from "@/src/hooks"

interface ImportTreesModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onImported?: () => void
}

export default function ImportTreesModal({ isOpen, onOpenChange, onImported }: ImportTreesModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [replaceAll, setReplaceAll] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showError, showSuccess, showInfo } = useNotifications()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files && e.target.files[0] ? e.target.files[0] : null)
  }

  const handleImport = async () => {
    if (!file) {
      showError("Seleccioná un archivo .xlsx o .xls")
      return
    }
    try {
      setIsSubmitting(true)
      const fd = new FormData()
      fd.set("file", file)
      if (replaceAll) fd.set("replaceAll", "1")
      const res = await fetch("/api/trees", { method: "POST", body: fd })
      if (!res.ok) throw new Error("No se pudo importar el archivo")
      const data = await res.json()
      const created = data.created ?? 0
      const skipped = data.skipped ?? 0
      const duplicates = data.duplicateSkipped ?? 0
      showSuccess(`Importación completa: ${created} creados, ${duplicates} duplicados, ${skipped} saltados`)
      if (onImported) onImported()
      onOpenChange(false)
    } catch (e) {
      showError(e instanceof Error ? e.message : "Error inesperado al importar")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sky-400">Importar árboles desde Excel</DialogTitle>
          <DialogDescription className="text-slate-400">
            Subí un archivo .xlsx/.xls con las columnas: Calle, Vereda, Altura, Especie, Estado, Observacion.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-200 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-slate-50 hover:file:bg-slate-600"
          />
          <div className="flex items-center justify-between rounded-md border border-slate-700 p-3">
            <div>
              <p className="text-sm text-slate-200">Reemplazar todo</p>
              <p className="text-xs text-slate-400">Borra todo y carga en una transacción (más rápido y consistente).</p>
            </div>
            <Switch checked={replaceAll} onCheckedChange={setReplaceAll} />
          </div>
          <p className="text-xs text-slate-400">
            Consejo: si el archivo es grande, no cierres esta ventana hasta que termine. Al finalizar se mostrará un resumen y se recargará la vista.
          </p>
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


