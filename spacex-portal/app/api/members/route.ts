import { NextResponse } from 'next/server'
import { listMembers, createMember } from '@/backend/members'
import { API_ERRORS, httpStatus } from '@/backend/errors'

export async function GET() {
  const result = await listMembers()
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result }, { status: httpStatus(result.code) })
  }
  return NextResponse.json({ ok: true, data: result.data })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: API_ERRORS.VALIDATION_ERROR, message: 'Invalid JSON body' } },
      { status: 400 },
    )
  }

  const result = await createMember(body as Parameters<typeof createMember>[0])
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result }, { status: httpStatus(result.code) })
  }
  return NextResponse.json({ ok: true, data: result.data }, { status: 201 })
}
