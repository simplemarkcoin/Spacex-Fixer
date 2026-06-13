/**
 * Client-side API helpers — thin fetch wrappers for each endpoint.
 *
 * Safe to import in 'use client' components and browser code.
 * No direct DB access here — all data goes through /api routes.
 */

import type {
  ApiResult,
  CreateMemberPayload,
  Member,
  MemberStats,
  UpdateMemberPayload,
} from './types'

const BASE = '/api/members'

async function apiFetch<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
    return (await res.json()) as ApiResult<T>
  } catch (e) {
    return {
      ok: false,
      error: { code: 'NETWORK_ERROR', message: e instanceof Error ? e.message : 'Network error' },
    }
  }
}

export function listMembers(): Promise<ApiResult<Member[]>> {
  return apiFetch<Member[]>(BASE)
}

export function getMember(id: string): Promise<ApiResult<Member>> {
  return apiFetch<Member>(`${BASE}/${id}`)
}

export function createMember(payload: CreateMemberPayload): Promise<ApiResult<Member>> {
  return apiFetch<Member>(BASE, { method: 'POST', body: JSON.stringify(payload) })
}

export function updateMember(id: string, payload: UpdateMemberPayload): Promise<ApiResult<Member>> {
  return apiFetch<Member>(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteMember(id: string): Promise<ApiResult<{ id: string }>> {
  return apiFetch<{ id: string }>(`${BASE}/${id}`, { method: 'DELETE' })
}

export function getMemberStats(): Promise<ApiResult<MemberStats>> {
  return apiFetch<MemberStats>(`${BASE}/stats`)
}

export function searchMembers(params: {
  query?: string
  status?: string
  tier?: string
  role?: string
  limit?: number
  offset?: number
}): Promise<ApiResult<{ data: Member[]; total: number }>> {
  const qs = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => [k, String(v)]),
  ).toString()
  return apiFetch<{ data: Member[]; total: number }>(`${BASE}/search${qs ? `?${qs}` : ''}`)
}
