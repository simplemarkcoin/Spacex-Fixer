-- Bootstrap: Create the first admin member
-- NOTE: Run this AFTER creating the auth user via Supabase Auth dashboard
-- Replace 'admin@example.com' with your actual admin email

INSERT INTO members (email, name, role, tier, status, member_since)
VALUES (
  'admin@example.com',
  'Admin User',
  'admin',
  'Vanguard',
  'ACTIVE',
  CURRENT_DATE
)
ON CONFLICT (email) DO UPDATE
SET role = 'admin', status = 'ACTIVE'
WHERE members.email = 'admin@example.com';

-- Verify the admin was created
SELECT id, email, name, role, status, tier FROM members WHERE email = 'admin@example.com';
