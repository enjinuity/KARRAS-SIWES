-- 012_seed_realistic_nigerian_profiles.sql
-- Production-like mock users with full Nigerian university profile fields.
-- Email-first upsert pattern:
--   * If a `public.users` row already EXISTS with one of the seed emails, we UPDATE it in place
--     so we never hit a duplicate `matric_no` UNIQUE collision across two rows.
--   * If no public.users row yet, INSERT under the matching `auth.users.id` UUID
--     (the real one created in Authentication → Users) so the JWTs align.
--
-- AUTH PRE-REQUISITE: create these in Supabase Authentication → Users → Add user, password demo1234, Auto-confirm ON
--   instructor.chukwu@oau.edu.ng
--   ola.adeyemi.200489@oau.edu.ng
--   precious.okafor.200512@oau.edu.ng
--   instructor@demo.com
--   student@demo.com

DO $seed_profiles_012_v2$
DECLARE
    _auth_uid UUID;
    _public_row_id UUID;
BEGIN

    -- =========================================================================
    -- Helper: email-first public.users merge
    --
    -- Strategy:
    --   1. If `public.users` already has a row with ANY of the alias emails, UPDATE that row.
    --      This handles the common case where a prior seed bootstrapped `student@demo.com`
    --      with a real-looking profile, and we want the NEW oau email to share that same
    --      profile identity so `matric_no` UNIQUE never collides.
    --   2. Otherwise, if there is a real `auth.users.id` for the primary email, INSERT under it.
    --   3. Otherwise (auth.users doesn't exist yet — happens when seeding before auth create),
    --      skip the insert silently so this is idempotent.
    -- =========================================================================

    -- ------------------------------
    -- 1. INSTRUCTOR — Dr. Chukwuemeka Chukwu
    --    Aliases: instructor@demo.com ↔ instructor.chukwu@oau.edu.ng
    -- ------------------------------
    _public_row_id := NULL;
    SELECT id INTO _public_row_id
      FROM public.users
     WHERE email IN ('instructor@demo.com', 'instructor.chukwu@oau.edu.ng')
     ORDER BY CASE email WHEN 'instructor.chukwu@oau.edu.ng' THEN 0 ELSE 1 END
     LIMIT 1;

    IF _public_row_id IS NOT NULL THEN
        UPDATE public.users
           SET email      = (CASE WHEN EXISTS (SELECT 1 FROM auth.users au WHERE au.email = 'instructor.chukwu@oau.edu.ng')
                                  THEN 'instructor.chukwu@oau.edu.ng' ELSE email END),
               role       = 'instructor',
               full_name  = 'Dr. Chukwuemeka Chukwu',
               faculty    = 'Faculty of Technology',
               department = 'Department of Computer Science & Engineering',
               phone      = '+234 803 111 2244'
         WHERE id = _public_row_id;
    ELSE
        SELECT id INTO _auth_uid FROM auth.users WHERE email IN ('instructor.chukwu@oau.edu.ng', 'instructor@demo.com') LIMIT 1;
        IF _auth_uid IS NOT NULL THEN
            INSERT INTO public.users (id, email, role, full_name, faculty, department, phone)
            VALUES (_auth_uid,
                    (SELECT COALESCE(MAX(au.email), 'instructor.chukwu@oau.edu.ng') FROM auth.users au WHERE au.email IN ('instructor.chukwu@oau.edu.ng', 'instructor@demo.com')),
                    'instructor',
                    'Dr. Chukwuemeka Chukwu',
                    'Faculty of Technology',
                    'Department of Computer Science & Engineering',
                    '+234 803 111 2244');
        END IF;
    END IF;

    -- ------------------------------
    -- 2. STUDENT 1 — Olaoluwa Adeyemi (200L, CSC/2020/048)
    --    Aliases: student@demo.com ↔ ola.adeyemi.200489@oau.edu.ng
    -- ------------------------------
    _public_row_id := NULL;
    SELECT id INTO _public_row_id
      FROM public.users
     WHERE email IN ('student@demo.com', 'ola.adeyemi.200489@oau.edu.ng')
     ORDER BY CASE email WHEN 'ola.adeyemi.200489@oau.edu.ng' THEN 0 ELSE 1 END
     LIMIT 1;

    IF _public_row_id IS NOT NULL THEN
        UPDATE public.users
           SET email      = (CASE WHEN EXISTS (SELECT 1 FROM auth.users au WHERE au.email = 'ola.adeyemi.200489@oau.edu.ng')
                                  THEN 'ola.adeyemi.200489@oau.edu.ng' ELSE email END),
               role       = 'student',
               full_name  = 'Olaoluwa Adebayo Adeyemi',
               faculty    = 'Faculty of Technology',
               department = 'Department of Computer Science & Engineering',
               level      = 200,
               phone      = '+234 812 334 5566',
               matric_no  = 'CSC/2020/048'
         WHERE id = _public_row_id;
    ELSE
        SELECT id INTO _auth_uid FROM auth.users WHERE email IN ('ola.adeyemi.200489@oau.edu.ng', 'student@demo.com') LIMIT 1;
        IF _auth_uid IS NOT NULL THEN
            INSERT INTO public.users (id, email, role, full_name, faculty, department, level, phone, matric_no)
            VALUES (_auth_uid,
                    (SELECT COALESCE(MAX(au.email), 'ola.adeyemi.200489@oau.edu.ng') FROM auth.users au WHERE au.email IN ('ola.adeyemi.200489@oau.edu.ng', 'student@demo.com')),
                    'student',
                    'Olaoluwa Adebayo Adeyemi',
                    'Faculty of Technology',
                    'Department of Computer Science & Engineering',
                    200,
                    '+234 812 334 5566',
                    'CSC/2020/048');
        END IF;
    END IF;

    -- ------------------------------
    -- 3. STUDENT 2 — Precious Okafor (300L, CSC/2019/012)
    --    Only alias: precious.okafor.200512@oau.edu.ng
    -- ------------------------------
    _public_row_id := NULL;
    SELECT id INTO _public_row_id FROM public.users WHERE email = 'precious.okafor.200512@oau.edu.ng';

    IF _public_row_id IS NOT NULL THEN
        UPDATE public.users
           SET role       = 'student',
               full_name  = 'Precious Chiamaka Okafor',
               faculty    = 'Faculty of Technology',
               department = 'Department of Computer Science & Engineering',
               level      = 300,
               phone      = '+234 805 778 9911',
               matric_no  = 'CSC/2019/012'
         WHERE id = _public_row_id;
    ELSE
        SELECT id INTO _auth_uid FROM auth.users WHERE email = 'precious.okafor.200512@oau.edu.ng';
        IF _auth_uid IS NOT NULL THEN
            INSERT INTO public.users (id, email, role, full_name, faculty, department, level, phone, matric_no)
            VALUES (_auth_uid,
                    'precious.okafor.200512@oau.edu.ng',
                    'student',
                    'Precious Chiamaka Okafor',
                    'Faculty of Technology',
                    'Department of Computer Science & Engineering',
                    300,
                    '+234 805 778 9911',
                    'CSC/2019/012');
        END IF;
    END IF;

END $seed_profiles_012_v2$;
