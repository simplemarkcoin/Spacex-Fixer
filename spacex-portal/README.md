# SpaceX Member Portal MVP

A modern member portal application built with React 18, Vite, TypeScript, Tailwind CSS, and Supabase PostgreSQL.

## Project Status

**Phase 1: Database Setup** ✅ Complete
- Supabase PostgreSQL schema
- Row Level Security (RLS) policies
- TypeScript types and contracts
- Frontend query helpers

**Phase 2: UI Development** ⏳ Pending
- Login page (Supabase Auth)
- Member portal
- Admin dashboard

## Tech Stack

- **Frontend Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Components:** shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth (email OTP)

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- Supabase account (free tier ok)

### 1. Clone & Install

```bash
git clone <repo>
cd spacex-member-portal
pnpm install
```

### 2. Set Up Database

Use the SQL scripts in the sql/ folder in order:
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run SQL files in order (Supabase SQL Editor):
   - `sql/01-create-members-table.sql` - Create members table
   - `sql/02-create-update-trigger.sql` - Auto-update timestamps
   - `sql/03-create-rls-policies.sql` - Row Level Security policies
   - `sql/04-bootstrap-admin.sql` - Create first admin user
   - `sql/05-seed-sample-members.sql` - Load 12+ sample members (optional, for testing)
3. Copy `.env.example` → `.env.local` and fill in Supabase credentials

**For testing:** Run Step 5 to load realistic sample data (2 admins, 5 active members, 2 pending, 2 suspended).

### 3. Run Development Server

```bash
pnpm dev
```

Server runs on `http://localhost:5173`

### 4. Build for Production

```bash
pnpm build
pnpm preview
```

## Project Structure

```
/
├── src/
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client init
│   │   └── queries.ts         # Database query helpers
│   ├── types/
│   │   └── member.ts          # TypeScript types & enums
│   ├── components/            # React components (coming soon)
│   ├── pages/                 # Routes (coming soon)
│   └── App.tsx                # Root component
├── sql/
│   ├── 01-create-members-table.sql
│   ├── 02-create-update-trigger.sql
│   ├── 03-create-rls-policies.sql
│   ├── 04-bootstrap-admin.sql
│   └── 05-seed-sample-members.sql
├── DATABASE.md                # Database setup guide
├── .env.example               # Environment variables template
└── package.json
```

## Database Schema

### Members Table

| Field | Type | Constraint | Default |
|-------|------|-----------|---------|
| id | UUID | Primary Key | gen_random_uuid() |
| email | TEXT | Unique, Not Null | - |
| name | TEXT | Not Null | - |
| tier | TEXT | Enum: Explorer/Pioneer/Vanguard | Explorer |
| status | TEXT | Enum: ACTIVE/PENDING/SUSPENDED | ACTIVE |
| role | TEXT | Enum: member/admin | member |
| title | TEXT | Optional | NULL |
| location | TEXT | Optional | NULL |
| member_since | DATE | Optional | NULL |
| created_at | TIMESTAMPTZ | Not Null | now() |
| updated_at | TIMESTAMPTZ | Not Null, Auto-Update | now() |

## Security

### Row Level Security (RLS)

All `members` table queries go through RLS policies:

**Regular Users:**
- Can read only their own member record
- Cannot create, update, or delete

**Admins:**
- Can read all member records
- Can create, update, and delete members
- Admin status determined by `role = 'admin'` + `status = 'ACTIVE'`

**RLS Helper Function:**
```sql
is_admin() -> BOOLEAN
```
Checks if current auth user is an admin (safe, uses SECURITY DEFINER).

See the RLS setup in sql/03-create-rls-policies.sql for the detailed policy examples.

## Frontend Contracts

### TypeScript Types (`src/types/member.ts`)

```typescript
// Core types
Member              // Full member record from DB
MemberInsert        // For creating members (omits auto fields)
MemberUpdate        // For updating members (all optional)
MemberProfile       // Lightweight display info
MemberListItem      // For lists

// Enums
MemberTier          // 'Explorer' | 'Pioneer' | 'Vanguard'
MemberStatus        // 'ACTIVE' | 'PENDING' | 'SUSPENDED'
MemberRole          // 'member' | 'admin'
```

### Query Helpers (`src/lib/queries.ts`)

```typescript
// Get current user's profile
getCurrentMember(email: string): Promise<Member | null>

// List all members (admin only)
listMembers(): Promise<MemberListItem[]>

// Create a new member (admin only)
createMember(input: MemberInsert): Promise<Member>

// Update a member (admin only)
updateMember(id: string, input: Omit<MemberUpdate, 'id'>): Promise<Member>

// Delete a member (admin only)
deleteMember(id: string): Promise<void>

// Search by name or email (admin only)
searchMembers(query: string): Promise<MemberListItem[]>

// Get member's public profile
getMemberProfile(memberId: string): Promise<MemberProfile | null>

// Get total member count (admin only)
getMemberCount(): Promise<number>

// Get members by status (admin only)
getMembersByStatus(status: string): Promise<MemberListItem[]>
```

All queries respect RLS policies. Admin-only operations fail gracefully if user is not an admin.

### Supabase Client (`src/lib/supabase.ts`)

```typescript
import { supabase, getCurrentUser, getCurrentSession, signOut } from '@/lib/supabase';

// Direct client access (for advanced use cases)
const { data, error } = await supabase
  .from('members')
  .select('*');

// Auth helpers
const user = await getCurrentUser();         // Get current auth user
const session = await getCurrentSession();   // Get session
await signOut();                             // Sign out user
```

## Environment Variables

Create `.env.local` from `.env.example`:

```bash
# Required: Supabase project details
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: For temporary frontend bootstrap
# VITE_ADMIN_EMAILS=admin@example.com
```

Get Supabase credentials:
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Settings → API
4. Copy `Project URL` and `anon [public]` key

## Development Workflow

### Running Tests (Not Yet Implemented)

```bash
pnpm test
```

### Code Quality

```bash
pnpm lint           # Run ESLint
pnpm type-check     # Run TypeScript check
```

### Database Debugging

Access your database directly via Supabase Dashboard:
1. Go to SQL Editor
2. Run queries to inspect `members` table
3. Check RLS policies under Table Editor → members

## Common Tasks

### Add a New Member (Admin)

```typescript
import { createMember } from '@/lib/queries';

const newMember = await createMember({
  email: 'user@example.com',
  name: 'User Name',
  tier: 'Pioneer',
  status: 'ACTIVE',
  role: 'member',
  title: 'Engineer',
  location: 'San Francisco, CA',
  member_since: '2024-06-11',
});
```

### Update Member Status (Admin)

```typescript
import { updateMember } from '@/lib/queries';

await updateMember(memberId, {
  status: 'SUSPENDED',
});
// updated_at is automatically set by trigger
```

### Check if User is Admin

```typescript
import { getCurrentMember } from '@/lib/queries';

const member = await getCurrentMember(userEmail);
const isAdmin = member?.role === 'admin' && member?.status === 'ACTIVE';
```

## Troubleshooting

### "Permission denied" on queries

Check:
1. Is user authenticated? `await getCurrentUser()`
2. Does user have a member record? `SELECT * FROM members WHERE email = 'your@email.com'`
3. Are you an admin? `SELECT is_admin()`

See [DATABASE.md - Troubleshooting](./DATABASE.md#troubleshooting).

### Supabase environment variables not loading

Make sure:
1. File is named `.env.local` (not `.env`)
2. Variables start with `VITE_` (Vite prefix required)
3. Dev server is restarted after env changes

### "No rows returned" on first login

New auth users need a member record. Admin must create it first via `createMember()` or database directly.

## Next Steps

For the planned ORM migration path, see [ORM-MIGRATION-PLAN.md](./ORM-MIGRATION-PLAN.md).

1. **Auth Flow:** Implement Supabase Auth (email OTP sign-in)
2. **Login Page:** Build UI with Supabase Auth
3. **Member Portal:** Display user's profile and tier
4. **Admin Dashboard:** Member CRUD interface with search/filter
5. **Styling:** Responsive design with Tailwind CSS

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

## License

MIT
