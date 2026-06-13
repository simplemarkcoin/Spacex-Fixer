/**
 * Zod schemas for validating API input.
 * Used by route handlers to parse and reject bad requests early.
 */

import { z } from 'zod'

export const createMemberSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  tier: z.enum(['Explorer', 'Pioneer', 'Vanguard']).default('Explorer'),
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']).default('ACTIVE'),
  role: z.enum(['member', 'admin']).default('member'),
  title: z.string().optional(),
  location: z.string().optional(),
  member_since: z.string().optional(),
})

export const updateMemberSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
  tier: z.enum(['Explorer', 'Pioneer', 'Vanguard']).optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']).optional(),
  role: z.enum(['member', 'admin']).optional(),
  title: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  member_since: z.string().nullable().optional(),
})

export const searchMembersSchema = z.object({
  query: z.string().optional(),
  status: z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']).optional(),
  tier: z.enum(['Explorer', 'Pioneer', 'Vanguard']).optional(),
  role: z.enum(['member', 'admin']).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>
// z.input gives the *before-parse* shape so fields with .default() are optional
export type SearchMembersInput = z.input<typeof searchMembersSchema>
