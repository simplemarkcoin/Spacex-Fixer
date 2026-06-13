-- Seed sample members for local testing
-- Run this AFTER 04-bootstrap-admin.sql
-- 
-- This script is idempotent: use ON CONFLICT (email) DO UPDATE
-- to safely re-run without errors or duplicates.

-- ═══════════════════════════════════════════════════════════════════════════
-- ADMIN MEMBERS (role = 'admin')
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'admin1@example.com',
  'Sarah Mitchell',
  'admin',
  'Vanguard',
  'ACTIVE',
  'Platform Administrator',
  'Headquarters, CA',
  CURRENT_DATE - INTERVAL '3 years'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'admin2@example.com',
  'Marcus Chen',
  'admin',
  'Vanguard',
  'ACTIVE',
  'Systems Administrator',
  'Houston, TX',
  CURRENT_DATE - INTERVAL '2 years 6 months'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVE MEMBERS - VANGUARD TIER
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member1@example.com',
  'Elena Rodriguez',
  'member',
  'Vanguard',
  'ACTIVE',
  'Senior Flight Systems Engineer',
  'Starbase, TX',
  CURRENT_DATE - INTERVAL '2 years'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member2@example.com',
  'David Kumar',
  'member',
  'Vanguard',
  'ACTIVE',
  'Propulsion Systems Lead',
  'Boca Chica, TX',
  CURRENT_DATE - INTERVAL '18 months'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVE MEMBERS - PIONEER TIER
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member3@example.com',
  'Jasmine Park',
  'member',
  'Pioneer',
  'ACTIVE',
  'Avionics Engineer',
  'Los Angeles, CA',
  CURRENT_DATE - INTERVAL '1 year'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member4@example.com',
  'Thomas Wright',
  'member',
  'Pioneer',
  'ACTIVE',
  'Structural Analysis Engineer',
  'Seattle, WA',
  CURRENT_DATE - INTERVAL '14 months'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member5@example.com',
  'Priya Patel',
  'member',
  'Pioneer',
  'ACTIVE',
  'Software Engineer, Ground Systems',
  'Mountain View, CA',
  CURRENT_DATE - INTERVAL '8 months'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- ACTIVE MEMBERS - EXPLORER TIER
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member6@example.com',
  'Michael Torres',
  'member',
  'Explorer',
  'ACTIVE',
  'Junior Test Engineer',
  'Starbase, TX',
  CURRENT_DATE - INTERVAL '3 months'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member7@example.com',
  'Nicole Anderson',
  'member',
  'Explorer',
  'ACTIVE',
  'Data Analyst Intern',
  'Las Vegas, NV',
  CURRENT_DATE - INTERVAL '2 months'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- PENDING MEMBERS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member8@example.com',
  'Jordan Lee',
  'member',
  'Pioneer',
  'PENDING',
  'Network Engineer',
  'Austin, TX',
  CURRENT_DATE
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member9@example.com',
  'Alexandra Volkov',
  'member',
  'Explorer',
  'PENDING',
  'Research Scientist',
  'Boston, MA',
  CURRENT_DATE - INTERVAL '1 week'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- SUSPENDED MEMBERS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member10@example.com',
  'Christopher Blake',
  'member',
  'Vanguard',
  'SUSPENDED',
  'Manufacturing Engineer',
  'McGregor, TX',
  CURRENT_DATE - INTERVAL '1 year'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

INSERT INTO members (email, name, role, tier, status, title, location, member_since)
VALUES (
  'member11@example.com',
  'Rebecca Foster',
  'member',
  'Pioneer',
  'SUSPENDED',
  'Quality Assurance Lead',
  'Brownsville, TX',
  CURRENT_DATE - INTERVAL '6 months'
)
ON CONFLICT (email) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, tier = EXCLUDED.tier,
    status = EXCLUDED.status, title = EXCLUDED.title, location = EXCLUDED.location,
    member_since = EXCLUDED.member_since, updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- VERIFICATION & SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════

-- List all seeded members
SELECT 
  email,
  name,
  role,
  tier,
  status,
  title,
  location,
  member_since,
  created_at
FROM members
ORDER BY created_at DESC;

-- Summary statistics
SELECT 
  role,
  tier,
  status,
  COUNT(*) as count
FROM members
GROUP BY role, tier, status
ORDER BY role DESC, tier DESC, status;
