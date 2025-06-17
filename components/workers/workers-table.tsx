"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import WorkerDetailsAccordion from "./worker-details-accordion"
import type { Worker, Task } from "@/views/workers-view" // Ajusta la ruta si es necesario

interface WorkersTableProps {
  workers: Worker[]
  workerTasks: Map<string, Task[]>
  onEdit: (worker: Worker) => void
  onDelete: (worker: Worker) => void
}

export default function WorkersTable({ workers, workerTasks, onEdit, onDelete }: WorkersTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null)

  const toggleRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id)
  }

  if (workers.length === 0) {
    return <p className="p-4 text-center text-slate-400">No se encontraron trabajadores con los filtros aplicados.</p>
  }

  return (
    <div className="overflow-x-auto">
      <Table className="min-w-full">
        <TableHeader className="bg-slate-750">
          <TableRow className="hover:bg-slate-700 border-slate-700">
            <TableHead className="w-[50px] text-slate-300"></TableHead>
            <TableHead className="text-slate-300">Nombre Completo</TableHead>
            <TableHead className="text-slate-300">Observaciones Generales</TableHead>
            <TableHead className="text-slate-300">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {workers.map((worker) => (
            <>
              <TableRow
                key={worker.id}
                className="border-b border-slate-700 data-[state=selected]:bg-slate-750"
                data-state={expandedRow === worker.id ? "selected" : ""}
              >
                <TableCell className="py-3 px-4 cursor-pointer" onClick={() => toggleRow(worker.id)}>
                  {expandedRow === worker.id ? (
                    <ChevronDown className="h-5 w-5 text-sky-400" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-slate-400" />
                  )}
                </TableCell>
                <TableCell
                  className="font-medium text-sky-400 py-3 px-4 cursor-pointer"
                  onClick={() => toggleRow(worker.id)}
                >
                  {worker.name}
                </TableCell>
                <TableCell className="text-slate-300 py-3 px-4">{worker.observaciones || "N/A"}</TableCell>
                <TableCell className="py-3 px-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-slate-800 text-slate-50 border-slate-700">
                      <DropdownMenuItem onClick={() => onEdit(worker)} className="cursor-pointer hover:!bg-slate-700">
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDelete(worker)}
                        className="cursor-pointer !text-red-500 hover:!bg-red-900/50"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
              {expandedRow === worker.id && (
                <TableRow className="bg-slate-750 hover:bg-slate-750">
                  <TableCell colSpan={4} className="p-0">
                    <WorkerDetailsAccordion tasks={workerTasks.get(worker.id) || []} workerName={worker.name} />
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
