-- Virtual CS Lab — SEED DATA
-- Prerequisites:
--   1. Run 001_init.sql first
--   2. In Supabase Auth dashboard, create two users:
--        - instructor@demo.com  / demo1234
--        - student@demo.com     / demo1234
--   3. Then run THIS script — it will fill in public.users rows by looking up auth.users.

INSERT INTO public.users (id, email, role, full_name)
SELECT id, email, 'instructor', 'Demo Instructor'
FROM auth.users
WHERE email = 'instructor@demo.com'
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

INSERT INTO public.users (id, email, role, full_name)
SELECT id, email, 'student', 'Demo Student'
FROM auth.users
WHERE email = 'student@demo.com'
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

-- Verify
SELECT id, email, role, full_name FROM public.users;
