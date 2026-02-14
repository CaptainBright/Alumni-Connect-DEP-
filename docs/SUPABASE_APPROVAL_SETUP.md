# Supabase Setup: Registration + Admin Approval Flow

This guide configures the exact flow you asked for:
- First-time users create a profile.
- Profile stays **PENDING** until admin approval.
- Only approved users can access authenticated pages.
- Unapproved users are effectively limited to public pages (home/login/register).
- Roles supported: **Student, Alumni, Faculty, Admin**.

## 1) Add/verify profile columns

Run this in **Supabase SQL Editor**:

```sql
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS user_type TEXT DEFAULT 'Alumni',
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'PENDING' CHECK (approval_status IN ('PENDING', 'APPROVED', 'REJECTED')),
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_approval_status ON public.profiles(approval_status);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON public.profiles(user_type);
```

## 2) Normalize existing data

```sql
UPDATE public.profiles
SET
  user_type = COALESCE(NULLIF(user_type, ''), 'Alumni'),
  approval_status = CASE
    WHEN approval_status IN ('APPROVED', 'PENDING', 'REJECTED') THEN approval_status
    WHEN is_approved = true THEN 'APPROVED'
    ELSE 'PENDING'
  END,
  is_approved = CASE
    WHEN approval_status = 'APPROVED' THEN true
    WHEN approval_status IN ('PENDING', 'REJECTED') THEN false
    ELSE COALESCE(is_approved, false)
  END;
```

## 3) Make `inferno7212@gmail.com` the admin

Run this SQL exactly (safe to rerun):

```sql
UPDATE public.profiles
SET
  user_type = 'Admin',
  approval_status = 'APPROVED',
  is_approved = true,
  admin_notes = NULL
WHERE email = 'inferno7212@gmail.com';
```

If this updates `0` rows, that user has not created a profile row yet. Ask that user to sign in once, then rerun this query.

## 4) Replace RLS policies (important)

Open **Table Editor → profiles → RLS** and remove old conflicting policies, then run:

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "view_approved_or_self" ON public.profiles;
DROP POLICY IF EXISTS "admin_view_all_profiles" ON public.profiles;
DROP POLICY IF EXISTS "insert_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "update_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "admin_update_profiles" ON public.profiles;
DROP POLICY IF EXISTS "delete_own_profile" ON public.profiles;

CREATE POLICY "view_approved_or_self" ON public.profiles
FOR SELECT
USING (
  approval_status = 'APPROVED'
  OR auth.uid() = id
  OR EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.user_type = 'Admin'
  )
);

CREATE POLICY "insert_own_profile" ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "update_own_profile" ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "admin_update_profiles" ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.user_type = 'Admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid() AND p.user_type = 'Admin'
  )
);

CREATE POLICY "delete_own_profile" ON public.profiles
FOR DELETE
USING (auth.uid() = id);
```

## 5) Confirm role values you should use in app data

Use these exact strings:
- `Student`
- `Alumni`
- `Faculty`
- `Admin`

## 6) Verify with checks

Run these in SQL editor:

```sql
SELECT user_type, approval_status, COUNT(*)
FROM public.profiles
GROUP BY user_type, approval_status
ORDER BY user_type, approval_status;
```

```sql
SELECT email, user_type, approval_status, is_approved
FROM public.profiles
WHERE email = 'inferno7212@gmail.com';
```

Expected: `inferno7212@gmail.com` appears as `Admin + APPROVED + true`.

## 7) Functional smoke test

1. Register a new Student/Alumni/Faculty account.
2. Try logging in immediately.
3. App should block access and show pending/review messaging.
4. Login as admin (`inferno7212@gmail.com`) and approve user.
5. User logs in again and can now access dashboard and protected pages.
