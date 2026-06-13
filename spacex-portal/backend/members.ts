/**
 * Member CRUD operations — the only place that talks to the database.
 *
 * All functions are server-only. Import from here in API route handlers (app/api/).
 * Never import this file in frontend/ or app/(pages) client components.
 */

import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { ZodError } from 'zod'

import { db } from './db'
import { members, type MemberRow } from './schema'
import { API_ERRORS, type ApiErrorCode } from './errors'
import {
  createMemberSchema,
  searchMembersSchema,
  updateMemberSchema,
  type CreateMemberInput,
  type SearchMembersInput,
  type UpdateMemberInput,
} from './validation'

// ─── Result type ─────────────────────────────────────────────────────────────

type Ok<T> = { ok: true; data: T }
type Err = { ok: false; code: ApiErrorCode; message: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> {
  return { ok: true, data }
}

function err(code: ApiErrorCode, message: string): Err {
  return { ok: false, code, message }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toMember(row: MemberRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    tier: row.tier as 'Explorer' | 'Pioneer' | 'Vanguard',
    status: row.status as 'ACTIVE' | 'PENDING' | 'SUSPENDED',
    role: row.role as 'member' | 'admin',
    title: row.title ?? null,
    location: row.location ?? null,
    member_since: row.memberSince ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  }
}

function isUniqueViolation(error: unknown): boolean {
  let e: unknown = error
  while (e instanceof Error) {
    const msg = e.message.toLowerCase()
    if (msg.includes('unique') || msg.includes('23505')) return true
    if ((e as unknown as { code?: string }).code === '23505') return true
    e = (e as Error & { cause?: unknown }).cause
  }
  return false
}

function handleError(error: unknown): Err {
  if (error instanceof ZodError) {
    const msg = error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')
    return err(API_ERRORS.VALIDATION_ERROR, msg)
  }
  if (isUniqueViolation(error)) {
    return err(API_ERRORS.VALIDATION_ERROR, 'A member with this email already exists')
  }
  return err(API_ERRORS.DATABASE_ERROR, 'An unexpected database error occurred')
}

// ─── Public API ───────────────────────────────────────────────────────────────

export type Member = ReturnType<typeof toMember>

export async function listMembers(): Promise<Result<Member[]>> {
  try {
    const rows = await db.select().from(members).orderBy(desc(members.createdAt))
    return ok(rows.map(toMember))
  } catch (e) {
    return handleError(e)
  }
}

export async function getMember(id: string): Promise<Result<Member>> {
  try {
    const [row] = await db.select().from(members).where(eq(members.id, id)).limit(1)
    if (!row) return err(API_ERRORS.NOT_FOUND, 'Member not found')
    return ok(toMember(row))
  } catch (e) {
    return handleError(e)
  }
}

export async function createMember(input: CreateMemberInput): Promise<Result<Member>> {
  try {
    const validated = createMemberSchema.parse(input)
    const [row] = await db
      .insert(members)
      .values({
        email: validated.email,
        name: validated.name,
        tier: validated.tier,
        status: validated.status,
        role: validated.role,
        title: validated.title ?? null,
        location: validated.location ?? null,
        memberSince: validated.member_since ?? null,
      })
      .returning()
    return ok(toMember(row))
  } catch (e) {
    return handleError(e)
  }
}

export async function updateMember(id: string, input: UpdateMemberInput): Promise<Result<Member>> {
  try {
    if (!id) return err(API_ERRORS.VALIDATION_ERROR, 'Member ID is required')
    const validated = updateMemberSchema.parse(input)
    const [row] = await db
      .update(members)
      .set({
        ...(validated.email !== undefined && { email: validated.email }),
        ...(validated.name !== undefined && { name: validated.name }),
        ...(validated.tier !== undefined && { tier: validated.tier }),
        ...(validated.status !== undefined && { status: validated.status }),
        ...(validated.role !== undefined && { role: validated.role }),
        ...(validated.title !== undefined && { title: validated.title }),
        ...(validated.location !== undefined && { location: validated.location }),
        ...(validated.member_since !== undefined && { memberSince: validated.member_since }),
        updatedAt: new Date(),
      })
      .where(eq(members.id, id))
      .returning()
    if (!row) return err(API_ERRORS.NOT_FOUND, 'Member not found')
    return ok(toMember(row))
  } catch (e) {
    return handleError(e)
  }
}

export async function deleteMember(id: string): Promise<Result<{ id: string }>> {
  try {
    if (!id) return err(API_ERRORS.VALIDATION_ERROR, 'Member ID is required')
    const [row] = await db.delete(members).where(eq(members.id, id)).returning({ id: members.id })
    if (!row) return err(API_ERRORS.NOT_FOUND, 'Member not found')
    return ok({ id: row.id })
  } catch (e) {
    return handleError(e)
  }
}

export async function searchMembers(
  params: SearchMembersInput,
): Promise<Result<{ data: Member[]; total: number }>> {
  try {
    const v = searchMembersSchema.parse(params)
    const limit = v.limit ?? 50
    const offset = v.offset ?? 0
    const conditions = []

    if (v.query) {
      const q = `%${v.query}%`
      conditions.push(or(ilike(members.name, q), ilike(members.email, q)))
    }
    if (v.status) conditions.push(eq(members.status, v.status))
    if (v.tier) conditions.push(eq(members.tier, v.tier))
    if (v.role) conditions.push(eq(members.role, v.role))

    const where = conditions.length > 0 ? and(...conditions) : undefined

    const [rows, countRows] = await Promise.all([
      db.select().from(members).where(where).orderBy(desc(members.createdAt)).limit(limit).offset(offset),
      db.select({ id: members.id }).from(members).where(where),
    ])

    return ok({ data: rows.map(toMember), total: countRows.length })
  } catch (e) {
    return handleError(e)
  }
}

export async function getMemberStats(): Promise<
  Result<{
    totalMembers: number
    activeMembers: number
    pendingMembers: number
    suspendedMembers: number
    adminCount: number
    tierBreakdown: { explorer: number; pioneer: number; vanguard: number }
  }>
> {
  try {
    const rows = await db
      .select({ status: members.status, tier: members.tier, role: members.role })
      .from(members)

    return ok({
      totalMembers: rows.length,
      activeMembers: rows.filter((r) => r.status === 'ACTIVE').length,
      pendingMembers: rows.filter((r) => r.status === 'PENDING').length,
      suspendedMembers: rows.filter((r) => r.status === 'SUSPENDED').length,
      adminCount: rows.filter((r) => r.role === 'admin').length,
      tierBreakdown: {
        explorer: rows.filter((r) => r.tier === 'Explorer').length,
        pioneer: rows.filter((r) => r.tier === 'Pioneer').length,
        vanguard: rows.filter((r) => r.tier === 'Vanguard').length,
      },
    })
  } catch (e) {
    return handleError(e)
  }
}
