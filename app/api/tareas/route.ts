import { listTasks, listTasksPage, createTask, updateTask, deleteTask, finishTask, startTask, listTaskHistory, seedTaskHistoryCycles } from '../../../src/services/tasks'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const historySectorId = searchParams.get('historySectorId')
    if (historySectorId) {
      // Devolver historial completo de todas las tareas del sector, agrupado por tarea
      // Para mantener compatibilidad, devolvemos un arreglo de ciclos por tarea
      const { prisma } = await import('../../../src/server/db/prisma')
      // Tareas del sector, más recientes primero
      const tasks = await prisma.task.findMany({ where: { sectorId: historySectorId }, orderBy: { startDate: 'desc' } })
      const taskIds = tasks.map(t => t.id)
      const histories = taskIds.length
        ? await prisma.taskHistory.findMany({ where: { taskId: { in: taskIds } }, orderBy: { createdAt: 'desc' } })
        : []
      const items = tasks.map(t => ({
        task: {
          id: t.id,
          sectorId: t.sectorId,
          sectorName: t.sectorName,
          type: t.type,
          status: t.status,
          startDate: t.startDate,
          endDate: t.endDate,
          assignedWorkerId: t.assignedWorkerId,
          assignedWorkerName: t.assignedWorkerName,
          observations: t.observations,
        },
        history: histories
          .filter(h => h.taskId === t.id)
          .map(h => ({ id: h.id, eventType: h.eventType, message: h.message, createdAt: h.createdAt }))
      }))
      return new Response(JSON.stringify(items), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const historyTaskId = searchParams.get('historyTaskId')
    if (historyTaskId) {
      const history = await listTaskHistory(historyTaskId)
      return new Response(JSON.stringify(history), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    // Endpoint de utilería: /api/tareas?seedCycles=10
    const seedCycles = searchParams.get('seedCycles')
    if (seedCycles) {
      const num = Math.min(50, Math.max(1, Number(seedCycles)))
      const res = await seedTaskHistoryCycles(num)
      return new Response(JSON.stringify(res), { status: 200, headers: { 'content-type': 'application/json' } })
    }
    const hasParams = ['page','pageSize','text','status','type','sectorId','workerId','dateFrom','dateTo'].some((p) => searchParams.has(p))
    if (hasParams) {
      const page = Number(searchParams.get('page') || '1')
      const pageSize = Number(searchParams.get('pageSize') || '20')
      const text = searchParams.get('text') || undefined
      const status = (searchParams.get('status') || undefined) as any
      const type = (searchParams.get('type') || undefined) as any
      const sectorId = searchParams.get('sectorId') || undefined
      const workerId = searchParams.get('workerId') || undefined
      const dateFrom = searchParams.get('dateFrom') || undefined
      const dateTo = searchParams.get('dateTo') || undefined
      const resp = await listTasksPage({ page, pageSize, text, status, type, sectorId, workerId, dateFrom, dateTo })
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }
    const tasks = await listTasks()
    return new Response(JSON.stringify(tasks), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al obtener tareas', error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await createTask(body)
    return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al crear tarea', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const updated = await updateTask(body)
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al actualizar tarea', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    // Si trae endDate -> finalizar; si trae startDate -> iniciar
    const payload = body as { id: string; endDate?: string; startDate?: string }
    const result = payload.endDate ? await finishTask(body) : await startTask(body)
    return new Response(JSON.stringify(result), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al actualizar estado de tarea', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ message: 'Falta id' }), { status: 400 })
    const res = await deleteTask(id)
    return new Response(JSON.stringify(res), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al eliminar tarea', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}


