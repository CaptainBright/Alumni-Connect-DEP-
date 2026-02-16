-- Run in Supabase SQL Editor (as postgres/service role).
-- This fixes existing rows where profiles.email is NULL and normalizes role/approval columns.

-- 1) Backfill missing profile emails from auth.users by matching id.
UPDATE public.profiles AS p
SET email = u.email
FROM auth.users AS u
WHERE p.id = u.id
  AND (p.email IS NULL OR btrim(p.email) = '');

-- 2) Normalize user_type values.
UPDATE public.profiles
SET user_type = CASE
  WHEN lower(coalesce(user_type, '')) = 'admin' THEN 'Admin'
  WHEN lower(coalesce(user_type, '')) = 'student' THEN 'Student'
  ELSE 'Alumni'
END;

-- 3) Ensure approval fields are consistent.
UPDATE public.profiles
SET
  is_approved = CASE
    WHEN user_type = 'Admin' THEN true
    WHEN approval_status = 'APPROVED' THEN true
    ELSE coalesce(is_approved, false)
  END,
  approval_status = CASE
    WHEN user_type = 'Admin' THEN 'APPROVED'
    WHEN approval_status IN ('APPROVED', 'REJECTED', 'PENDING') THEN approval_status
    ELSE 'PENDING'
  END;

-- 4) Optional safety check: inspect rows that still have NULL email.
-- SELECT id, full_name, user_type, approval_status FROM public.profiles WHERE email IS NULL;

-- 5) Optional hardening (run only after step 4 returns zero rows):
-- ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;

NOTIFY pgrst, 'reload schema';
