import type { StreetWithSections, IndividualTree } from '../types'
import { prisma } from '../server/db/prisma'

function toDateString(d: Date | null | undefined): string | undefined {
  if (!d) return undefined
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function mapGeneralStatusToUi(s: string): 'Bueno' | 'Regular' | 'Malo' | 'Necesita Intervención' {
  if (s === 'Necesita_Intervencion') return 'Necesita Intervención'
  return s as any
}

function mapTreeStatusToUi(s: string): 'Sano' | 'Enfermo' | 'Necesita Poda' | 'Seco' | 'Recién Plantado' | 'Malo' {
  if (s === 'Necesita_Poda') return 'Necesita Poda'
  if (s === 'Recien_Plantado') return 'Recién Plantado'
  return s as any
}

export async function listStreetSections(): Promise<StreetWithSections[]> {
  const sections = await prisma.streetSection.findMany({ orderBy: { updatedAt: 'desc' } })
  const grouped = sections.reduce<Record<string, StreetWithSections>>((acc, s) => {
    const key = s.streetName
    if (!acc[key]) acc[key] = { id: `street-${key}`, name: key, sections: [] as any }
    acc[key].sections.push({
      id: s.id,
      addressRange: s.addressRange,
      sidewalkSide: s.sidewalkSide as any,
      predominantSpecies: s.predominantSpecies,
      treeCount: s.treeCount,
      generalStatus: mapGeneralStatusToUi(s.generalStatus as any),
    } as any)
    return acc
  }, {})
  return Object.values(grouped)
}

export async function listIndividualTrees(): Promise<IndividualTree[]> {
  const rows = await prisma.tree.findMany({ orderBy: { createdAt: 'desc' } })
  return rows.map((r) => ({
    id: r.id,
    species: r.species,
    status: mapTreeStatusToUi(r.status as any),
    streetName: r.streetName,
    streetNumber: r.streetNumber,
    sidewalk: (r.sidewalk ?? undefined) as any,
    location: r.location as any,
    plantingDate: toDateString(r.plantingDate ?? undefined),
    lastPruningDate: toDateString(r.lastPruningDate ?? undefined),
    observations: r.observations ?? undefined,
  }))
}


