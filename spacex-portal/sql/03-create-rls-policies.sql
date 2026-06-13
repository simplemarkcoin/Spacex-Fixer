-- Helper function to check if current user is admin
-- Uses SECURITY DEFINER with fixed search_path to avoid recursive RLS issues
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM members
    WHERE email = auth.jwt() ->> 'email'
      AND role = 'admin'
      AND status = 'ACTIVE'
  );
$$;

-- Policy 1: Authenticated users can read only their own member row
CREATE POLICY "Users can read own member record"
ON members
FOR SELECT
USING (
  auth.jwt() ->> 'email' = email
);

-- Policy 2: Admins can read all member rows
CREATE POLICY "Admins can read all members"
ON members
FOR SELECT
USING (
  is_admin()
);

-- Policy 3: Admins can insert members
CREATE POLICY "Admins can insert members"
ON members
FOR INSERT
WITH CHECK (
  is_admin()
);

-- Policy 4: Admins can update members
CREATE POLICY "Admins can update members"
ON members
FOR UPDATE
USING (
  is_admin()
)
WITH CHECK (
  is_admin()
);

-- Policy 5: Admins can delete members
CREATE POLICY "Admins can delete members"
ON members
FOR DELETE
USING (
  is_admin()
);
