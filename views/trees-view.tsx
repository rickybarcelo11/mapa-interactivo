"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, Upload, Download } from "lucide-react"
import StreetSectionView from "@/components/trees/street-section-view"
import IndividualTreeView from "@/components/trees/individual-tree-view"
import AddTreeModal from "@/components/trees/add-tree-modal"
import type { TreeSection, StreetWithSections, IndividualTree } from "@/src/types"
import { useNotifications } from "@/src/hooks"

// Datos de ejemplo
const sampleStreets: StreetWithSections[] = [
  {
    id: "street1",
    name: "Av. Siempreviva",
    sections: [
      {
        id: "s1a",
        addressRange: "700-799",
        sidewalkSide: "Norte",
        predominantSpecies: "Jacarandá",
        treeCount: 15,
        generalStatus: "Bueno",
      },
      {
        id: "s1b",
        addressRange: "700-799",
        sidewalkSide: "Sur",
        predominantSpecies: "Lapacho",
        treeCount: 12,
        generalStatus: "Regular",
      },
      {
        id: "s1c",
        addressRange: "800-899",
        sidewalkSide: "Ambas",
        predominantSpecies: "Jacarandá",
        treeCount: 28,
        generalStatus: "Bueno",
      },
    ],
  },
  {
    id: "street2",
    name: "Calle de los Plátanos",
    sections: [
      {
        id: "s2a",
        addressRange: "100-199",
        sidewalkSide: "Ambas",
        predominantSpecies: "Plátano",
        treeCount: 25,
        generalStatus: "Necesita Intervención",
      },
    ],
  },
  {
    id: "street3",
    name: "Paseo de los Tilos",
    sections: [
      {
        id: "s3a",
        addressRange: "1-99",
        sidewalkSide: "Este",
        predominantSpecies: "Tilo",
        treeCount: 22,
        generalStatus: "Bueno",
      },
      {
        id: "s3b",
        addressRange: "1-99",
        sidewalkSide: "Oeste",
        predominantSpecies: "Tilo",
        treeCount: 21,
        generalStatus: "Bueno",
      },
      {
        id: "s3c",
        addressRange: "100-199",
        sidewalkSide: "Este",
        predominantSpecies: "Tilo",
        treeCount: 18,
        generalStatus: "Regular",
      },
      {
        id: "s3d",
        addressRange: "100-199",
        sidewalkSide: "Oeste",
        predominantSpecies: "Fresno",
        treeCount: 19,
        generalStatus: "Bueno",
      },
    ],
  },
  {
    id: "street4",
    name: "Rambla de los Fresnos",
    sections: [
      {
        id: "s4a",
        addressRange: "500-599",
        sidewalkSide: "Norte",
        predominantSpecies: "Fresno Americano",
        treeCount: 35,
        generalStatus: "Necesita Intervención",
      },
    ],
  },
  {
    id: "street5",
    name: "Avenida de los Robles",
    sections: [
      {
        id: "s5a",
        addressRange: "1200-1299",
        sidewalkSide: "Ambas",
        predominantSpecies: "Roble",
        treeCount: 40,
        generalStatus: "Malo",
      },
    ],
  },
]

const sampleIndividualTrees: IndividualTree[] = [
  {
    id: "tree1",
    species: "Jacarandá",
    status: "Sano",
    streetName: "Av. Siempreviva",
    streetNumber: "742",
    plantingDate: "2010-03-15",
  },
  {
    id: "tree2",
    species: "Plátano",
    status: "Necesita Poda",
    streetName: "Calle de los Plátanos",
    streetNumber: "123",
    lastPruningDate: "2022-07-01",
    observations: "Ramas muy bajas sobre la vereda.",
  },
  {
    id: "tree3",
    species: "Lapacho",
    status: "Enfermo",
    streetName: "Av. Siempreviva",
    streetNumber: "780",
    observations: "Presenta manchas en las hojas.",
  },
  { id: "tree4", species: "Tilo", status: "Sano", streetName: "Paseo de los Tilos", streetNumber: "55" },
  {
    id: "tree5",
    species: "Fresno",
    status: "Necesita Poda",
    streetName: "Paseo de los Tilos",
    streetNumber: "150",
    observations: "Interfiere con cableado.",
  },
  {
    id: "tree6",
    species: "Fresno Americano",
    status: "Seco",
    streetName: "Rambla de los Fresnos",
    streetNumber: "510",
    observations: "Riesgo de caída. Extraer.",
  },
  {
    id: "tree7",
    species: "Roble",
    status: "Malo",
    streetName: "Avenida de los Robles",
    streetNumber: "1250",
    observations: "Tronco ahuecado.",
  },
  {
    id: "tree8",
    species: "Jacarandá",
    status: "Recién Plantado",
    streetName: "Av. Siempreviva",
    streetNumber: "810",
    plantingDate: "2024-04-01",
  },
  { id: "tree9", species: "Plátano", status: "Sano", streetName: "Calle de los Plátanos", streetNumber: "135" },
  { id: "tree10", species: "Lapacho", status: "Sano", streetName: "Av. Siempreviva", streetNumber: "715" },
  {
    id: "tree11",
    species: "Tilo",
    status: "Enfermo",
    streetName: "Paseo de los Tilos",
    streetNumber: "88",
    observations: "Posible plaga.",
  },
  { id: "tree12", species: "Jacarandá", status: "Sano", streetName: "Av. Siempreviva", streetNumber: "722" },
  { id: "tree13", species: "Jacarandá", status: "Sano", streetName: "Av. Siempreviva", streetNumber: "728" },
  {
    id: "tree14",
    species: "Plátano",
    status: "Necesita Poda",
    streetName: "Calle de los Plátanos",
    streetNumber: "159",
  },
  { id: "tree15", species: "Fresno", status: "Sano", streetName: "Paseo de los Tilos", streetNumber: "162" },
  { id: "tree16", species: "Tilo", status: "Sano", streetName: "Paseo de los Tilos", streetNumber: "25" },
  { id: "tree17", species: "Roble", status: "Malo", streetName: "Avenida de los Robles", streetNumber: "1224" },
  {
    id: "tree18",
    species: "Fresno Americano",
    status: "Necesita Poda",
    streetName: "Rambla de los Fresnos",
    streetNumber: "530",
  },
  {
    id: "tree19",
    species: "Lapacho",
    status: "Recién Plantado",
    streetName: "Av. Siempreviva",
    streetNumber: "790",
    plantingDate: "2024-04-01",
  },
  {
    id: "tree20",
    species: "Jacarandá",
    status: "Enfermo",
    streetName: "Av. Siempreviva",
    streetNumber: "850",
    observations: "Hojas amarillentas.",
  },
]

export default function TreesView() {
  const [streets, setStreets] = useState<StreetWithSections[]>(sampleStreets)
  const [individualTrees, setIndividualTrees] = useState<IndividualTree[]>(sampleIndividualTrees)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { showTreeCreated, showSimulatedFeature } = useNotifications()

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
