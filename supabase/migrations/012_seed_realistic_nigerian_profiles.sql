-- 012_seed_realistic_nigerian_profiles.sql
-- Production-like mock users with full Nigerian university profile fields:
--  1 INSTRUCTOR: Department of Computer Science & Engineering lecturer
--  2 STUDENTS:   200-level / 300-level CS students with matric numbers, faculty, dept, level, phone
--
-- NOTE: Run AFTER you have created the three users in Supabase Auth dashboard
--       (or create them in Auth AFTER running 012 — 002_seed_users.sql will link them):
--
--  Auth email                      Auth password
--  ----------------------------------------------------------------
--  instructor.chukwu@oau.edu.ng    demo1234
--  ola.adeyemi.200489@oau.edu.ng   demo1234
--  precious.okafor.200512@oau.edu.ng demo1234
--
--  (Keeping instructor@demo.com / student@demo.com working as fallbacks too.)

DO $seed_profiles_012$
DECLARE
    _uid UUID;
BEGIN

    -- =========================================================================
    -- 1. LECTURER — Dr. Chukwuemeka Chukwu, Department of Computer Science
    -- =========================================================================
    _uid := NULL;
    SELECT id INTO _uid FROM auth.users WHERE email = 'instructor.chukwu@oau.edu.ng';
    IF _uid IS NOT NULL THEN
        INSERT INTO public.users (id, email, role, full_name, faculty, department, level, phone, matric_no)
        VALUES (_uid, 'instructor.chukwu@oau.edu.ng', 'instructor',
                'Dr. Chukwuemeka Chukwu',
                'Faculty of Technology',
                'Department of Computer Science & Engineering',
                NULL,
                '+234 803 111 2244',
                NULL)
        ON CONFLICT (id) DO UPDATE SET
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            faculty = EXCLUDED.faculty,
            department = EXCLUDED.department,
            phone = EXCLUDED.phone;
    END IF;

    -- Keep the original demo instructor account wired up as a Senior Lecturer fallback too
    -- (so the old login still works with realistic profile data)
    _uid := NULL;
    SELECT id INTO _uid FROM auth.users WHERE email = 'instructor@demo.com';
    IF _uid IS NOT NULL THEN
        INSERT INTO public.users (id, email, role, full_name, faculty, department, level, phone, matric_no)
        VALUES (_uid, 'instructor@demo.com', 'instructor',
                'Dr. Chukwuemeka Chukwu',
                'Faculty of Technology',
                'Department of Computer Science & Engineering',
                NULL,
                '+234 803 111 2244',
                NULL)
        ON CONFLICT (id) DO UPDATE SET
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            faculty = EXCLUDED.faculty,
            department = EXCLUDED.department,
            phone = EXCLUDED.phone;
    END IF;

    -- =========================================================================
    -- 2. STUDENT — Olaoluwa Adeyemi (200-level, matric: CSC/2020/048)
    -- =========================================================================
    _uid := NULL;
    SELECT id INTO _uid FROM auth.users WHERE email = 'ola.adeyemi.200489@oau.edu.ng';
    IF _uid IS NOT NULL THEN
        INSERT INTO public.users (id, email, role, full_name, faculty, department, level, phone, matric_no)
        VALUES (_uid, 'ola.adeyemi.200489@oau.edu.ng', 'student',
                'Olaoluwa Adebayo Adeyemi',
                'Faculty of Technology',
                'Department of Computer Science & Engineering',
                200,
                '+234 812 334 5566',
                'CSC/2020/048')
        ON CONFLICT (id) DO UPDATE SET
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            faculty = EXCLUDED.faculty,
            department = EXCLUDED.department,
            level = EXCLUDED.level,
            phone = EXCLUDED.phone,
            matric_no = EXCLUDED.matric_no;
    END IF;

    -- Fallback wire the old student@demo.com login up to Ola's profile
    _uid := NULL;
    SELECT id INTO _uid FROM auth.users WHERE email = 'student@demo.com';
    IF _uid IS NOT NULL THEN
        INSERT INTO public.users (id, email, role, full_name, faculty, department, level, phone, matric_no)
        VALUES (_uid, 'student@demo.com', 'student',
                'Olaoluwa Adebayo Adeyemi',
                'Faculty of Technology',
                'Department of Computer Science & Engineering',
                200,
                '+234 812 334 5566',
                'CSC/2020/048')
        ON CONFLICT (id) DO UPDATE SET
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            faculty = EXCLUDED.faculty,
            department = EXCLUDED.department,
            level = EXCLUDED.level,
            phone = EXCLUDED.phone,
            matric_no = EXCLUDED.matric_no;
    END IF;

    -- =========================================================================
    -- 3. STUDENT — Precious Okafor (300-level, matric: CSC/2019/012)
    -- =========================================================================
    _uid := NULL;
    SELECT id INTO _uid FROM auth.users WHERE email = 'precious.okafor.200512@oau.edu.ng';
    IF _uid IS NOT NULL THEN
        INSERT INTO public.users (id, email, role, full_name, faculty, department, level, phone, matric_no)
        VALUES (_uid, 'precious.okafor.200512@oau.edu.ng', 'student',
                'Precious Chiamaka Okafor',
                'Faculty of Technology',
                'Department of Computer Science & Engineering',
                300,
                '+234 805 778 9911',
                'CSC/2019/012')
        ON CONFLICT (id) DO UPDATE SET
            role = EXCLUDED.role,
            full_name = EXCLUDED.full_name,
            faculty = EXCLUDED.faculty,
            department = EXCLUDED.department,
            level = EXCLUDED.level,
            phone = EXCLUDED.phone,
            matric_no = EXCLUDED.matric_no;
    END IF;

END $seed_profiles_012$;
