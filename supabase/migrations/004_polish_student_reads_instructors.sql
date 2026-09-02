-- Polish: students need to read instructor rows (role='instructor') so that
-- .select('*, users!assignments_instructor_id_fkey(full_name)') in the
-- student assignment list can show "Instructor: Demo Instructor" instead of "—".
-- They do NOT get to see any student rows (so no privacy leak of student names).

DROP POLICY IF EXISTS "students read instructor profiles" ON public.users;
CREATE POLICY "students read instructor profiles" ON public.users
    FOR SELECT
    USING (
        public.auth_user_role() = 'student'
        AND role = 'instructor'
    );
