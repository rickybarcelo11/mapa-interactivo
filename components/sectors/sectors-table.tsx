"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import SectorRowDetails from "./sector-row-details"
import type { SectorPolygon, SectorStatus } from "@/components/home/map-interactive-placeholder"
import { ChevronDown, ChevronRight } from "lucide-react"

interface SectorsTableProps {
  sectors: SectorPolygon[]
}

const statusBadgeVariant: Record<SectorStatus, "default" | "destructive" | "outline" | "secondary"> = {
  pendiente: "destructive",
  "en proceso": "default", // 'default' suele ser amarillo/naranja en shadcn themes
  completado: "secondary", // 'secondary' suele ser verde/azul en shadcn themes
}
// Ajustar colores de badge si es necesario en globals.css o tailwind.config.ts
// Por ahora, usamos los colores por defecto de shadcn/ui Badge.
// destructive: rojo, default: (depende del tema, puede ser primario), secondary: (depende del tema, puede ser gris/verde)
// Para 'en proceso' (amarillo) y 'completado' (verde) más explícitos, se podrían necesitar clases custom.
// Ejemplo: className="bg-yellow-500 text-yellow-900" para 'en proceso'

export default function SectorsTable({ sectors }: SectorsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  if (sectors.length === 0) {
    return <p className="p-4 text-center text-slate-400">No se encontraron sectores con los filtros aplicados.</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader className="bg-slate-750">
          <TableRow className="hover:bg-slate-700 border-slate-700">
            <TableHead className="w-[50px] text-slate-300"></TableHead>
            <TableHead className="text-slate-300">Nombre</TableHead>
            <TableHead className="text-slate-300">Tipo</TableHead>
            <TableHead className="text-slate-300">Dirección</TableHead>
            <TableHead className="text-slate-300">Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sectors.map((sector) => (
            <>
              <TableRow
                key={sector.id}
                onClick={() => toggleRow(sector.id)}
                className="cursor-pointer hover:bg-slate-700 border-b border-slate-700 data-[state=selected]:bg-slate-600"
                data-state={expandedRow === sector.id ? "selected" : ""}
              >
                <TableCell className="py-3 px-4">
                  {expandedRow === sector.id ? (
                    <ChevronDown className="h-5 w-5 text-sky-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </TableCell>
                <TableCell className="font-medium text-sky-400 py-3 px-4">{sector.name}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{sector.type}</TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{sector.direccion || "N/A"}</TableCell>
                <TableCell className="py-3 px-4">
                  <Badge
                    variant={statusBadgeVariant[sector.status]}
                    className={`capitalize 
                    ${sector.status === "pendiente" ? "bg-red-600 text-red-50" : ""}
                    ${sector.status === "en proceso" ? "bg-yellow-500 text-yellow-950" : ""}
                    ${sector.status === "completado" ? "bg-green-600 text-green-50" : ""}`}
                  >
                    {sector.status}
                  </Badge>
                </TableCell>
              </TableRow>
              {expandedRow === sector.id && (
                <TableRow className="bg-slate-750 hover:bg-slate-750 border-b-2 border-sky-500">
                  <TableCell colSpan={5} className="p-0">
                    <div className="p-4">
                      <SectorRowDetails sector={sector} />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
