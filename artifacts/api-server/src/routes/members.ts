import { Router, type IRouter, type Response } from "express";
import { eq, and, or, ilike, desc } from "drizzle-orm";
import { db, membersTable, insertMemberSchema } from "@workspace/db";
import { z, ZodError } from "zod/v4";

const router: IRouter = Router();

// ─── Error helpers ────────────────────────────────────────────────────────────

function isUniqueViolation(error: unknown): boolean {
  let e: unknown = error;
  while (e instanceof Error) {
    const msg = e.message.toLowerCase();
    if (msg.includes("unique") || msg.includes("23505")) return true;
    if ((e as unknown as { code?: string }).code === "23505") return true;
    e = (e as Error & { cause?: unknown }).cause;
  }
  return false;
}

function handleError(res: Response, error: unknown): Response {
  if (error instanceof ZodError) {
    const message = error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    return res
      .status(400)
      .json({ ok: false, error: { code: "VALIDATION_ERROR", message } });
  }
  if (isUniqueViolation(error)) {
    return res.status(400).json({
      ok: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "A member with this email already exists",
      },
    });
  }
  return res.status(500).json({
    ok: false,
    error: { code: "SERVER_ERROR", message: "An unexpected error occurred" },
  });
}

function toMember(row: typeof membersTable.$inferSelect) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    tier: row.tier,
    status: row.status,
    role: row.role,
    title: row.title ?? null,
    location: row.location ?? null,
    member_since: row.memberSince ?? null,
    created_at: row.createdAt.toISOString(),
    updated_at: row.updatedAt.toISOString(),
  };
}

// ─── Routes — stats and search MUST come before /:id ─────────────────────────

// GET /api/members/stats
router.get("/stats", async (req, res) => {
  try {
    const rows = await db
      .select({
        status: membersTable.status,
        tier: membersTable.tier,
        role: membersTable.role,
      })
      .from(membersTable);

    return res.json({
      ok: true,
      data: {
        totalMembers: rows.length,
        activeMembers: rows.filter((r) => r.status === "ACTIVE").length,
        pendingMembers: rows.filter((r) => r.status === "PENDING").length,
        suspendedMembers: rows.filter((r) => r.status === "SUSPENDED").length,
        adminCount: rows.filter((r) => r.role === "admin").length,
        tierBreakdown: {
          explorer: rows.filter((r) => r.tier === "Explorer").length,
          pioneer: rows.filter((r) => r.tier === "Pioneer").length,
          vanguard: rows.filter((r) => r.tier === "Vanguard").length,
        },
      },
    });
  } catch (e) {
    return handleError(res, e);
  }
});

// GET /api/members/search
const searchSchema = z.object({
  query: z.string().optional(),
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]).optional(),
  tier: z.enum(["Explorer", "Pioneer", "Vanguard"]).optional(),
  role: z.enum(["member", "admin"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

router.get("/search", async (req, res) => {
  try {
    const params = searchSchema.parse(req.query);
    const conditions = [];

    if (params.query) {
      const q = `%${params.query}%`;
      conditions.push(
        or(ilike(membersTable.name, q), ilike(membersTable.email, q)),
      );
    }
    if (params.status) conditions.push(eq(membersTable.status, params.status));
    if (params.tier) conditions.push(eq(membersTable.tier, params.tier));
    if (params.role) conditions.push(eq(membersTable.role, params.role));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [rows, allMatching] = await Promise.all([
      db
        .select({
          id: membersTable.id,
          email: membersTable.email,
          name: membersTable.name,
          tier: membersTable.tier,
          status: membersTable.status,
          role: membersTable.role,
          member_since: membersTable.memberSince,
        })
        .from(membersTable)
        .where(where)
        .orderBy(desc(membersTable.createdAt))
        .limit(params.limit)
        .offset(params.offset),
      db.select({ id: membersTable.id }).from(membersTable).where(where),
    ]);

    return res.json({ ok: true, data: { data: rows, total: allMatching.length } });
  } catch (e) {
    return handleError(res, e);
  }
});

// GET /api/members
router.get("/", async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(membersTable)
      .orderBy(desc(membersTable.createdAt));
    return res.json({ ok: true, data: rows.map(toMember) });
  } catch (e) {
    return handleError(res, e);
  }
});

// POST /api/members
router.post("/", async (req, res) => {
  try {
    const input = insertMemberSchema.parse(req.body);
    const [row] = await db.insert(membersTable).values(input).returning();
    return res.status(201).json({ ok: true, data: toMember(row) });
  } catch (e) {
    return handleError(res, e);
  }
});

// GET /api/members/:id
router.get("/:id", async (req, res) => {
  try {
    const [row] = await db
      .select()
      .from(membersTable)
      .where(eq(membersTable.id, req.params.id))
      .limit(1);
    if (!row) {
      return res
        .status(404)
        .json({ ok: false, error: { code: "NOT_FOUND", message: "Member not found" } });
    }
    return res.json({ ok: true, data: toMember(row) });
  } catch (e) {
    return handleError(res, e);
  }
});

// PUT /api/members/:id
const updateSchema = z.object({
  email: z.email().optional(),
  name: z.string().min(1).optional(),
  tier: z.enum(["Explorer", "Pioneer", "Vanguard"]).optional(),
  status: z.enum(["ACTIVE", "PENDING", "SUSPENDED"]).optional(),
  role: z.enum(["member", "admin"]).optional(),
  title: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  member_since: z.string().nullable().optional(),
});

router.put("/:id", async (req, res) => {
  try {
    const input = updateSchema.parse(req.body);
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input.email !== undefined) updates.email = input.email;
    if (input.name !== undefined) updates.name = input.name;
    if (input.tier !== undefined) updates.tier = input.tier;
    if (input.status !== undefined) updates.status = input.status;
    if (input.role !== undefined) updates.role = input.role;
    if (input.title !== undefined) updates.title = input.title;
    if (input.location !== undefined) updates.location = input.location;
    if (input.member_since !== undefined) updates.memberSince = input.member_since;

    const [row] = await db
      .update(membersTable)
      .set(updates)
      .where(eq(membersTable.id, req.params.id))
      .returning();

    if (!row) {
      return res
        .status(404)
        .json({ ok: false, error: { code: "NOT_FOUND", message: "Member not found" } });
    }
    return res.json({ ok: true, data: toMember(row) });
  } catch (e) {
    return handleError(res, e);
  }
});

// DELETE /api/members/:id
router.delete("/:id", async (req, res) => {
  try {
    const [row] = await db
      .delete(membersTable)
      .where(eq(membersTable.id, req.params.id))
      .returning({ id: membersTable.id });
    if (!row) {
      return res
        .status(404)
        .json({ ok: false, error: { code: "NOT_FOUND", message: "Member not found" } });
    }
    return res.json({ ok: true, data: { id: row.id } });
  } catch (e) {
    return handleError(res, e);
  }
});

export default router;
