/**
 * Member data types and enums for Supabase integration
 * Used for frontend queries and type safety
 */

export enum MemberTier {
  EXPLORER = 'Explorer',
  PIONEER = 'Pioneer',
  VANGUARD = 'Vanguard',
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
}

export enum MemberRole {
  MEMBER = 'member',
  ADMIN = 'admin',
}

/**
 * Core Member type - represents a full member record from the database
 */
export interface Member {
  id: string;
  email: string;
  name: string;
  tier: MemberTier | string;
  status: MemberStatus | string;
  role: MemberRole | string;
  title: string | null;
  location: string | null;
  member_since: string | null; // ISO date string
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp
}

/**
 * MemberInsert - for creating new members (admin only)
 * Omits auto-generated fields: id, created_at, updated_at
 */
export type MemberInsert = Omit<Member, 'id' | 'created_at' | 'updated_at'>;

/**
 * MemberUpdate - for updating existing members (admin only)
 * All fields are optional except id
 */
export type MemberUpdate = Partial<Omit<Member, 'id' | 'created_at' | 'updated_at'>> & {
  id: string;
};

/**
 * MemberProfile - lightweight member info for UI display
 */
export interface MemberProfile {
  id: string;
  email: string;
  name: string;
  tier: MemberTier | string;
  title: string | null;
  location: string | null;
}

/**
 * MemberListItem - for list views with minimal data
 */
export interface MemberListItem {
  id: string;
  email: string;
  name: string;
  tier: MemberTier | string;
  status: MemberStatus | string;
  role: MemberRole | string;
  member_since: string | null;
}

/**
 * Type guard for MemberTier
 */
export function isMemberTier(value: unknown): value is MemberTier {
  return Object.values(MemberTier).includes(value as MemberTier);
}

/**
 * Type guard for MemberStatus
 */
export function isMemberStatus(value: unknown): value is MemberStatus {
  return Object.values(MemberStatus).includes(value as MemberStatus);
}

/**
 * Type guard for MemberRole
 */
export function isMemberRole(value: unknown): value is MemberRole {
  return Object.values(MemberRole).includes(value as MemberRole);
}
