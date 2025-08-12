"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { IndividualTree, TreeStatus } from "@/views/trees-view"
import { useNotifications, useTreeValidation } from "@/src/hooks"

interface AddTreeModalProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSave: (treeData: Omit<IndividualTree, "id">) => void
  treeToEdit?: IndividualTree | null // Para futura edición
}

const initialFormData: Omit<IndividualTree, "id"> = {
  species: "",
  status: "Sano",
  streetName: "",
  streetNumber: "",
  plantingDate: "",
  lastPruningDate: "",
  observations: "",
}

const treeStatusOptions: TreeStatus[] = ["Sano", "Enfermo", "Necesita Poda", "Seco", "Recién Plantado"]

export default function AddTreeModal({ isOpen, onOpenChange, onSave, treeToEdit }: AddTreeModalProps) {
  const [formData, setFormData] = useState<Omit<IndividualTree, "id">>(initialFormData)
  const { showRequiredFieldsError } = useNotifications()
  const { validateTreeForm } = useTreeValidation()

  useEffect(() => {
    if (treeToEdit) {
      // Si se pasa un árbol para editar, llenar el formulario
      // Por ahora, el modal solo agrega, pero esto es para futura expansión
      setFormData({
        species: treeToEdit.species,
        status: treeToEdit.status,
        streetName: treeToEdit.streetName,
        streetNumber: treeToEdit.streetNumber,
        plantingDate: treeToEdit.plantingDate || "",
        lastPruningDate: treeToEdit.lastPruningDate || "",
        observations: treeToEdit.observations || "",
      })
    } else if (!isOpen) {
      // Resetear si se cierra y no se estaba editando
      setFormData(initialFormData)
    }
  }, [treeToEdit, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: keyof Omit<IndividualTree, "id">, value: string) => {
    setFormData({ ...formData, [name]: value as TreeStatus })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Validación con Zod
    const validated = validateTreeForm(formData)
    if (!validated) {
      if (!formData.species || !formData.streetName || !formData.streetNumber) {
        showRequiredFieldsError()
      }
      return
    }
    onSave(validated)
    // No cerramos el modal aquí, se maneja desde TreesView
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        onOpenChange(open)
        if (!open) setFormData(initialFormData) // Resetear al cerrar
      }}
    >
      <DialogContent className="bg-slate-800 text-slate-50 border-slate-700 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-sky-400">
            {treeToEdit ? "Editar Árbol" : "Agregar Nuevo Árbol Manualmente"}
          </DialogTitle>
          <DialogDescription className="text-slate-400">Completa la información del árbol.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4 grid gap-3 max-h-[60vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="species" className="text-slate-300">
                  Especie
                </Label>
                <Input
                  id="species"
                  name="species"
                  value={formData.species}
                  onChange={handleChange}
                  required
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="status" className="text-slate-300">
                  Estado
                </Label>
                <Select
                  name="status"
                  value={formData.status}
                  onValueChange={(val) => handleSelectChange("status", val)}
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-700 text-slate-50 border-slate-600">
                    {treeStatusOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="streetName" className="text-slate-300">
                Nombre de Calle
              </Label>
              <Input
                id="streetName"
                name="streetName"
                value={formData.streetName}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div>
              <Label htmlFor="streetNumber" className="text-slate-300">
                Altura/Número
              </Label>
              <Input
                id="streetNumber"
                name="streetNumber"
                value={formData.streetNumber}
                onChange={handleChange}
                required
                className="bg-slate-700 border-slate-600"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="plantingDate" className="text-slate-300">
                  Fecha Plantación (opc.)
                </Label>
                <Input
                  type="date"
                  id="plantingDate"
                  name="plantingDate"
                  value={formData.plantingDate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
              <div>
                <Label htmlFor="lastPruningDate" className="text-slate-300">
                  Última Poda (opc.)
                </Label>
                <Input
                  type="date"
                  id="lastPruningDate"
                  name="lastPruningDate"
                  value={formData.lastPruningDate}
                  onChange={handleChange}
                  className="bg-slate-700 border-slate-600"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="observations" className="text-slate-300">
                Observaciones (opc.)
              </Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleChange}
                className="bg-slate-700 border-slate-600"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Cancelar
            </Button>
            <Button type="submit" className="bg-sky-500 hover:bg-sky-600">
              {treeToEdit ? "Guardar Cambios" : "Agregar Árbol"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
