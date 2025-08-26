"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Upload, Download } from "lucide-react"
import StreetSectionView from "@/components/trees/street-section-view"
import IndividualTreeView from "@/components/trees/individual-tree-view"
import AddTreeModal from "@/components/trees/add-tree-modal"
import type { TreeSection, StreetWithSections, IndividualTree } from "@/src/types"
import { useNotifications } from "@/src/hooks"

// Datos desde API

export default function TreesView() {
  const [streets, setStreets] = useState<StreetWithSections[]>([])
  const [individualTrees, setIndividualTrees] = useState<IndividualTree[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { showTreeCreated, showSimulatedFeature } = useNotifications()

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/trees', { cache: 'no-store' })
      const data = await res.json()
      setStreets(data.streets)
      setIndividualTrees(data.trees)
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

  const handleImport = () => showSimulatedFeature("Importar desde Excel")
  const handleExport = (format: "Excel" | "PDF") => showSimulatedFeature(`Exportar a ${format}`)

  return (
    <div className="space-y-6 p-1">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl font-bold text-slate-100">Gestión de Arbolado Urbano</h1>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setIsAddModalOpen(true)} className="bg-sky-500 hover:bg-sky-600 text-white">
            <PlusCircle className="mr-2 h-5 w-5" /> Agregar Árbol
          </Button>
          <Button
            variant="outline"
            onClick={handleImport}
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
          >
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
    </div>
  )
}
