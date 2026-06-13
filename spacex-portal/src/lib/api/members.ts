/**
 * Members API Helpers
 * 
 * Clean, predictable Supabase query helpers for member operations.
 * All functions return ApiResponse<T> (either success or failure).
 * Errors are caught and converted to clean JSON-style failures.
 */

import { Member, MemberInsert, MemberUpdate, MemberStatus, MemberTier } from '../../types/member';
import { supabase } from './../supabase';
import { success, failure, ApiResponse } from './response';
import { API_ERRORS } from './errors';
import {
  createMemberSchema,
  updateMemberSchema,
  searchMembersSchema,
  CreateMemberInput,
  UpdateMemberInput,
  SearchMembersInput,
} from './validation';
import { ZodError } from 'zod';

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert Zod validation errors to a readable message
 */
function formatValidationErrors(error: ZodError): string {
  const messages = error.issues.map((issue) => {
    const path = issue.path.join('.');
    return `${path}: ${issue.message}`;
  });
  return messages.join('; ');
}

/**
 * Handle Supabase errors and return clean API failures
 */
function handleSupabaseError(error: unknown): ApiFailure {
  const message = error instanceof Error ? error.message : String(error ?? 'An unexpected error occurred');
  const normalizedMessage = message.toLowerCase();
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? Number((error as { status?: number }).status)
    : undefined;
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String((error as { code?: string }).code)
    : undefined;

  if (
    status === 401 ||
    status === 403 ||
    code === '42501' ||
    code === 'PGRST301' ||
    normalizedMessage.includes('permission denied') ||
    normalizedMessage.includes('row level security') ||
    normalizedMessage.includes('forbidden')
  ) {
    return failure(
      API_ERRORS.FORBIDDEN,
      'You do not have permission to perform this action. Sign in as an admin user first.'
    );
  }

  if (normalizedMessage.includes('unique violation') || code === '23505') {
    return failure(API_ERRORS.VALIDATION_ERROR, 'A member with this email already exists');
  }

  if (normalizedMessage.includes('not found') || code === 'PGRST116') {
    return failure(API_ERRORS.NOT_FOUND, 'Member not found');
  }

  return failure(API_ERRORS.DATABASE_ERROR, message);
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER QUERIES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get the current authenticated member by email
 */
export async function getCurrentMember(email: string): Promise<ApiResponse<Member>> {
  try {
    if (!email) {
      return failure(API_ERRORS.VALIDATION_ERROR, 'Email is required');
    }

    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return failure(API_ERRORS.NOT_FOUND, 'Member not found');
      }
      return handleSupabaseError(error);
    }

    return success(data as Member);
  } catch (error) {
    return handleSupabaseError(error);
  }
}

/**
 * List all members (admin only)
 */
export async function listMembers(): Promise<ApiResponse<Member[]>> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return handleSupabaseError(error);
    }

    return success((data || []) as Member[]);
  } catch (error) {
    return handleSupabaseError(error);
  }
}

/**
 * Search and filter members (admin only)
 */
export async function searchMembers(
  params: SearchMembersInput
): Promise<ApiResponse<{ data: Member[]; total: number }>> {
  try {
    // Validate input
    const validated = searchMembersSchema.parse(params);

    let query = supabase.from('members').select('*', { count: 'exact' });

    // Apply filters
    if (validated.query) {
      // Search by name or email
      query = query.or(
        `name.ilike.%${validated.query}%,email.ilike.%${validated.query}%`
      );
    }

    if (validated.status) {
      query = query.eq('status', validated.status);
    }

    if (validated.tier) {
      query = query.eq('tier', validated.tier);
    }

    if (validated.role) {
      query = query.eq('role', validated.role);
    }

    // Apply pagination
    const limit = validated.limit || 50;
    const offset = validated.offset || 0;
    query = query.range(offset, offset + limit - 1);

    // Sort
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      return handleSupabaseError(error);
    }

    return success({
      data: (data || []) as Member[],
      total: count || 0,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return failure(API_ERRORS.VALIDATION_ERROR, formatValidationErrors(error));
    }
    return handleSupabaseError(error);
  }
}

/**
 * Create a new member (admin only)
 */
export async function createMember(input: MemberInsert): Promise<ApiResponse<Member>> {
  try {
    // Validate input
    const validated = createMemberSchema.parse(input);

    const { data, error } = await supabase
      .from('members')
      .insert([validated])
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error);
    }

    return success(data as Member);
  } catch (error) {
    if (error instanceof ZodError) {
      return failure(API_ERRORS.VALIDATION_ERROR, formatValidationErrors(error));
    }
    return handleSupabaseError(error);
  }
}

/**
 * Update an existing member (admin only)
 */
export async function updateMember(
  id: string,
  input: MemberUpdate
): Promise<ApiResponse<Member>> {
  try {
    // Validate ID
    if (!id) {
      return failure(API_ERRORS.VALIDATION_ERROR, 'Member ID is required');
    }

    // Validate input
    const validated = updateMemberSchema.parse(input);

    const { data, error } = await supabase
      .from('members')
      .update(validated)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleSupabaseError(error);
    }

    if (!data) {
      return failure(API_ERRORS.NOT_FOUND, 'Member not found');
    }

    return success(data as Member);
  } catch (error) {
    if (error instanceof ZodError) {
      return failure(API_ERRORS.VALIDATION_ERROR, formatValidationErrors(error));
    }
    return handleSupabaseError(error);
  }
}

/**
 * Delete a member (admin only)
 */
export async function deleteMember(id: string): Promise<ApiResponse<{ id: string }>> {
  try {
    // Validate ID
    if (!id) {
      return failure(API_ERRORS.VALIDATION_ERROR, 'Member ID is required');
    }

    const { error } = await supabase.from('members').delete().eq('id', id);

    if (error) {
      return handleSupabaseError(error);
    }

    return success({ id });
  } catch (error) {
    return handleSupabaseError(error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MEMBER STATS
// ═══════════════════════════════════════════════════════════════════════════

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  suspendedMembers: number;
  adminCount: number;
  tierBreakdown: {
    explorer: number;
    pioneer: number;
    vanguard: number;
  };
}

/**
 * Get member statistics (admin only)
 */
export async function getMemberStats(): Promise<ApiResponse<MemberStats>> {
  try {
    // Get all members
    const { data, error } = await supabase
      .from('members')
      .select('status, tier, role');

    if (error) {
      return handleSupabaseError(error);
    }

    if (!data) {
      return success({
        totalMembers: 0,
        activeMembers: 0,
        pendingMembers: 0,
        suspendedMembers: 0,
        adminCount: 0,
        tierBreakdown: {
          explorer: 0,
          pioneer: 0,
          vanguard: 0,
        },
      });
    }

    // Calculate stats
    const stats: MemberStats = {
      totalMembers: data.length,
      activeMembers: data.filter((m) => m.status === MemberStatus.ACTIVE).length,
      pendingMembers: data.filter((m) => m.status === MemberStatus.PENDING).length,
      suspendedMembers: data.filter((m) => m.status === MemberStatus.SUSPENDED).length,
      adminCount: data.filter((m) => m.role === 'admin').length,
      tierBreakdown: {
        explorer: data.filter((m) => m.tier === MemberTier.EXPLORER).length,
        pioneer: data.filter((m) => m.tier === MemberTier.PIONEER).length,
        vanguard: data.filter((m) => m.tier === MemberTier.VANGUARD).length,
      },
    };

    return success(stats);
  } catch (error) {
    return handleSupabaseError(error);
  }
}

// Type export for convenience
type ApiFailure = ReturnType<typeof failure>;
