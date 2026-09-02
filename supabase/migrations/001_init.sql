-- Virtual CS Lab — Database Migration (step 1 of 2)
-- Run in the Supabase SQL Editor.
-- This file is idempotent: CREATE TABLE IF NOT EXISTS + DROP POLICY IF EXISTS.

-- Enable UUID extension (should already be enabled on Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============
-- Helper: role lookup for the calling user (avoids RLS self-recursion)
-- ============
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS TEXT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role TEXT;
BEGIN
    IF auth.uid() IS NULL THEN RETURN NULL; END IF;
    SELECT role INTO _role
    FROM public.users
    WHERE id = auth.uid()
    LIMIT 1;
    RETURN _role;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auth_user_role() TO anon, authenticated;

-- ============
-- users table
-- ============
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('instructor', 'student')),
    full_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own" ON public.users;
CREATE POLICY "users read own" ON public.users
    FOR SELECT USING (id = auth.uid());

DROP POLICY IF EXISTS "instructors read all users" ON public.users;
CREATE POLICY "instructors read all users" ON public.users
    FOR SELECT USING (public.auth_user_role() = 'instructor');

DROP POLICY IF EXISTS "students read instructor profiles" ON public.users;
CREATE POLICY "students read instructor profiles" ON public.users
    FOR SELECT USING (public.auth_user_role() = 'student' AND role = 'instructor');

-- ============
-- assignments table
-- ============
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instructor_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "instructors manage own assignments" ON public.assignments;
CREATE POLICY "instructors manage own assignments" ON public.assignments
    FOR ALL
    USING (
        public.auth_user_role() = 'instructor'
        AND instructor_id = auth.uid()
    )
    WITH CHECK (
        public.auth_user_role() = 'instructor'
        AND instructor_id = auth.uid()
    );

DROP POLICY IF EXISTS "students read assignments" ON public.assignments;
CREATE POLICY "students read assignments" ON public.assignments
    FOR SELECT USING (public.auth_user_role() = 'student');

-- ============
-- submissions table
-- ============
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL DEFAULT '',
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    grade INT,
    feedback TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'graded')),
    UNIQUE(assignment_id, student_id)
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "students manage own submissions" ON public.submissions;
CREATE POLICY "students manage own submissions" ON public.submissions
    FOR ALL
    USING (
        public.auth_user_role() = 'student'
        AND student_id = auth.uid()
    )
    WITH CHECK (
        public.auth_user_role() = 'student'
        AND student_id = auth.uid()
    );

DROP POLICY IF EXISTS "instructors grade submissions" ON public.submissions;
CREATE POLICY "instructors grade submissions" ON public.submissions
    FOR ALL
    USING (
        public.auth_user_role() = 'instructor'
        AND EXISTS (
            SELECT 1
            FROM public.assignments a
            WHERE a.id = submissions.assignment_id
              AND a.instructor_id = auth.uid()
        )
    )
    WITH CHECK (
        public.auth_user_role() = 'instructor'
        AND EXISTS (
            SELECT 1
            FROM public.assignments a
            WHERE a.id = submissions.assignment_id
              AND a.instructor_id = auth.uid()
        )
    );

-- ============
-- Trigger: auto-create users row when a user signs up via auth.users
-- ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, role, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'role', 'student'),
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
