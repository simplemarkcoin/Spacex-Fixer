# API Workflow Demo: Create, Delete, Update Members

This document describes the complete API workflow demonstration that tests the full lifecycle of member management operations.

## Overview

The workflow demonstrates:

1. **Create** - Add 5 dummy members to the database
2. **Delete** - Remove 2 of those members
3. **Update** - Modify fields on 2 members
4. **List** - View final state of members

All operations use the type-safe API layer with proper validation and error handling.

## Step 1: Create 5 Dummy Members

Five members are created with different tiers and statuses:

```typescript
// Member 1: Demo User One
email: demo1@example.com
name: Demo User One
tier: Explorer
status: ACTIVE

// Member 2: Demo User Two
email: demo2@example.com
name: Demo User Two
tier: Pioneer
status: ACTIVE

// Member 3: Demo User Three
email: demo3@example.com
name: Demo User Three
tier: Vanguard
status: PENDING

// Member 4: Demo User Four
email: demo4@example.com
name: Demo User Four
tier: Pioneer
status: ACTIVE

// Member 5: Demo User Five
email: demo5@example.com
name: Demo User Five
tier: Explorer
status: SUSPENDED
```

### Creating a Member

```typescript
import { createMember, isSuccess } from '@/lib/api/members';

const result = await createMember({
  email: 'demo1@example.com',
  name: 'Demo User One',
  tier: 'Explorer',
  status: 'ACTIVE',
  title: 'Test Engineer',
  location: 'Demo City, ST',
});

if (isSuccess(result)) {
  console.log('Member created:', result.data.id);
} else {
  console.error('Error:', result.error.message);
}
```

## Step 2: Delete 2 Members

Members 1 and 2 are deleted:

- `demo1@example.com` (Demo User One) - DELETED
- `demo2@example.com` (Demo User Two) - DELETED

### Deleting a Member

```typescript
import { deleteMember, isSuccess } from '@/lib/api/members';

const result = await deleteMember(memberId);

if (isSuccess(result)) {
  console.log('Member deleted');
} else {
  console.error('Error:', result.error.message);
}
```

## Step 3: Update 2 Members

Members 3 and 4 are updated with new values:

### Member 3 Update

```typescript
import { updateMember, isSuccess } from '@/lib/api/members';

const result = await updateMember(member3Id, {
  name: 'Updated Demo User Three',
  tier: 'Explorer',           // Changed from Vanguard
  status: 'ACTIVE',           // Changed from PENDING
  title: 'Updated Manager',
});

if (isSuccess(result)) {
  console.log('Member updated:', result.data.name);
}
```

### Member 4 Update

```typescript
const result = await updateMember(member4Id, {
  name: 'Updated Demo User Four',
  title: 'Senior Demo Analyst',
  location: 'San Francisco, CA',
});

if (isSuccess(result)) {
  console.log('Member updated:', result.data.name);
}
```

## Final State

After all operations:

- **Total Created**: 5 members
- **Total Deleted**: 2 members
- **Total Updated**: 2 members
- **Remaining Demo Members**: 3
  - Demo User Three (UPDATED)
  - Demo User Four (UPDATED)
  - Demo User Five (unchanged)

## Running the Workflow Tests

### Option 1: Run Test Suite

```bash
pnpm test:run -- src/tests/api.workflow.test.ts
```

Output:
```
✓ src/tests/api.workflow.test.ts (11 tests) 12ms

Test Files  1 passed (1)
     Tests  11 passed (11)
```

### Option 2: Watch Mode

```bash
pnpm test -- src/tests/api.workflow.test.ts
```

### Option 3: Run Demo Script

```bash
npx ts-node scripts/demo-api.ts
```

## API Response Format

All operations return a consistent response format:

### Success Response

```typescript
{
  ok: true,
  data: {
    id: "uuid",
    email: "demo1@example.com",
    name: "Demo User One",
    tier: "Explorer",
    status: "ACTIVE",
    // ... other fields
  }
}
```

### Failure Response

```typescript
{
  ok: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid email format",
    details: {
      email: ["Invalid email address"]
    }
  }
}
```

## Error Handling

All API functions handle errors gracefully:

```typescript
import { isSuccess, isFailure } from '@/lib/api/response';

const result = await createMember(input);

if (isSuccess(result)) {
  // result.data is the member
  console.log(result.data.name);
} else if (isFailure(result)) {
  // result.error contains error details
  console.error(result.error.message);
  console.error(result.error.code);
}
```

## Test Cases Covered

The workflow test covers:

- ✅ Creating 5 members with different tiers and statuses
- ✅ Validating tier values (Explorer, Pioneer, Vanguard)
- ✅ Validating status values (ACTIVE, PENDING, SUSPENDED)
- ✅ Ensuring unique emails
- ✅ Deleting 2 members
- ✅ Verifying member count after deletions
- ✅ Updating 2 members with new values
- ✅ Validating update payloads
- ✅ Completing full 9-operation workflow
- ✅ Accounting for all operations

## Next Steps

1. **Use in Components** - Import API functions in React components
2. **Handle Responses** - Use `isSuccess()` and `isFailure()` type guards
3. **Display Data** - Render member lists and details
4. **Error UI** - Show error messages to users

## Related Documentation

- [API.md](./API.md) - Complete API reference
- [API-QUICKSTART.md](../API-QUICKSTART.md) - Quick reference
- [api.test.ts](../src/tests/api.test.ts) - Validation schema tests
