"use client"

import { useState, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { X, Edit, Trash2 } from "lucide-react"
import type { IndividualTree, TreeStatus } from "@/src/types"
import { useNotifications } from "@/src/hooks"
import ConfirmDeleteDialog from "@/components/tasks/confirm-delete-dialog" // Reutilizamos
// AddTreeModal se maneja desde TreesView, pero la edición podría usar uno similar o el mismo.

interface IndividualTreeViewProps {
  trees: IndividualTree[]
}

const treeStatusOptions: TreeStatus[] = ["Sano", "Enfermo", "Necesita Poda", "Seco", "Recién Plantado"]

export default function IndividualTreeView({ trees: initialTrees }: IndividualTreeViewProps) {
  const [trees, setTrees] = useState<IndividualTree[]>(initialTrees) // Para permitir borrado local
  const [filters, setFilters] = useState({ species: "", status: "todos", address: "", freeText: "" })
  const [deletingTree, setDeletingTree] = useState<IndividualTree | null>(null)
  const { showSimulatedFeature } = useNotifications()

  const uniqueSpecies = useMemo(() => {
    const speciesSet = new Set(trees.map((tree) => tree.species))
    return ["todos", ...Array.from(speciesSet)]
  }, [trees])

  const filteredTrees = useMemo(() => {
    return trees.filter((tree) => {
      const freeTextLower = filters.freeText.toLowerCase()
      return (
        (filters.species === "todos" || tree.species.toLowerCase().includes(filters.species.toLowerCase())) &&
        (filters.status === "todos" || tree.status === filters.status) &&
        (tree.streetName + " " + tree.streetNumber).toLowerCase().includes(filters.address.toLowerCase()) &&
        (filters.freeText === "" ||
          tree.species.toLowerCase().includes(freeTextLower) ||
          tree.status.toLowerCase().includes(freeTextLower) ||
          (tree.streetName + " " + tree.streetNumber).toLowerCase().includes(freeTextLower) ||
          (tree.observations || "").toLowerCase().includes(freeTextLower))
      )
    })
  }, [trees, filters])

  const handleFilterChange = (name: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const clearFilters = () => setFilters({ species: "", status: "todos", address: "", freeText: "" })

  const handleDeleteTree = (tree: IndividualTree) => {
    setDeletingTree(tree)
  }

  const confirmDelete = () => {
    if (deletingTree) {
      setTrees((prev) => prev.filter((t) => t.id !== deletingTree.id))
      setDeletingTree(null)
    }
  }

  const handleEditTree = (tree: IndividualTree) => {
    // Aquí se abriría el modal de edición, similar al de agregar.
    // Por ahora, una notificación. El modal de agregar está en TreesView.
    showSimulatedFeature(`Editar árbol: ${tree.species} en ${tree.streetName} ${tree.streetNumber}`)
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-slate-800 rounded-lg shadow-md space-y-4">
        <Input
          placeholder="Búsqueda por texto libre (especie, estado, dirección, observaciones)..."
          value={filters.freeText}
          onChange={(e) => handleFilterChange("freeText", e.target.value)}
          className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Select value={filters.species} onValueChange={(val) => handleFilterChange("species", val)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
              <SelectValue placeholder="Especie" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
              {uniqueSpecies.map((s) => (
                <SelectItem key={s} value={s} className="capitalize hover:bg-slate-600">
                  {s === "todos" ? "Todas las Especies" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(val) => handleFilterChange("status", val)}>
            <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-50">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
              <SelectItem value="todos">Todos los Estados</SelectItem>
              {treeStatusOptions.map((s) => (
                <SelectItem key={s} value={s} className="capitalize hover:bg-slate-600">
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Dirección (Calle y Nro)..."
            value={filters.address}
            onChange={(e) => handleFilterChange("address", e.target.value)}
            className="bg-slate-700 border-slate-600 text-slate-50 placeholder:text-slate-400"
          />
        </div>
        <div className="flex justify-end">
          <Button
            variant="ghost"
            onClick={clearFilters}
            className="text-slate-400 hover:bg-slate-700 hover:text-slate-200"
          >
            <X className="mr-2 h-4 w-4" /> Limpiar Filtros
          </Button>
        </div>
      </div>

      <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
        <div className="flex items-center justify-end px-4 py-3 border-b border-slate-700">
          <span className="text-sm text-slate-300">Totalidad de árboles cargados: </span>
          <span className="ml-2 text-sm font-semibold text-sky-400">{filteredTrees.length}</span>
        </div>
        {filteredTrees.length === 0 ? (
          <p className="p-4 text-center text-slate-400">No se encontraron árboles con los filtros aplicados.</p>
        ) : (
          <Table className="min-w-full">
            <TableHeader className="bg-slate-750">
              <TableRow className="hover:bg-slate-700 border-slate-700">
                <TableHead className="text-slate-300">Especie</TableHead>
                <TableHead className="text-slate-300">Dirección</TableHead>
                <TableHead className="text-slate-300">Estado</TableHead>
                <TableHead className="text-slate-300">Observaciones</TableHead>
                <TableHead className="text-slate-300">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrees.map((tree) => (
                <TableRow key={tree.id} className="border-b border-slate-700">
                  <TableCell className="font-medium text-sky-400 py-3 px-4">{tree.species}</TableCell>
                  <TableCell className="text-slate-300 py-3 px-4">
                    {tree.streetName} {tree.streetNumber}
                  </TableCell>
                  <TableCell className="text-slate-300 py-3 px-4">{tree.status}</TableCell>
                  <TableCell className="text-slate-300 py-3 px-4 truncate max-w-xs">
                    {tree.observations || "N/A"}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditTree(tree)}
                      className="text-sky-400 hover:text-sky-300 mr-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTree(tree)}
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      {deletingTree && (
        <ConfirmDeleteDialog
          isOpen={!!deletingTree}
          onOpenChange={() => setDeletingTree(null)}
          onConfirm={confirmDelete}
          itemName={`el árbol ${deletingTree.species} en ${deletingTree.streetName} ${deletingTree.streetNumber}`}
        />
      )}
    </div>
  )
}
