import { NextRequest } from 'next/server'
import * as XLSX from 'xlsx'

export const runtime = 'nodejs'

function toStr(v: any) { return v === undefined || v === null ? '' : String(v) }
function trimSpaces(s: string) { return s.replace(/\s+/g, ' ').trim() }
function onlyDigits(s: string) { return (s.match(/\d+/g)?.join('') || '') }
function normalizeStreetNumber(v: any) { return onlyDigits(toStr(v)) }

function normalizeStatusUi(raw: any): 'Sano' | 'Enfermo' | 'Necesita Poda' | 'Seco' | 'Recién Plantado' | 'Malo' | '' {
  const s = trimSpaces(toStr(raw)).toLowerCase()
  if (!s) return ''
  if (['sano'].includes(s)) return 'Sano'
  if (['enfermo'].includes(s)) return 'Enfermo'
  if (['necesita poda', 'necesita_poda', 'necesita  poda'].includes(s)) return 'Necesita Poda'
  if (['recien plantado', 'recién plantado', 'recien_plantado'].includes(s)) return 'Recién Plantado'
  if (['seco'].includes(s)) return 'Seco'
  if (['malo'].includes(s)) return 'Malo'
  return ''
}
function normalizeSidewalkUi(raw: any): 'Norte' | 'Sur' | 'Este' | 'Oeste' | 'Ambas' | 'Ninguna' | '' {
  const s = trimSpaces(toStr(raw)).toLowerCase()
  if (!s) return ''
  if (['n', 'norte'].includes(s)) return 'Norte'
  if (['s', 'sur'].includes(s)) return 'Sur'
  if (['e', 'este'].includes(s)) return 'Este'
  if (['o', 'oeste'].includes(s)) return 'Oeste'
  if (['ambas', 'ambos', 'ambas veredas', 'ambos lados'].includes(s)) return 'Ambas'
  if (['ninguna', 'ninguno', 'na', 'n/a'].includes(s)) return 'Ninguna'
  return ''
}
function getField(row: any, aliases: string[]) {
  for (const a of aliases) {
    if (a in row) return row[a]
    const key = Object.keys(row).find(k => k.toLowerCase() === a.toLowerCase())
    if (key) return row[key]
  }
  return ''
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') || ''
  if (!contentType.includes('multipart/form-data')) {
    return new Response(JSON.stringify({ message: 'Se requiere multipart/form-data' }), { status: 400 })
  }
  const form = await req.formData()
  const file = form.get('file') as File | null
  if (!file) return new Response(JSON.stringify({ message: 'Archivo no proporcionado' }), { status: 400 })

  const arrayBuffer = await file.arrayBuffer()
  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<any>(sheet, { defval: '' })

  // 1) Normalizar filas
  const normalized = rows.map((r, idx) => {
    const species = trimSpaces(toStr(getField(r, ['Especie', 'species', 'Species'])))
    const streetNameRaw = trimSpaces(toStr(getField(r, ['Calle', 'streetName', 'Street', 'StreetName'])))
    const streetName = streetNameRaw
    const streetNumber = normalizeStreetNumber(getField(r, ['Altura', 'streetNumber', 'StreetNumber', 'Alt']))
    const status = normalizeStatusUi(getField(r, ['Estado', 'status', 'Status']))
    const sidewalk = normalizeSidewalkUi(getField(r, ['Vereda', 'sidewalk', 'Sidewalk', 'Side']))
    const observations = trimSpaces(toStr(getField(r, ['Observacion', 'Observaciones', 'observations', 'Notes']))) || ''
    return { __row: idx + 2, species, streetName, streetNumber, status, sidewalk, observations }
  }).filter(r => r.species && r.streetName && r.streetNumber)

  // Invalid rows (faltan campos clave)
  const invalids: Array<{ row: number; reason: string }> = []
  rows.forEach((r, idx) => {
    const species = trimSpaces(toStr(getField(r, ['Especie', 'species', 'Species'])))
    const streetName = trimSpaces(toStr(getField(r, ['Calle', 'streetName', 'Street', 'StreetName'])))
    const streetNumber = normalizeStreetNumber(getField(r, ['Altura', 'streetNumber', 'StreetNumber', 'Alt']))
    if (!species || !streetName || !streetNumber) invalids.push({ row: idx + 2, reason: 'Faltan Especie/Calle/Altura' })
  })

  // 2) Sugerencias de unificación de calles (similaridad)
  const streetNames = Array.from(new Set(normalized.map(r => r.streetName))).sort()
  const suggestions: Array<{ canonical: string; variants: string[]; details: Array<{ name: string; count: number; score: number }> }> = []
  const used = new Set<string>()
  function similarity(a: string, b: string) {
    // Similaridad simple: Jaccard sobre bigramas
    const grams = (s: string) => {
      const t = s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
      const arr = [] as string[]
      for (let i = 0; i < t.length - 1; i++) arr.push(t.slice(i, i + 2))
      return new Set(arr)
    }
    const A = grams(a), B = grams(b)
    const inter = new Set([...A].filter(x => B.has(x)))
    const union = new Set([...A, ...B])
    return union.size === 0 ? 0 : inter.size / union.size
  }
  for (let i = 0; i < streetNames.length; i++) {
    const a = streetNames[i]
    if (used.has(a)) continue
    const group = [a]
    for (let j = i + 1; j < streetNames.length; j++) {
      const b = streetNames[j]
      if (used.has(b)) continue
      const score = similarity(a, b)
      if (score >= 0.85) group.push(b)
    }
    group.forEach(g => used.add(g))
    if (group.length > 1) {
      const counts = (name: string) => normalized.filter(r => r.streetName === name).length
      const details = group.map(name => ({ name, count: counts(name), score: similarity(a, name) }))
      suggestions.push({ canonical: a, variants: group, details })
    }
  }

  // 3) Duplicados exactos por clave
  const dupMap = new Map<string, number>()
  for (const r of normalized) {
    const key = `${r.streetName}|${r.streetNumber}|${r.species}|${r.sidewalk || ''}`
    dupMap.set(key, (dupMap.get(key) || 0) + 1)
  }
  const duplicates = Array.from(dupMap.entries())
    .filter(([_, c]) => c > 1)
    .map(([key, count]) => {
      const [streetName, streetNumber, species, sidewalk] = key.split('|')
      return { streetName, streetNumber, species, sidewalk, count }
    })
    .sort((a, b) => b.count - a.count)

  return new Response(JSON.stringify({ rows: normalized, suggestions, duplicates, invalids }), { status: 200, headers: { 'content-type': 'application/json' } })
}


