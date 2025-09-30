import { prisma } from '../server/db/prisma'
import { z } from 'zod'
import { createSectorSchema, updateSectorSchema } from '../validations'
import { mapSectorStatusToUi, mapSectorStatusToDb, mapSectorTypeToUi, mapSectorTypeToDb } from '@/src/utils/status'

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

function mapStatusToUi(status: string): SectorDTO['status'] { return mapSectorStatusToUi(status) }
function mapTypeToUi(type: string): SectorDTO['type'] { return mapSectorTypeToUi(type) }

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

export interface ListSectorsPageParams {
  page?: number
  pageSize?: number
  name?: string
  type?: SectorDTO['type'] | 'todos'
  status?: SectorDTO['status'] | 'todos'
  direccion?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export async function listSectorsPage(params: ListSectorsPageParams): Promise<PaginatedResponse<SectorDTO>> {
  const page = Math.max(1, Math.floor(params.page ?? 1))
  const pageSize = Math.min(100, Math.max(1, Math.floor(params.pageSize ?? 20)))

  const where: Parameters<typeof prisma.sector.findMany>[0]['where'] = {}
  if (params.name && params.name.trim() !== '') {
    where.name = { contains: params.name.trim(), mode: 'insensitive' }
  }
  if (params.type && params.type !== 'todos') {
    where.type = mapSectorTypeToDb(params.type)
  }
  if (params.status && params.status !== 'todos') {
    where.status = mapSectorStatusToDb(params.status)
  }
  if (params.direccion && params.direccion.trim() !== '') {
    where.direccion = { contains: params.direccion.trim(), mode: 'insensitive' }
  }

  const total = await prisma.sector.count({ where })
  const rows = await prisma.sector.findMany({
    where,
    orderBy: { name: 'asc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
  })

  const items = rows.map((r) => sectorSchema.parse({
    id: r.id,
    name: r.name,
    type: mapTypeToUi(r.type as unknown as string),
    status: mapStatusToUi(r.status as unknown as string),
    path: (r.path as unknown as { lat: number; lng: number }[]) ?? [],
    direccion: r.direccion ?? undefined,
    observaciones: r.observaciones ?? undefined,
  }))

  return { items, total, page, pageSize }
}

function mapStatusToDb(status: SectorDTO['status']): 'pendiente' | 'en_proceso' | 'completado' { return mapSectorStatusToDb(status) }
function mapTypeToDb(type: SectorDTO['type']): 'Poda' | 'Corte_de_pasto' { return mapSectorTypeToDb(type) }

export async function createSector(input: unknown): Promise<SectorDTO> {
  const data = createSectorSchema.parse(input)
  const row = await prisma.sector.create({
    data: {
      id: (data as { id?: string }).id ?? undefined,
      name: data.name,
      type: mapTypeToDb(data.type),
      status: mapStatusToDb(data.status),
      path: data.path as unknown as object,
      direccion: data.direccion ?? null,
      observaciones: data.observaciones ?? null,
    }
  })

  // Crear tarea 1:1 asociada al sector recién creado (pendiente, sin iniciar)
  try {
    // Asegurar trabajador "Sin asignar"
    let unassigned = await prisma.worker.findFirst({ where: { name: 'Sin asignar' } })
    if (!unassigned) {
      unassigned = await prisma.worker.create({ data: { name: 'Sin asignar', observaciones: null } })
    }
    // Crear tarea base (status pendiente). Usamos la fecha de hoy como startDate base.
    const today = new Date()
    await prisma.task.create({
      data: {
        sectorId: row.id,
        sectorName: row.name,
        type: row.type === 'Corte_de_pasto' ? 'Corte de pasto' : 'Poda',
        status: 'pendiente',
        startDate: new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())),
        endDate: null,
        assignedWorkerId: unassigned.id,
        assignedWorkerName: unassigned.name,
        observations: null,
      }
    })
  } catch (e) {
    // No interrumpir la creación del sector si falla la tarea; loguear en servidor
    console.error('No se pudo crear la tarea inicial del sector', e)
  }
  return {
    id: row.id,
    name: row.name,
    type: mapTypeToUi(row.type as unknown as string),
    status: mapStatusToUi(row.status as unknown as string),
    path: row.path as unknown as { lat: number; lng: number }[],
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
      type: data.type ? mapTypeToDb(data.type) : undefined,
      status: data.status ? mapStatusToDb(data.status) : undefined,
      path: (data as { path?: { lat: number; lng: number }[] }).path ?? undefined,
      direccion: data.direccion ?? undefined,
      observaciones: data.observaciones ?? undefined,
    }
  })
  // Mantener coherencia: si cambió el tipo del sector, propagarlo a sus tareas
  try {
    if (data.type) {
      await prisma.task.updateMany({
        where: { sectorId: row.id },
        data: { type: data.type },
      })
    }
  } catch {}
  return {
    id: row.id,
    name: row.name,
    type: mapTypeToUi(row.type as unknown as string),
    status: mapStatusToUi(row.status as unknown as string),
    path: row.path as unknown as { lat: number; lng: number }[],
    direccion: row.direccion ?? undefined,
    observaciones: row.observaciones ?? undefined,
  }
}

export async function deleteSector(id: string): Promise<{ ok: true }> {
  // Al eliminar un sector, eliminamos en cascada sus tareas asociadas
  await prisma.task.deleteMany({ where: { sectorId: id } })
  await prisma.sector.delete({ where: { id } })
  return { ok: true }
}

// Utilidad: sincronizar tipos de tareas con el tipo del sector correspondiente
export async function syncAllTaskTypesWithSectors(): Promise<{ ok: true; updated: number }> {
  const sectors = await prisma.sector.findMany()
  let updated = 0
  for (const s of sectors) {
    const newType = s.type === 'Corte_de_pasto' ? 'Corte de pasto' : 'Poda'
    const res = await prisma.task.updateMany({ where: { sectorId: s.id }, data: { type: newType } })
    updated += res.count
  }
  return { ok: true, updated }
}


