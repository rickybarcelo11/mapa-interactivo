import { listWorkers, listWorkersPage, createWorker, updateWorker, deleteWorker } from '../../../src/services/workers'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hasParams = ['page','pageSize','name','hasActiveTasks'].some((p) => searchParams.has(p))
    if (hasParams) {
      const page = Number(searchParams.get('page') || '1')
      const pageSize = Number(searchParams.get('pageSize') || '20')
      const name = searchParams.get('name') || undefined
      const hasActiveTasks = searchParams.get('hasActiveTasks') === '1' || searchParams.get('hasActiveTasks') === 'true'
      const resp = await listWorkersPage({ page, pageSize, name, hasActiveTasks })
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }
    const workers = await listWorkers()
    return new Response(JSON.stringify(workers), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    console.error('GET /api/workers error:', error)
    const message = error instanceof Error ? error.message : String(error)
    const hasDbUrl = Boolean(process.env.DATABASE_URL)
    const isNeon = typeof process.env.DATABASE_URL === 'string' && process.env.DATABASE_URL.includes('neon.tech')
    return new Response(JSON.stringify({ message: 'Error al obtener trabajadores', error: message, hasDbUrl, isNeon }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await createWorker(body)
    return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al crear trabajador', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const updated = await updateWorker(body)
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al actualizar trabajador', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ message: 'Falta id' }), { status: 400 })
    const res = await deleteWorker(id)
    return new Response(JSON.stringify(res), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al eliminar trabajador', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}


