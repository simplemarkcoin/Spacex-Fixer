# Member Portal API Documentation

## Overview

This document describes the frontend API layer for the SpaceX Member Portal. All APIs are Supabase client-side helpers that return clean, predictable JSON responses.

## File Structure

```
src/lib/api/
  ├── response.ts        # Response type definitions and helpers
  ├── errors.ts          # Error codes and HTTP status mapping
  ├── validation.ts      # Zod validation schemas
  └── members.ts         # Member API functions

src/types/
  └── member.ts          # Member types and enums

src/tests/
  └── api.test.ts        # API layer tests (Vitest)

docs/
  └── API.md             # This file
```

## Response Format

All API functions return one of two response types:

### Success Response

```typescript
type ApiSuccess<T> = {
  ok: true;
  data: T;
}
```

Example:
```json
{
  "ok": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "member1@example.com",
    "name": "Elena Rodriguez",
    "tier": "Vanguard",
    "status": "ACTIVE",
    "role": "member",
    "title": "Senior Flight Systems Engineer",
    "location": "Starbase, TX",
    "member_since": "2022-01-15",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### Failure Response

```typescript
type ApiFailure = {
  ok: false;
  error: {
    code: string;
    message: string;
  }
}
```

Example:
```json
{
  "ok": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHENTICATED` | 401 | User is not authenticated |
| `FORBIDDEN` | 403 | User lacks permission |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `UNKNOWN_ERROR` | 500 | Unexpected error |

## API Functions

### Member Queries

#### `getCurrentMember(email: string)`

Get the current authenticated member by email address.

**Parameters:**
- `email` (string, required): Member email address

**Returns:** `Promise<ApiResponse<Member>>`

**Example:**
```typescript
const result = await getCurrentMember('member1@example.com');
if (result.ok) {
  console.log('Member:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

**Errors:**
- `VALIDATION_ERROR`: Email is empty
- `NOT_FOUND`: Member not found
- `DATABASE_ERROR`: Query failed

---

#### `listMembers()`

Get all members (admin only, enforced by RLS).

**Returns:** `Promise<ApiResponse<Member[]>>`

**Example:**
```typescript
const result = await listMembers();
if (result.ok) {
  console.log('Total members:', result.data.length);
  result.data.forEach(member => {
    console.log(`${member.name} (${member.tier})`);
  });
}
```

**Errors:**
- `FORBIDDEN`: User is not admin
- `DATABASE_ERROR`: Query failed

---

#### `searchMembers(params: SearchMembersInput)`

Search and filter members with pagination (admin only).

**Parameters:**
```typescript
interface SearchMembersInput {
  query?: string;        // Search by name or email (case-insensitive)
  status?: MemberStatus; // Filter by status (ACTIVE, PENDING, SUSPENDED)
  tier?: MemberTier;     // Filter by tier (Explorer, Pioneer, Vanguard)
  role?: MemberRole;     // Filter by role (member, admin)
  limit?: number;        // Results per page (default: 50, max: 1000)
  offset?: number;       // Pagination offset (default: 0)
}
```

**Returns:** `Promise<ApiResponse<{ data: Member[]; total: number }>>`

**Example:**
```typescript
const result = await searchMembers({
  query: 'elena',
  tier: 'Vanguard',
  status: 'ACTIVE',
  limit: 25,
  offset: 0
});

if (result.ok) {
  console.log(`Found ${result.data.total} members`);
  console.log(`Showing ${result.data.data.length} results`);
}
```

**Errors:**
- `VALIDATION_ERROR`: Invalid parameters
- `FORBIDDEN`: User is not admin
- `DATABASE_ERROR`: Query failed

---

### Member Mutations

#### `createMember(input: MemberInsert)`

Create a new member (admin only).

**Parameters:**
```typescript
interface MemberInsert {
  email: string;                     // Required, must be unique
  name: string;                      // Required
  tier: MemberTier;                  // Default: Explorer
  status: MemberStatus;              // Default: PENDING
  role: MemberRole;                  // Default: member
  title?: string | null;             // Optional
  location?: string | null;          // Optional
  member_since?: string | null;      // Optional, YYYY-MM-DD format
}
```

**Returns:** `Promise<ApiResponse<Member>>`

**Example:**
```typescript
const result = await createMember({
  email: 'newmember@example.com',
  name: 'Jane Smith',
  tier: 'Pioneer',
  status: 'ACTIVE',
  role: 'member',
  title: 'Software Engineer',
  location: 'Mountain View, CA',
  member_since: '2024-01-15'
});

if (result.ok) {
  console.log('Created member:', result.data.id);
}
```

**Validation:**
- Email must be valid and unique
- Name must not be empty
- Tier must be one of: Explorer, Pioneer, Vanguard
- Status must be one of: ACTIVE, PENDING, SUSPENDED
- Role must be one of: member, admin
- member_since must be in YYYY-MM-DD format

**Errors:**
- `VALIDATION_ERROR`: Invalid input
- `FORBIDDEN`: User is not admin
- `DATABASE_ERROR`: Email already exists or query failed

---

#### `updateMember(id: string, input: MemberUpdate)`

Update an existing member (admin only).

**Parameters:**
- `id` (string, required): Member ID
- `input` (Partial MemberInsert, required): Fields to update

**Returns:** `Promise<ApiResponse<Member>>`

**Example:**
```typescript
const result = await updateMember('550e8400-e29b-41d4-a716-446655440000', {
  tier: 'Vanguard',
  status: 'ACTIVE'
});

if (result.ok) {
  console.log('Updated member:', result.data);
}
```

**Validation:**
- All fields are optional
- Same validation rules as create (when provided)

**Errors:**
- `VALIDATION_ERROR`: Invalid ID or input
- `NOT_FOUND`: Member not found
- `FORBIDDEN`: User is not admin
- `DATABASE_ERROR`: Query failed

---

#### `deleteMember(id: string)`

Delete a member (admin only).

**Parameters:**
- `id` (string, required): Member ID

**Returns:** `Promise<ApiResponse<{ id: string }>>`

**Example:**
```typescript
const result = await deleteMember('550e8400-e29b-41d4-a716-446655440000');

if (result.ok) {
  console.log('Deleted member:', result.data.id);
}
```

**Errors:**
- `VALIDATION_ERROR`: ID is missing
- `FORBIDDEN`: User is not admin
- `DATABASE_ERROR`: Query failed

---

### Statistics

#### `getMemberStats()`

Get member statistics (admin only).

**Returns:** `Promise<ApiResponse<MemberStats>>`

**Response Data:**
```typescript
interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  suspendedMembers: number;
  adminCount: number;
  tierBreakdown: {
    explorer: number;
    pioneer: number;
    vanguard: number;
  }
}
```

**Example:**
```typescript
const result = await getMemberStats();

if (result.ok) {
  console.log('Total members:', result.data.totalMembers);
  console.log('Active:', result.data.activeMembers);
  console.log('Admins:', result.data.adminCount);
  console.log('Tier breakdown:', result.data.tierBreakdown);
}
```

**Example Response:**
```json
{
  "ok": true,
  "data": {
    "totalMembers": 14,
    "activeMembers": 9,
    "pendingMembers": 2,
    "suspendedMembers": 2,
    "adminCount": 2,
    "tierBreakdown": {
      "explorer": 3,
      "pioneer": 6,
      "vanguard": 5
    }
  }
}
```

**Errors:**
- `FORBIDDEN`: User is not admin
- `DATABASE_ERROR`: Query failed

---

## Type Definitions

### Member Enums

```typescript
enum MemberTier {
  EXPLORER = 'Explorer',
  PIONEER = 'Pioneer',
  VANGUARD = 'Vanguard'
}

enum MemberStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED'
}

enum MemberRole {
  MEMBER = 'member',
  ADMIN = 'admin'
}
```

### Member Interface

```typescript
interface Member {
  id: string;
  email: string;
  name: string;
  tier: MemberTier | string;
  status: MemberStatus | string;
  role: MemberRole | string;
  title: string | null;
  location: string | null;
  member_since: string | null;  // ISO date (YYYY-MM-DD)
  created_at: string;           // ISO timestamp
  updated_at: string;           // ISO timestamp
}
```

---

## Testing

Run tests:

```bash
# Watch mode
pnpm test

# Single run
pnpm test:run

# UI mode
pnpm test:ui
```

Test coverage includes:
- Response helper functions (success, failure, type guards)
- Error code to HTTP status mapping
- Validation schemas (create, update, search)
- Schema parsing and error messages
- Edge cases and invalid inputs

---

## Usage Examples

### React Hook Example

```typescript
import { useState, useEffect } from 'react';
import { searchMembers } from '@/lib/api/members';

function MemberList() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadMembers() {
      const result = await searchMembers({ limit: 25 });
      if (result.ok) {
        setMembers(result.data.data);
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    }

    loadMembers();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <ul>
      {members.map(member => (
        <li key={member.id}>{member.name} ({member.tier})</li>
      ))}
    </ul>
  );
}
```

### Error Handling Pattern

```typescript
async function updateMemberSafely(id: string, updates: any) {
  const result = await updateMember(id, updates);

  if (result.ok) {
    console.log('Success:', result.data);
    return result.data;
  }

  // Handle specific errors
  switch (result.error.code) {
    case 'VALIDATION_ERROR':
      console.error('Invalid input:', result.error.message);
      break;
    case 'NOT_FOUND':
      console.error('Member not found');
      break;
    case 'FORBIDDEN':
      console.error('You do not have permission');
      break;
    default:
      console.error('Error:', result.error.message);
  }

  return null;
}
```

---

## Next Steps

Phase 2: React UI
- Login page with email OTP
- Member portal (view own profile)
- Admin dashboard (member CRUD)
- Member list with search/filter
