import { prisma } from '../server/db/prisma'
import { z } from 'zod'
import { createSectorSchema, updateSectorSchema } from '../validations'

const coordinateSchema = z.object({ lat: z.number(), lng: z.number() })
const sectorSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['Poda', 'Corte de pasto']),
  status: z.enum(['pendiente', 'en proceso', 'completado']),
  path: z.array(coordinateSchema),
  direccion: z.string().optional().nullable(),
  observaciones: z.string().optional().nullable(),
})

export type SectorDTO = z.infer<typeof sectorSchema>

function mapStatusToUi(status: string): SectorDTO['status'] {
  if (status === 'en_proceso') return 'en proceso'
  if (status === 'pendiente' || status === 'completado') return status
  return 'pendiente'
}

function mapTypeToUi(type: string): SectorDTO['type'] {
  return type === 'Corte_de_pasto' ? 'Corte de pasto' : 'Poda'
}

export async function listSectors(): Promise<SectorDTO[]> {
  const rows = await prisma.sector.findMany({ orderBy: { name: 'asc' } })
  const mapped = rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: mapTypeToUi(r.type as unknown as string),
    status: mapStatusToUi(r.status as unknown as string),
    path: (r.path as unknown as { lat: number; lng: number }[]) ?? [],
    direccion: r.direccion ?? undefined,
    observaciones: r.observaciones ?? undefined,
  }))
  // valida y limpia
  return mapped.map((m) => sectorSchema.parse(m))
}

function mapStatusToDb(status: SectorDTO['status']): 'pendiente' | 'en_proceso' | 'completado' {
  return status === 'en proceso' ? 'en_proceso' : status
}

function mapTypeToDb(type: SectorDTO['type']): 'Poda' | 'Corte_de_pasto' {
  return type === 'Corte de pasto' ? 'Corte_de_pasto' : 'Poda'
}

export async function createSector(input: unknown): Promise<SectorDTO> {
  const data = createSectorSchema.parse(input)
  const row = await prisma.sector.create({
    data: {
      id: (data as any).id ?? undefined,
      name: data.name,
      type: mapTypeToDb(data.type as any),
      status: mapStatusToDb(data.status as any),
      path: data.path as unknown as object,
      direccion: data.direccion ?? null,
      observaciones: data.observaciones ?? null,
    }
  })
  return {
    id: row.id,
    name: row.name,
    type: mapTypeToUi(row.type as any),
    status: mapStatusToUi(row.status as any),
    path: row.path as any,
    direccion: row.direccion ?? undefined,
    observaciones: row.observaciones ?? undefined,
  }
}

export async function updateSector(input: unknown): Promise<SectorDTO> {
  const data = updateSectorSchema.parse(input)
  const row = await prisma.sector.update({
    where: { id: data.id },
    data: {
      name: data.name ?? undefined,
      type: data.type ? mapTypeToDb(data.type as any) : undefined,
      status: data.status ? mapStatusToDb(data.status as any) : undefined,
      path: (data as any).path ?? undefined,
      direccion: data.direccion ?? undefined,
      observaciones: data.observaciones ?? undefined,
    }
  })
  return {
    id: row.id,
    name: row.name,
    type: mapTypeToUi(row.type as any),
    status: mapStatusToUi(row.status as any),
    path: row.path as any,
    direccion: row.direccion ?? undefined,
    observaciones: row.observaciones ?? undefined,
  }
}

export async function deleteSector(id: string): Promise<{ ok: true }> {
  const totalTasks = await prisma.task.count({ where: { sectorId: id } })
  if (totalTasks > 0) {
    throw new Error('No se puede eliminar: el sector tiene tareas asociadas')
  }
  await prisma.sector.delete({ where: { id } })
  return { ok: true }
}


