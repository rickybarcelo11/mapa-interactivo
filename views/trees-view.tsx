"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Upload, Download } from "lucide-react"
import StreetSectionView from "@/components/trees/street-section-view"
import IndividualTreeView from "@/components/trees/individual-tree-view"
import AddTreeModal from "@/components/trees/add-tree-modal"
import ImportTreesModal from "@/components/trees/import-trees-modal"
import ImportPreviewModal from "@/components/trees/import-preview-modal"
import type { TreeSection, StreetWithSections, IndividualTree } from "@/src/types"
import { useNotifications } from "@/src/hooks"

// Datos desde API

export default function TreesView() {
  const [streets, setStreets] = useState<StreetWithSections[]>([])
  const [individualTrees, setIndividualTrees] = useState<IndividualTree[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const { showTreeCreated, showSimulatedFeature } = useNotifications()

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/trees', { cache: 'no-store' })
      const data = await res.json()
      setIndividualTrees(data.trees)
      // Derivar tramos por cuadra (rangos de 100) a partir de los árboles importados
      const trees: IndividualTree[] = data.trees || []
      const streetMap = new Map<string, StreetWithSections>()
      const toRange = (nStr: string) => {
        const digits = (nStr?.match(/\d+/g)?.join('') || '0')
        const n = Math.max(0, parseInt(digits, 10) || 0)
        const start = Math.floor(n / 100) * 100
        const end = start + 99
        return `${start}–${end}`
      }
      const toGeneral = (status: string): 'Bueno' | 'Regular' | 'Malo' | 'Necesita Intervención' => {
        const s = (status || '').toLowerCase()
        if (s === 'sano') return 'Bueno'
        if (s === 'recién plantado' || s === 'recien plantado') return 'Regular'
        if (s === 'necesita poda') return 'Necesita Intervención'
        if (s === 'seco' || s === 'malo' || s === 'enfermo') return 'Malo'
        return 'Bueno'
      }
      const speciesMode = (values: string[]) => {
        const counts = new Map<string, number>()
        for (const v of values) counts.set(v, (counts.get(v) || 0) + 1)
        let best = ''
        let max = -1
        counts.forEach((c, k) => { if (c > max) { max = c; best = k } })
        return best
      }
      // Acumular por calle + rango
      const acc = new Map<string, { bySide: Record<string, number>; species: string[]; general: string[] }>()
      for (const t of trees) {
        const street = t.streetName
        const range = toRange(t.streetNumber)
        const key = `${street}__${range}`
        if (!acc.has(key)) acc.set(key, { bySide: {}, species: [], general: [] })
        const bucket = acc.get(key)!
        const side = (t.sidewalk || 'Ambas') as string
        bucket.bySide[side] = (bucket.bySide[side] || 0) + 1
        bucket.species.push(t.species)
        bucket.general.push(toGeneral(t.status))
      }
      // Convertir a StreetWithSections
      acc.forEach((bucket, key) => {
        const [streetName, addressRange] = key.split('__')
        if (!streetMap.has(streetName)) streetMap.set(streetName, { id: `street-${streetName}`, name: streetName, sections: [] })
        const predominantSpecies = speciesMode(bucket.species) || '—'
        const generalStatus = speciesMode(bucket.general) as any || 'Bueno'
        // Crear una sección por lado existente para que la vista consolide por N/S o E/W
        const sectionSides: Array<'Norte'|'Sur'|'Este'|'Oeste'|'Ambas'> = ['Norte','Sur','Este','Oeste','Ambas']
        for (const side of sectionSides) {
          const count = bucket.bySide[side] || 0
          if (count > 0) {
            streetMap.get(streetName)!.sections.push({
              id: `${streetName}-${addressRange}-${side}`,
              addressRange,
              sidewalkSide: side as any,
              predominantSpecies,
              treeCount: count,
              generalStatus,
            } as unknown as TreeSection)
          }
        }
      })
      setStreets(Array.from(streetMap.values()))
    }
    load().catch(console.error)
  }, [])

  const handleAddTree = (treeData: Omit<IndividualTree, "id">) => {
    const newTree: IndividualTree = {
      ...treeData,
      id: `tree${Date.now()}`, // Simple ID
    }
    setIndividualTrees((prev) => [...prev, newTree])
    // Aquí también podrías actualizar los conteos en la vista por tramos si corresponde
    showTreeCreated(newTree.species, `${newTree.streetName} ${newTree.streetNumber}`)
    setIsAddModalOpen(false)
  }

  const handleImport = async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx,.xls'
      input.onchange = async () => {
        if (!input.files || input.files.length === 0) return
        const file = input.files[0]
        const formData = new FormData()
        formData.set('file', file)
        const res = await fetch('/api/trees', { method: 'POST', body: formData })
        if (!res.ok) throw new Error('Error al importar Excel')
        const data = await res.json()
        // refrescar datos
        const reload = await fetch('/api/trees', { cache: 'no-store' })
        const payload = await reload.json()
        setStreets(payload.streets)
        setIndividualTrees(payload.trees)
      }
      input.click()
    } catch (e) {
      console.error(e)
    }
  }
  const handleExport = (format: "Excel" | "PDF") => showSimulatedFeature(`Exportar a ${format}`)

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Gestión de Arbolado Urbano</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Agregar Árbol
          </Button>
          <Button variant="outline" onClick={() => setIsPreviewOpen(true)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
            <Upload className="mr-2 h-5 w-5" /> Importar Excel
          </Button>
          {/* Podrías tener un Dropdown para múltiples formatos de exportación */}
          <Button
            variant="outline"
            onClick={() => handleExport("Excel")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="mr-2 h-5 w-5" /> Exportar Excel
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport("PDF")}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <Download className="mr-2 h-5 w-5" /> Exportar PDF
          </Button>
          <Button
            variant="destructive"
            onClick={async () => {
              if (!confirm('¿Eliminar TODOS los árboles? Esta acción no se puede deshacer.')) return
              const res = await fetch('/api/trees', { method: 'DELETE' })
              if (res.ok) {
                // recargar
                const reload = await fetch('/api/trees', { cache: 'no-store' })
                const payload = await reload.json()
                setStreets(payload.streets)
                setIndividualTrees(payload.trees)
              }
            }}
            className="border-red-800"
          >
            Eliminar todo
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              const res = await fetch('/api/trees/dedupe', { method: 'POST' })
              if (res.ok) {
                const reload = await fetch('/api/trees', { cache: 'no-store' })
                const payload = await reload.json()
                setStreets(payload.streets)
                setIndividualTrees(payload.trees)
              }
            }}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Eliminar duplicados
          </Button>
        </div>
      </div>

      <Tabs defaultValue="street-section" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-700">
          <TabsTrigger value="street-section" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white">
            Vista por Calle/Tramo
          </TabsTrigger>
          <TabsTrigger value="individual" className="data-[state=active]:bg-sky-600 data-[state=active]:text-white">
            Vista Individual
          </TabsTrigger>
        </TabsList>
        <TabsContent value="street-section" className="mt-4">
          <StreetSectionView streets={streets} />
        </TabsContent>
        <TabsContent value="individual" className="mt-4">
          <IndividualTreeView trees={individualTrees} />
        </TabsContent>
      </Tabs>

      <AddTreeModal isOpen={isAddModalOpen} onOpenChange={setIsAddModalOpen} onSave={handleAddTree} />
      <ImportPreviewModal
        isOpen={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        onImported={async () => {
          const reload = await fetch('/api/trees', { cache: 'no-store' })
          const payload = await reload.json()
          setStreets(payload.streets)
          setIndividualTrees(payload.trees)
        }}
      />
    </div>
  )
}
