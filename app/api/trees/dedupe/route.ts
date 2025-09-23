import { prisma } from '../../../../src/server/db/prisma'

export const runtime = 'nodejs'

export async function POST() {
  try {
    const rows = await prisma.tree.findMany({
      select: { id: true, streetName: true, streetNumber: true, species: true, sidewalk: true },
      orderBy: { createdAt: 'asc' },
    })
    const seen = new Set<string>()
    const toDelete: string[] = []
    for (const r of rows) {
      const key = `${(r.streetName || '').trim().toLowerCase()}|${(r.streetNumber || '').trim()}|${(r.species || '').trim().toLowerCase()}|${(r.sidewalk || '')}`
      if (seen.has(key)) {
        toDelete.push(r.id)
      } else {
        seen.add(key)
      }
    }
    if (toDelete.length > 0) {
      await prisma.tree.deleteMany({ where: { id: { in: toDelete } } })
    }
    return new Response(JSON.stringify({ ok: true, deleted: toDelete.length }), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al eliminar duplicados', error: message }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}


