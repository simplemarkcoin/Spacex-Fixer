/**
 * Frontend query contract for member operations
 * All queries use RLS policies defined in Supabase
 * - Regular users can only see their own member record
 * - Admins can see and modify all member records
 */

import { supabase } from './supabase';
import { Member, MemberInsert, MemberUpdate, MemberListItem, MemberProfile } from '../types/member';

/**
 * Get the current authenticated user's member profile
 * Returns only the logged-in user's own record due to RLS
 */
export async function getCurrentMember(email: string): Promise<Member | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found (not an error)
      throw error;
    }

    return data as Member | null;
  } catch (error) {
    console.error('[queries] Error fetching current member:', error);
    throw error;
  }
}

/**
 * List all members (admin only due to RLS)
 * Returns empty array if user is not admin
 */
export async function listMembers(): Promise<MemberListItem[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('id,email,name,tier,status,role,member_since')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as MemberListItem[];
  } catch (error) {
    console.error('[queries] Error listing members:', error);
    throw error;
  }
}

/**
 * Create a new member (admin only due to RLS)
 * Returns the created member record
 */
export async function createMember(input: MemberInsert): Promise<Member> {
  try {
    const { data, error } = await supabase
      .from('members')
      .insert([input])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Member;
  } catch (error) {
    console.error('[queries] Error creating member:', error);
    throw error;
  }
}

/**
 * Update an existing member (admin only due to RLS)
 * Returns the updated member record
 */
export async function updateMember(id: string, input: Omit<MemberUpdate, 'id'>): Promise<Member> {
  try {
    const { data, error } = await supabase
      .from('members')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as Member;
  } catch (error) {
    console.error('[queries] Error updating member:', error);
    throw error;
  }
}

/**
 * Delete a member (admin only due to RLS)
 */
export async function deleteMember(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('members')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('[queries] Error deleting member:', error);
    throw error;
  }
}

/**
 * Search members by name or email (admin only due to RLS)
 * Returns matching member list items
 */
export async function searchMembers(query: string): Promise<MemberListItem[]> {
  try {
    if (!query.trim()) {
      return [];
    }

    const searchQuery = `%${query.toLowerCase()}%`;

    const { data, error } = await supabase
      .from('members')
      .select('id,email,name,tier,status,role,member_since')
      .or(`name.ilike.${searchQuery},email.ilike.${searchQuery}`)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    return data as MemberListItem[];
  } catch (error) {
    console.error('[queries] Error searching members:', error);
    throw error;
  }
}

/**
 * Get a member's public profile (minimal info)
 * Used for member profile pages and displays
 */
export async function getMemberProfile(memberId: string): Promise<MemberProfile | null> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('id,email,name,tier,title,location')
      .eq('id', memberId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data as MemberProfile | null;
  } catch (error) {
    console.error('[queries] Error fetching member profile:', error);
    throw error;
  }
}

/**
 * Count total members (admin only due to RLS)
 */
export async function getMemberCount(): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return count || 0;
  } catch (error) {
    console.error('[queries] Error getting member count:', error);
    throw error;
  }
}

/**
 * Get members by status (admin only due to RLS)
 */
export async function getMembersByStatus(status: string): Promise<MemberListItem[]> {
  try {
    const { data, error } = await supabase
      .from('members')
      .select('id,email,name,tier,status,role,member_since')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data as MemberListItem[];
  } catch (error) {
    console.error('[queries] Error fetching members by status:', error);
    throw error;
  }
}
