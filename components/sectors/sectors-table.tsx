"use client"

import { useState, useCallback, useMemo, memo } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import SectorRowDetails from "./sector-row-details"
import type { SectorPolygon, SectorStatus } from "@/src/types"
import { ChevronDown, ChevronRight } from "lucide-react"

interface SectorsTableProps {
  sectors: SectorPolygon[]
  onEdit?: (sector: SectorPolygon) => void
  onDelete?: (sectorId: string) => void
  onViewHistory?: (sector: SectorPolygon) => void
}

const statusBadgeVariant: Record<SectorStatus, "default" | "destructive" | "outline" | "secondary"> = {
  pendiente: "destructive",
  "en proceso": "default",
  completado: "secondary",
}

// Componente memoizado para la fila de sector
const SectorRow = memo(({ 
  sector, 
  isExpanded, 
  onToggle, 
  onEdit, 
  onDelete, 
  onViewHistory 
}: {
  sector: SectorPolygon
  isExpanded: boolean
  onToggle: (id: string) => void
  onEdit?: (sector: SectorPolygon) => void
  onDelete?: (sectorId: string) => void
  onViewHistory?: (sector: SectorPolygon) => void
}) => {
  const handleToggle = useCallback(() => {
    onToggle(sector.id)
  }, [sector.id, onToggle])

  const handleEdit = useCallback(() => {
    onEdit?.(sector)
  }, [sector, onEdit])

  const handleDelete = useCallback(() => {
    onDelete?.(sector.id)
  }, [sector.id, onDelete])

  const handleViewHistory = useCallback(() => {
    onViewHistory?.(sector)
  }, [sector, onViewHistory])

  const badgeVariant = useMemo(() => statusBadgeVariant[sector.status], [sector.status])
  
  const badgeClassName = useMemo(() => {
    const baseClasses = "capitalize"
    switch (sector.status) {
      case "pendiente":
        return `${baseClasses} bg-red-600 text-red-50`
      case "en proceso":
        return `${baseClasses} bg-yellow-500 text-yellow-950`
      case "completado":
        return `${baseClasses} bg-green-600 text-green-50`
      default:
        return baseClasses
    }
  }, [sector.status])

  return (
    <>
      <TableRow
        onClick={handleToggle}
        className="cursor-pointer hover:bg-slate-700 border-b border-slate-700 data-[state=selected]:bg-slate-600"
        data-state={isExpanded ? "selected" : ""}
      >
        <TableCell className="py-3 px-4">
          {isExpanded ? (
            <ChevronDown className="h-5 w-5 text-sky-400" />
          ) : (
            <ChevronRight className="h-5 w-5 text-slate-400" />
          )}
        </TableCell>
        <TableCell className="font-medium text-sky-400 py-3 px-4">{sector.name}</TableCell>
        <TableCell className="text-slate-300 py-3 px-4">{sector.type}</TableCell>
        <TableCell className="text-slate-300 py-3 px-4">{sector.direccion || "N/A"}</TableCell>
        <TableCell className="py-3 px-4">
          <Badge variant={badgeVariant} className={badgeClassName}>
            {sector.status}
          </Badge>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow className="bg-slate-750 hover:bg-slate-750 border-b-2 border-sky-500">
          <TableCell colSpan={5} className="p-0" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <SectorRowDetails 
                sector={sector} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
                onViewHistory={handleViewHistory} 
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
})

SectorRow.displayName = "SectorRow"

function SectorsTable({ sectors, onEdit, onDelete, onViewHistory }: SectorsTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = useCallback((id: string) => {
    setExpandedRow(prev => prev === id ? null : id)
  }, [])

  const memoizedSectors = useMemo(() => sectors, [sectors])

  if (memoizedSectors.length === 0) {
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
          {memoizedSectors.map((sector) => (
            <SectorRow
              key={sector.id}
              sector={sector}
              isExpanded={expandedRow === sector.id}
              onToggle={toggleRow}
              onEdit={onEdit}
              onDelete={onDelete}
              onViewHistory={onViewHistory}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default memo(SectorsTable)
