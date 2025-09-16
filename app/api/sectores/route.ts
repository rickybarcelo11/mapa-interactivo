import { listSectors, listSectorsPage, createSector, updateSector, deleteSector } from '../../../src/services/sectors'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const hasParams = ['page','pageSize','name','type','status','direccion'].some((p) => searchParams.has(p))
    if (hasParams) {
      const page = Number(searchParams.get('page') || '1')
      const pageSize = Number(searchParams.get('pageSize') || '20')
      const name = searchParams.get('name') || undefined
      const type = (searchParams.get('type') || undefined) as any
      const status = (searchParams.get('status') || undefined) as any
      const direccion = searchParams.get('direccion') || undefined
      const resp = await listSectorsPage({ page, pageSize, name, type, status, direccion })
      return new Response(JSON.stringify(resp), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      })
    }
    const sectors = await listSectors()
    return new Response(JSON.stringify(sectors), {
      status: 200,
      headers: { 'content-type': 'application/json' }
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al obtener sectores', error: message }), {
      status: 500,
      headers: { 'content-type': 'application/json' }
    })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await createSector(body)
    return new Response(JSON.stringify(created), { status: 201, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al crear sector', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const updated = await updateSector(body)
    return new Response(JSON.stringify(updated), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al actualizar sector', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return new Response(JSON.stringify({ message: 'Falta id' }), { status: 400 })
    const res = await deleteSector(id)
    return new Response(JSON.stringify(res), { status: 200, headers: { 'content-type': 'application/json' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ message: 'Error al eliminar sector', error: message }), { status: 400, headers: { 'content-type': 'application/json' } })
  }
}


