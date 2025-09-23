import { listStreetSections, listIndividualTrees } from '../../../src/services/trees'
import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'
import { prisma } from '../../../src/server/db/prisma'

export const runtime = 'nodejs'
// Helpers compartidos
function mapStatusUiToDb(raw: any): 'Sano' | 'Enfermo' | 'Necesita_Poda' | 'Seco' | 'Recien_Plantado' | 'Malo' {
  const s = String(raw ?? '').trim().toLowerCase()
  if (!s) return 'Sano'
  if (s === 'sano') return 'Sano'
  if (s === 'enfermo') return 'Enfermo'
  if (s === 'necesita poda' || s === 'necesita_poda' || s === 'necesita  poda') return 'Necesita_Poda'
  if (s === 'recien plantado' || s === 'recién plantado' || s === 'recien_plantado') return 'Recien_Plantado'
  if (s === 'seco') return 'Seco'
  if (s === 'malo') return 'Malo'
  return 'Sano'
}

export async function GET() {
  try {
    const [streets, trees] = await Promise.all([
      listStreetSections(),
      listIndividualTrees(),
    ])
    return new Response(JSON.stringify({ streets, trees }), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al obtener arbolado', error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      // Modo JSON: permite recibir filas ya normalizadas desde el modal de preview
      try {
        const body = await req.json()
        if (!Array.isArray(body?.rows)) {
          return new Response(JSON.stringify({ message: 'Se requiere multipart/form-data o JSON { rows: [...] }' }), { status: 400 })
        }
        // Dedupe local y carga por lotes
        const rows: Array<{ species: string; status: any; streetName: string; streetNumber: string; sidewalk: any; observations: string | null }> = []
        const seen = new Set<string>()
        for (const r of body.rows as any[]) {
          if (!r?.species || !r?.streetName || !r?.streetNumber) continue
          const key = `${String(r.streetName).trim().toLowerCase()}|${String(r.streetNumber).trim()}|${String(r.species).trim().toLowerCase()}|${r.sidewalk || ''}`
          if (seen.has(key)) continue
          seen.add(key)
          rows.push({
            species: String(r.species),
            status: mapStatusUiToDb(r.status) as any,
            streetName: String(r.streetName),
            streetNumber: String(r.streetNumber),
            sidewalk: (r.sidewalk ?? null) as any,
            observations: (r.observations ?? null) as any,
          })
        }
        let created = 0
        const CHUNK = 1000
        for (let i = 0; i < rows.length; i += CHUNK) {
          const chunk = rows.slice(i, i + CHUNK)
          const res = await prisma.tree.createMany({ data: chunk })
          created += res.count
        }
        return new Response(JSON.stringify({ ok: true, created, mode: 'json', received: (body.rows as any[]).length, deduped: rows.length }), { status: 200, headers: { 'content-type': 'application/json' } })
      } catch {}
      return new Response(JSON.stringify({ message: 'Se requiere multipart/form-data' }), { status: 400 })
    }
    const form = await req.formData()
    const file = form.get('file') as File | null
    const replaceAll = String(form.get('replaceAll') || '').trim() === '1'
    if (!file) return new Response(JSON.stringify({ message: 'Archivo no proporcionado' }), { status: 400 })

    const arrayBuffer = await file.arrayBuffer()
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' })

    // Normalizadores y mapeos
    const toStr = (v: any) => (v === undefined || v === null ? '' : String(v))
    const trimSpaces = (s: string) => s.replace(/\s+/g, ' ').trim()
    const onlyDigits = (s: string) => (s.match(/\d+/g)?.join('') || '')
    const normalizeStreetNumber = (v: any) => onlyDigits(toStr(v))
    const normalizeStatusToDb = (raw: any): 'Sano' | 'Enfermo' | 'Necesita_Poda' | 'Seco' | 'Recien_Plantado' | 'Malo' | null => {
      const s = trimSpaces(toStr(raw)).toLowerCase()
      if (!s) return null
      if (['sano'].includes(s)) return 'Sano'
      if (['enfermo'].includes(s)) return 'Enfermo'
      if (['necesita poda', 'necesita_poda', 'necesita  poda'].includes(s)) return 'Necesita_Poda'
      if (['recién plantado', 'recien plantado', 'recien_plantado', 'reciem plantado'].includes(s)) return 'Recien_Plantado'
      if (['seco'].includes(s)) return 'Seco'
      if (['malo'].includes(s)) return 'Malo'
      return null
    }
    const normalizeSidewalk = (raw: any): 'Norte' | 'Sur' | 'Este' | 'Oeste' | 'Ambas' | 'Ninguna' | null => {
      const s = trimSpaces(toStr(raw)).toLowerCase()
      if (!s) return null
      if (['n', 'norte'].includes(s)) return 'Norte'
      if (['s', 'sur'].includes(s)) return 'Sur'
      if (['e', 'este'].includes(s)) return 'Este'
      if (['o', 'oeste'].includes(s)) return 'Oeste'
      if (['ambas', 'ambos', 'ambas veredas', 'ambos lados'].includes(s)) return 'Ambas'
      if (['ninguna', 'ninguno', 'na', 'n/a'].includes(s)) return 'Ninguna'
      return null
    }
    const getField = (row: any, aliases: string[]) => {
      for (const a of aliases) {
        if (a in row) return row[a]
        // búsqueda case-insensitive
        const key = Object.keys(row).find(k => k.toLowerCase() === a.toLowerCase())
        if (key) return row[key]
      }
      return ''
    }

    if (replaceAll) {
      await prisma.tree.deleteMany({})
    }

    let created = 0
    let skipped = 0
    let duplicateSkipped = 0
    const errors: Array<{ row: number; reason: string }> = []
    const seen = new Set<string>()
    const rowsToInsert: Array<{ species: string; status: any; streetName: string; streetNumber: string; sidewalk: any; observations: string | null }> = []

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i]
      const species = trimSpaces(toStr(getField(r, ['Especie', 'species', 'Species'])))
      const streetName = trimSpaces(toStr(getField(r, ['Calle', 'streetName', 'Street', 'StreetName'])))
      const streetNumberRaw = getField(r, ['Altura', 'streetNumber', 'StreetNumber', 'Alt'])
      const streetNumber = normalizeStreetNumber(streetNumberRaw)
      const statusDb = normalizeStatusToDb(getField(r, ['Estado', 'status', 'Status']))
      const sidewalkDb = normalizeSidewalk(getField(r, ['Vereda', 'sidewalk', 'Sidewalk', 'Side']))
      const observations = trimSpaces(toStr(getField(r, ['Observacion', 'Observaciones', 'observations', 'Notes']))) || null

      if (!species || !streetName || !streetNumber) {
        skipped++
        errors.push({ row: i + 2, reason: 'Faltan campos clave (Especie/Calle/Altura)' })
        continue
      }

      const key = `${streetName}|${streetNumber}|${species}|${sidewalkDb ?? ''}`
      if (seen.has(key)) {
        duplicateSkipped++
        continue
      }

      seen.add(key)
      rowsToInsert.push({
        species,
        status: (statusDb ?? 'Sano') as any,
        streetName,
        streetNumber,
        sidewalk: (sidewalkDb ?? null) as any,
        observations,
      })
    }
    // Inserción por lotes (más rápido que fila a fila)
    const insertBatches = async (data: typeof rowsToInsert) => {
      const CHUNK = 1000
      let total = 0
      for (let i = 0; i < data.length; i += CHUNK) {
        const chunk = data.slice(i, i + CHUNK)
        const res = await prisma.tree.createMany({ data: chunk })
        total += res.count
      }
      return total
    }

    if (replaceAll) {
      await prisma.$transaction(async (tx) => {
        await tx.tree.deleteMany({})
        // createMany no soporta tx a partir de prisma del closure, usamos tx.tree
        const CHUNK = 1000
        for (let i = 0; i < rowsToInsert.length; i += CHUNK) {
          const chunk = rowsToInsert.slice(i, i + CHUNK)
          const res = await tx.tree.createMany({ data: chunk })
          created += res.count
        }
      })
    } else {
      created = await insertBatches(rowsToInsert)
    }

    return new Response(JSON.stringify({ ok: true, created, skipped, duplicateSkipped, errors, mode: 'excel' }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al importar Excel', error: message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE() {
  try {
    await prisma.tree.deleteMany({})
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al eliminar árboles', error: message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}


