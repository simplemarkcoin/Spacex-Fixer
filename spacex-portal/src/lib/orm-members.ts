import { desc, eq, ilike } from 'drizzle-orm';

import { db } from '../db';
import { members } from '../db/schema';
import type { Member, MemberInsert, MemberListItem, MemberProfile } from '../types/member';

function toMember(row: typeof members.$inferSelect): Member {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    tier: row.tier,
    status: row.status,
    role: row.role,
    title: row.title,
    location: row.location,
    member_since: row.memberSince,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

export async function ormGetMemberByEmail(email: string): Promise<Member | null> {
  const [row] = await db.select().from(members).where(eq(members.email, email)).limit(1);
  return row ? toMember(row) : null;
}

export async function ormListMembers(): Promise<MemberListItem[]> {
  const rows = await db
    .select({
      id: members.id,
      email: members.email,
      name: members.name,
      tier: members.tier,
      status: members.status,
      role: members.role,
      member_since: members.memberSince,
    })
    .from(members)
    .orderBy(desc(members.createdAt));

  return rows as MemberListItem[];
}

export async function ormCreateMember(input: MemberInsert): Promise<Member> {
  const [row] = await db
    .insert(members)
    .values({
      email: input.email,
      name: input.name,
      tier: input.tier,
      status: input.status,
      role: input.role,
      title: input.title,
      location: input.location,
      memberSince: input.member_since,
    })
    .returning();

  return toMember(row);
}

export async function ormUpdateMember(id: string, input: Partial<MemberInsert>): Promise<Member> {
  const [row] = await db
    .update(members)
    .set({
      email: input.email,
      name: input.name,
      tier: input.tier,
      status: input.status,
      role: input.role,
      title: input.title,
      location: input.location,
      memberSince: input.member_since,
      updatedAt: new Date(),
    })
    .where(eq(members.id, id))
    .returning();

  return toMember(row);
}

export async function ormDeleteMember(id: string): Promise<void> {
  await db.delete(members).where(eq(members.id, id));
}

export async function ormSearchMembers(query: string): Promise<MemberListItem[]> {
  if (!query.trim()) {
    return [];
  }

  const search = `%${query.toLowerCase()}%`;

  const rows = await db
    .select({
      id: members.id,
      email: members.email,
      name: members.name,
      tier: members.tier,
      status: members.status,
      role: members.role,
      member_since: members.memberSince,
    })
    .from(members)
    .where(ilike(members.name, search).or(ilike(members.email, search)))
    .orderBy(members.name);

  return rows as MemberListItem[];
}

export async function ormGetMemberProfile(memberId: string): Promise<MemberProfile | null> {
  const [row] = await db
    .select({
      id: members.id,
      email: members.email,
      name: members.name,
      tier: members.tier,
      title: members.title,
      location: members.location,
    })
    .from(members)
    .where(eq(members.id, memberId))
    .limit(1);

  return row ?? null;
}
