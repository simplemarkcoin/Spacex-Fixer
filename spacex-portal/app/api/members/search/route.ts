import { NextResponse } from 'next/server'
import { searchMembers } from '@/backend/members'
import { httpStatus } from '@/backend/errors'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const result = await searchMembers({
    query: searchParams.get('query') ?? undefined,
    status: (searchParams.get('status') as 'ACTIVE' | 'PENDING' | 'SUSPENDED') ?? undefined,
    tier: (searchParams.get('tier') as 'Explorer' | 'Pioneer' | 'Vanguard') ?? undefined,
    role: (searchParams.get('role') as 'member' | 'admin') ?? undefined,
    limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined,
    offset: searchParams.get('offset') ? Number(searchParams.get('offset')) : undefined,
  })

  if (!result.ok)
    return NextResponse.json(
      { ok: false, code: result.code, message: result.message },
      { status: httpStatus(result.code) },
    )
  return NextResponse.json({ ok: true, data: result.data })
}
