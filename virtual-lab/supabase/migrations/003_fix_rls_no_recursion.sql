-- Fix infinite recursion on RLS policies for public.users,
-- public.assignments, and public.submissions.
--
-- Root cause: policies like
--   EXISTS (SELECT 1 FROM public.users u WHERE u.id = auth.uid() AND u.role = 'instructor')
-- when applied to public.users itself cause infinite recursion (42P17).
--
-- Fix strategy: use a SECURITY DEFINER helper function in the public schema
-- that reads auth.uid() and looks up public.users without recursion,
-- because SECURITY DEFINER functions bypass RLS for the caller's context
-- when the owner of the function has BYPASSRLS or we don't touch the same
-- table with RLS in the same policy path. To be completely safe, we
-- read role directly only when the id equals auth.uid() for self lookups.
--
-- We also take the simpler, well-known approach:
--   Self-lookup policies:    "id = auth.uid()" — no recursion, no subquery.
--   Cross-lookup for role:   use a SECURITY DEFINER helper that checks role
--                            of the calling user once, no recursion.

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

-- Owner matters: in Supabase, you (the dashboard user) are typically
-- superuser-equivalent. No explicit grant needed if we created it.
GRANT EXECUTE ON FUNCTION public.auth_user_role() TO anon, authenticated;

-- ========== users table policies (rewrite) ==========
DROP POLICY IF EXISTS "users read own" ON public.users;
DROP POLICY IF EXISTS "instructors read users" ON public.users;

-- Any authenticated user can read their own row (id matches auth.uid()).
-- No subquery → no recursion.
CREATE POLICY "users read own" ON public.users
    FOR SELECT
    USING (id = auth.uid());

-- Instructors can read ALL users (needed for grading screen showing student names).
-- Uses auth_user_role() SECURITY DEFINER helper, which bypasses the users RLS policy
-- and avoids self-recursion.
CREATE POLICY "instructors read all users" ON public.users
    FOR SELECT
    USING (public.auth_user_role() = 'instructor');

-- ========== assignments table policies (rewrite) ==========
DROP POLICY IF EXISTS "instructors manage own assignments" ON public.assignments;
DROP POLICY IF EXISTS "students read assignments" ON public.assignments;

-- Instructors can do everything to assignments where they are the owner.
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

-- Students can read all assignments.
CREATE POLICY "students read assignments" ON public.assignments
    FOR SELECT
    USING (public.auth_user_role() = 'student');

-- ========== submissions table policies (rewrite) ==========
DROP POLICY IF EXISTS "students manage own submissions" ON public.submissions;
DROP POLICY IF EXISTS "instructors grade submissions" ON public.submissions;

-- Students can CRUD their own submissions.
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

-- Instructors can CRUD submissions for assignments they own
-- (check ownership via assignments.instructor_id joined inline, NOT via users RLS).
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
