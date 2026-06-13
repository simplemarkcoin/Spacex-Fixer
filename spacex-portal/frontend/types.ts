/**
 * Shared TypeScript types used by both API responses and client-side code.
 * These mirror the database shape but are safe to import in client components.
 */

export type MemberTier = 'Explorer' | 'Pioneer' | 'Vanguard'
export type MemberStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED'
export type MemberRole = 'member' | 'admin'

export interface Member {
  id: string
  email: string
  name: string
  tier: MemberTier
  status: MemberStatus
  role: MemberRole
  title: string | null
  location: string | null
  member_since: string | null
  created_at: string
  updated_at: string
}

export interface MemberStats {
  totalMembers: number
  activeMembers: number
  pendingMembers: number
  suspendedMembers: number
  adminCount: number
  tierBreakdown: {
    explorer: number
    pioneer: number
    vanguard: number
  }
}

export interface CreateMemberPayload {
  email: string
  name: string
  tier?: MemberTier
  status?: MemberStatus
  role?: MemberRole
  title?: string | null
  location?: string | null
  member_since?: string | null
}

export interface UpdateMemberPayload {
  email?: string
  name?: string
  tier?: MemberTier
  status?: MemberStatus
  role?: MemberRole
  title?: string | null
  location?: string | null
  member_since?: string | null
}

export interface ApiOk<T> {
  ok: true
  data: T
}

export interface ApiError {
  ok: false
  error: { code: string; message: string }
}

export type ApiResult<T> = ApiOk<T> | ApiError
