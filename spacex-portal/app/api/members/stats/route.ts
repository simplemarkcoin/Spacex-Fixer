import { NextResponse } from 'next/server'
import { getMemberStats } from '@/backend/members'
import { httpStatus } from '@/backend/errors'

export async function GET() {
  const result = await getMemberStats()
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result }, { status: httpStatus(result.code) })
  }
  return NextResponse.json({ ok: true, data: result.data })
}
