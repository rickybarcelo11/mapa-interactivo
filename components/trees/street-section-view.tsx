"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { StreetWithSections, TreeSection } from "../../src/types"
import { getConsolidatedValue, getStreetOrientation } from "../../src/utils"
import React from "react"

interface StreetSectionViewProps {
  streets: StreetWithSections[]
}

const statusColors: Record<TreeSection["generalStatus"], string> = {
  Bueno: "text-green-400",
  Regular: "text-yellow-400",
  Malo: "text-orange-400",
  "Necesita Intervención": "text-red-400",
}

export default function StreetSectionView({ streets }: StreetSectionViewProps) {
  const [expandedStreet, setExpandedStreet] = useState<string | null>(null)

  const toggleStreet = (streetId: string) => {
    setExpandedStreet(expandedStreet === streetId ? null : streetId)
  }

  if (streets.length === 0) {
    return <p className="p-4 text-center text-slate-400">No hay calles cargadas.</p>
  }

  // Parser robusto de rangos "1200-1300" o variantes, devuelve números para ordenar
  const parseAddressRange = (rangeText: string): { start: number; end: number } => {
    const matches = (rangeText.match(/\d+/g) || []).map((v) => Number(v))
    if (matches.length === 0) return { start: Number.NaN, end: Number.NaN }
    if (matches.length === 1) return { start: matches[0], end: matches[0] }
    const start = Math.min(matches[0], matches[1])
    const end = Math.max(matches[0], matches[1])
    return { start, end }
  }

  return (
    <div className="bg-slate-800 shadow-xl rounded-lg p-0 overflow-hidden">
      <Table className="min-w-full">
        <TableHeader className="bg-slate-750">
          <TableRow className="hover:bg-slate-700 border-slate-700">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead className="text-slate-300">Nombre de Calle</TableHead>
            <TableHead className="text-slate-300 text-right">Tramos Registrados</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {streets.map((street) => {
            const sectionsByRange = street.sections.reduce(
              (acc, section) => {
                if (!acc[section.addressRange]) {
                  acc[section.addressRange] = []
                }
                acc[section.addressRange].push(section)
                return acc
              },
              {} as Record<string, TreeSection[]>,
            )
            const uniqueRangesCount = Object.keys(sectionsByRange).length
            const streetOrientation = getStreetOrientation(street.sections)

            return (
              <React.Fragment key={street.id}>
                <TableRow
                  key={street.id}
                  onClick={() => toggleStreet(street.id)}
                  className="cursor-pointer hover:bg-slate-700 border-b border-slate-700 data-[state=selected]:bg-slate-750"
                  data-state={expandedStreet === street.id ? "selected" : ""}
                >
                  <TableCell className="py-3 px-4">
                    {expandedStreet === street.id ? (
                      <ChevronDown className="h-5 w-5 text-sky-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-sky-400 py-3 px-4">{street.name}</TableCell>
                  <TableCell className="text-slate-300 py-3 px-4 text-right">{uniqueRangesCount}</TableCell>
                </TableRow>
                {expandedStreet === street.id && (
                  <TableRow className="bg-slate-750 hover:bg-slate-750">
                    <TableCell colSpan={3} className="p-0">
                      <div className="p-4 bg-slate-800 overflow-x-auto">
                        <h4 className="text-md font-semibold text-slate-200 mb-2 px-2">Tramos de {street.name}:</h4>
                        {uniqueRangesCount > 0 ? (
                          <Table className="min-w-full">
                            <TableHeader className="bg-slate-700">
                              <TableRow className="border-slate-600">
                                <TableHead className="text-slate-300 px-2 py-2 whitespace-nowrap">
                                  Tramo (Altura)
                                </TableHead>
                                {streetOrientation === "N/S" && (
                                  <>
                                    <TableHead className="text-slate-300 px-2 py-2 text-center">Norte</TableHead>
                                    <TableHead className="text-slate-300 px-2 py-2 text-center">Sur</TableHead>
                                  </>
                                )}
                                {streetOrientation === "E/W" && (
                                  <>
                                    <TableHead className="text-slate-300 px-2 py-2 text-center">Este</TableHead>
                                    <TableHead className="text-slate-300 px-2 py-2 text-center">Oeste</TableHead>
                                  </>
                                )}
                                <TableHead className="text-slate-300 px-2 py-2 text-center">Total Árboles</TableHead>
                                <TableHead className="text-slate-300 px-2 py-2 whitespace-nowrap">
                                  Especie(s) Pred.
                                </TableHead>
                                <TableHead className="text-slate-300 px-2 py-2 whitespace-nowrap">
                                  Estado(s) General
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(sectionsByRange)
                                .sort((a, b) => {
                                  const A = parseAddressRange(a[0])
                                  const B = parseAddressRange(b[0])
                                  if (!Number.isNaN(A.start) && !Number.isNaN(B.start)) {
                                    if (A.start !== B.start) return A.start - B.start
                                    if (!Number.isNaN(A.end) && !Number.isNaN(B.end)) return A.end - B.end
                                  }
                                  // Fallback estable por texto con comparación numérica
                                  return a[0].localeCompare(b[0], 'es', { numeric: true })
                                })
                                .map(([range, sectionsInRange]) => {
                                let countSideA = 0 // Norte o Este
                                let countSideB = 0 // Sur u Oeste
                                let totalCount = 0

                                sectionsInRange.forEach((s) => {
                                  totalCount += s.treeCount
                                  if (streetOrientation === "N/S") {
                                    if (s.sidewalkSide === "Norte") countSideA += s.treeCount
                                    else if (s.sidewalkSide === "Sur") countSideB += s.treeCount
                                    // Si es "Ambas" para una calle N/S, su treeCount es el total del tramo.
                                    // Las columnas Norte/Sur podrían quedar en "-" o interpretarse.
                                    // Por ahora, si es "Ambas", el totalCount ya lo tiene, y N/S quedan en 0 a menos que se especifique.
                                    // Si un tramo es "Ambas", su count va al total. N y S serían 0 si no hay secciones N/S explícitas.
                                    // Si hay N:10, S:12, Ambas:0 -> N=10, S=12, Total=22
                                    // Si hay N:0, S:0, Ambas:25 -> N=0, S=0, Total=25 (o N=-, S=-)
                                  } else if (streetOrientation === "E/W") {
                                    if (s.sidewalkSide === "Este") countSideA += s.treeCount
                                    else if (s.sidewalkSide === "Oeste") countSideB += s.treeCount
                                  }
                                  // Si es "AmbasOnly" y no N/S ni E/W, el totalCount ya tiene la suma de los "Ambas".
                                })

                                // Si hay una sección "Ambas" y la orientación es N/S o E/W,
                                // el totalCount ya incluye el treeCount de "Ambas".
                                // Las columnas específicas (N/S o E/W) solo sumarán secciones explícitas de ese lado.
                                // Si un tramo SOLO tiene "Ambas", countSideA y countSideB serán 0.
                                const hasExplicitAmbas = sectionsInRange.some((s) => s.sidewalkSide === "Ambas")
                                const onlyAmbasForTramo =
                                  sectionsInRange.length === 1 && sectionsInRange[0].sidewalkSide === "Ambas"

                                const predominantSpecies = getConsolidatedValue(
                                  sectionsInRange.map((s) => s.predominantSpecies),
                                )
                                const generalStatus = getConsolidatedValue(sectionsInRange.map((s) => s.generalStatus))
                                const displayStatusColor =
                                  sectionsInRange.length > 0 && sectionsInRange[0].generalStatus
                                    ? statusColors[sectionsInRange[0].generalStatus]
                                    : "text-slate-300"

                                return (
                                  <TableRow key={range} className="border-b border-slate-600 hover:bg-slate-700/50">
                                    <TableCell className="text-slate-300 py-2 px-2 whitespace-nowrap">
                                      {range}
                                    </TableCell>
                                    {streetOrientation === "N/S" && (
                                      <>
                                        <TableCell className="text-slate-300 py-2 px-2 text-center">
                                          {onlyAmbasForTramo ? "-" : countSideA || "-"}
                                        </TableCell>
                                        <TableCell className="text-slate-300 py-2 px-2 text-center">
                                          {onlyAmbasForTramo ? "-" : countSideB || "-"}
                                        </TableCell>
                                      </>
                                    )}
                                    {streetOrientation === "E/W" && (
                                      <>
                                        <TableCell className="text-slate-300 py-2 px-2 text-center">
                                          {onlyAmbasForTramo ? "-" : countSideA || "-"}
                                        </TableCell>
                                        <TableCell className="text-slate-300 py-2 px-2 text-center">
                                          {onlyAmbasForTramo ? "-" : countSideB || "-"}
                                        </TableCell>
                                      </>
                                    )}
                                    <TableCell className="text-slate-300 py-2 px-2 text-center font-semibold">
                                      {totalCount}
                                    </TableCell>
                                    <TableCell className="text-slate-300 py-2 px-2 whitespace-nowrap">
                                      {predominantSpecies}
                                    </TableCell>
                                    <TableCell
                                      className={`py-2 px-2 font-medium whitespace-nowrap ${displayStatusColor}`}
                                    >
                                      {generalStatus}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        ) : (
                          <p className="text-slate-400 px-2 py-2">No hay tramos registrados para esta calle.</p>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
