/**
 * Zod Validation Schemas
 * 
 * Validation schemas for member operations:
 * - Creating new members
 * - Updating existing members
 * - Searching/filtering members
 */

import { z } from 'zod';
import { MemberRole, MemberStatus, MemberTier } from '../../types/member';

/**
 * Email validation pattern (RFC 5322 simplified)
 */
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required')
  .max(254, 'Email is too long');

/**
 * Member tier enum validation
 */
const tierSchema = z
  .enum([MemberTier.EXPLORER, MemberTier.PIONEER, MemberTier.VANGUARD])
  .default(MemberTier.EXPLORER);

/**
 * Member status enum validation
 */
const statusSchema = z
  .enum([MemberStatus.ACTIVE, MemberStatus.PENDING, MemberStatus.SUSPENDED])
  .default(MemberStatus.PENDING);

/**
 * Member role enum validation
 */
const roleSchema = z
  .enum([MemberRole.MEMBER, MemberRole.ADMIN])
  .default(MemberRole.MEMBER);

/**
 * Schema for creating a new member
 * Used by admin to create members
 */
export const createMemberSchema = z.object({
  email: emailSchema,
  name: z.string().min(1, 'Name is required').max(255, 'Name is too long'),
  tier: tierSchema,
  status: statusSchema,
  role: roleSchema,
  title: z.string().max(255, 'Title is too long').nullable().optional(),
  location: z.string().max(255, 'Location is too long').nullable().optional(),
  member_since: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .nullable()
    .optional(),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;

/**
 * Schema for updating an existing member
 * All fields optional
 */
export const updateMemberSchema = z.object({
  email: emailSchema.optional(),
  name: z.string().min(1, 'Name must not be empty').max(255, 'Name is too long').optional(),
  tier: tierSchema.optional(),
  status: statusSchema.optional(),
  role: roleSchema.optional(),
  title: z.string().max(255, 'Title is too long').nullable().optional(),
  location: z.string().max(255, 'Location is too long').nullable().optional(),
  member_since: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .nullable()
    .optional(),
});

export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;

/**
 * Schema for search/filter parameters
 */
export const searchMembersSchema = z.object({
  query: z.string().max(255, 'Query is too long').optional(),
  status: statusSchema.optional(),
  tier: tierSchema.optional(),
  role: roleSchema.optional(),
  limit: z.number().int().positive().max(1000).default(50).optional(),
  offset: z.number().int().nonnegative().default(0).optional(),
});

export type SearchMembersInput = z.infer<typeof searchMembersSchema>;
