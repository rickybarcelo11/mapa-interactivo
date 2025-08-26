import { PrismaClient, Status, SectorType, SidewalkSide, GeneralStatus, TreeStatus } from '@prisma/client'
import { streetsData, individualTreesData } from '../src/data/trees.data'
import { workersData } from '../src/data/workers.data'
import { sectorsData } from '../src/data/sectors.data'
import { tasksData } from '../src/data/tasks.data'

const prisma = new PrismaClient()

async function main() {
  // Limpiar en orden correcto por FK: Tasks -> Sectors -> Workers
  await prisma.task.deleteMany()
  await prisma.sector.deleteMany()
  await prisma.worker.deleteMany()

  // Workers
  await prisma.worker.createMany({
    data: workersData.map(w => ({ id: w.id, name: w.name, observaciones: w.observaciones ?? null }))
  })

  await Promise.all(sectorsData.map(s =>
    prisma.sector.create({
      data: {
        id: s.id,
        name: s.name,
        type: s.type === 'Poda' ? SectorType.Poda : SectorType.Corte_de_pasto,
        status: s.status === 'pendiente' ? Status.pendiente : s.status === 'en proceso' ? Status.en_proceso : Status.completado,
        path: s.path as unknown as object,
        direccion: s.direccion ?? null,
        observaciones: s.observaciones ?? null,
      }
    })
  ))

  // Tasks
  const sectorIds = new Set(sectorsData.map(s => s.id))
  const tasksToCreate = tasksData.filter(t => sectorIds.has(t.sectorId))
  await Promise.all(tasksToCreate.map(t =>
    prisma.task.create({
      data: {
        id: t.id,
        sectorId: t.sectorId,
        sectorName: t.sectorName,
        type: t.type,
        status: t.status === 'pendiente' ? Status.pendiente : t.status === 'en proceso' ? Status.en_proceso : Status.completado,
        startDate: new Date(t.startDate + 'T00:00:00.000Z'),
        endDate: t.endDate ? new Date(t.endDate + 'T00:00:00.000Z') : null,
        assignedWorkerId: t.assignedWorkerId,
        assignedWorkerName: t.assignedWorkerName,
        observations: t.observations || null,
      }
    })
  ))

  // Trees - StreetSections
  await prisma.streetSection.deleteMany()
  await prisma.tree.deleteMany()

  await Promise.all(streetsData.map(s =>
    prisma.streetSection.create({
      data: {
        id: s.id,
        streetName: s.name,
        addressRange: s.sections[0]?.addressRange ?? 'N/A',
        sidewalkSide: (s.sections[0]?.sidewalkSide ?? 'Norte') as SidewalkSide,
        predominantSpecies: s.sections[0]?.predominantSpecies ?? 'N/A',
        treeCount: s.sections[0]?.treeCount ?? 0,
        generalStatus: (s.sections[0]?.generalStatus ?? 'Bueno').replace('Necesita Intervención','Necesita_Intervencion') as GeneralStatus,
      }
    })
  ))

  await Promise.all(individualTreesData.map(t =>
    prisma.tree.create({
      data: {
        id: t.id,
        species: t.species,
        status: (t.status as any).replace('Recién Plantado','Recien_Plantado').replace('Necesita Poda','Necesita_Poda') as TreeStatus,
        streetName: t.streetName,
        streetNumber: t.streetNumber,
        sidewalk: (t.sidewalk as any) ?? null,
        location: (t.location as any) ?? null,
        plantingDate: t.plantingDate ? new Date(t.plantingDate + 'T00:00:00.000Z') : null,
        lastPruningDate: t.lastPruningDate ? new Date(t.lastPruningDate + 'T00:00:00.000Z') : null,
        observations: t.observations ?? null,
      }
    })
  ))
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })


