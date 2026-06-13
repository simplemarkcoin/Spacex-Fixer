import { NextResponse } from 'next/server'
import { getMember, updateMember, deleteMember } from '@/backend/members'
import { httpStatus } from '@/backend/errors'

type RouteContext = { params: { id: string } }

export async function GET(_: Request, { params }: RouteContext) {
  const result = await getMember(params.id)
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result }, { status: httpStatus(result.code) })
  }
  return NextResponse.json({ ok: true, data: result.data })
}

export async function PUT(request: Request, { params }: RouteContext) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const result = await updateMember(params.id, body as Parameters<typeof updateMember>[1])
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result }, { status: httpStatus(result.code) })
  }
  return NextResponse.json({ ok: true, data: result.data })
}

export async function DELETE(_: Request, { params }: RouteContext) {
  const result = await deleteMember(params.id)
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result }, { status: httpStatus(result.code) })
  }
  return NextResponse.json({ ok: true, data: result.data })
}
