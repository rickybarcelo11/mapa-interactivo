// Utilidades de exportación (CSV, XLSX, PDF) con imports dinámicos para evitar SSR

type ColumnDef<T> = { key: keyof T; header: string } | { accessor: (row: T) => any; header: string }

function normalizeRow<T>(row: T, columns: Array<ColumnDef<T>>): any[] {
  return columns.map((col) => {
    if ('key' in col) return (row as any)[col.key]
    return col.accessor(row)
  })
}

// CSV eliminado por requerimiento (solo Excel/PDF)

export async function exportToXLSX<T>(filename: string, rows: T[], columns: Array<ColumnDef<T>>): Promise<void> {
  const XLSX = await import('xlsx').then((m) => m.default || m)
  const headers = columns.map((c) => c.header)
  const data = rows.map((r) => normalizeRow(r, columns))
  const ws = XLSX.utils.aoa_to_sheet([headers, ...data])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Datos')
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`
  a.click()
  URL.revokeObjectURL(url)
}

export async function exportToPDF<T>(filename: string, title: string, rows: T[], columns: Array<ColumnDef<T>>): Promise<void> {
  const jsPdfMod: any = await import('jspdf')
  const jsPDF = jsPdfMod.jsPDF || jsPdfMod.default
  const autoTableMod: any = await import('jspdf-autotable')
  const autoTableFn = autoTableMod.default || autoTableMod
  const doc = new jsPDF('p', 'pt')
  doc.setFontSize(14)
  doc.text(title, 40, 40)
  const head = [columns.map((c) => c.header)]
  const body = rows.map((r) => normalizeRow(r, columns))
  autoTableFn(doc, {
    head,
    body,
    startY: 60,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [29, 78, 216] },
  })
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`)
}

// Facades concretas por entidad
import type { SectorPolygon, Task } from '@/src/types'

export const exportSectors = {
  xlsx: (filename: string, sectors: SectorPolygon[]) =>
    exportToXLSX(filename, sectors, [
      { key: 'name', header: 'Nombre' },
      { key: 'type', header: 'Tipo' },
      { key: 'status', header: 'Estado' },
      { accessor: (s) => s.direccion ?? '', header: 'Dirección' },
      { accessor: (s) => s.path.length, header: 'PuntosPolígono' },
    ]),
  pdf: (filename: string, sectors: SectorPolygon[]) =>
    exportToPDF(filename, 'Sectores', sectors, [
      { key: 'name', header: 'Nombre' },
      { key: 'type', header: 'Tipo' },
      { key: 'status', header: 'Estado' },
      { accessor: (s) => s.direccion ?? '', header: 'Dirección' },
    ]),
}

export const exportTasks = {
  xlsx: (filename: string, tasks: Task[]) =>
    exportToXLSX(filename, tasks, [
      { key: 'sectorName', header: 'Sector' },
      { key: 'type', header: 'Tipo' },
      { key: 'status', header: 'Estado' },
      { key: 'startDate', header: 'Inicio' },
      { accessor: (t) => t.endDate ?? '', header: 'Fin' },
      { key: 'assignedWorkerName', header: 'Trabajador' },
      { accessor: (t) => t.observations ?? '', header: 'Observaciones' },
    ]),
  pdf: (filename: string, tasks: Task[]) =>
    exportToPDF(filename, 'Tareas', tasks, [
      { key: 'sectorName', header: 'Sector' },
      { key: 'type', header: 'Tipo' },
      { key: 'status', header: 'Estado' },
      { key: 'startDate', header: 'Inicio' },
      { accessor: (t) => t.endDate ?? '', header: 'Fin' },
      { key: 'assignedWorkerName', header: 'Trabajador' },
    ]),
}


