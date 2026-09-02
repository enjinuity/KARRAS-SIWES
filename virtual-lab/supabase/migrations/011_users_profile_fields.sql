-- 011_users_profile_fields.sql
-- Extend public.users with realistic Nigerian university student & instructor profile fields
-- so the prototype looks production-like: matriculation number, faculty, department,
-- level (100-500), phone, updated_at.

ALTER TABLE public.users
    ADD COLUMN IF NOT EXISTS matric_no TEXT,
    ADD COLUMN IF NOT EXISTS faculty TEXT,
    ADD COLUMN IF NOT EXISTS department TEXT,
    ADD COLUMN IF NOT EXISTS level INTEGER CHECK (level IS NULL OR level IN (100, 200, 300, 400, 500, 600)),
    ADD COLUMN IF NOT EXISTS phone TEXT,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS users_matric_no_key ON public.users (matric_no) WHERE matric_no IS NOT NULL;
CREATE INDEX IF NOT EXISTS users_department_idx ON public.users (department);
CREATE INDEX IF NOT EXISTS users_level_idx ON public.users (level);

-- Re-apply touch_updated_at trigger so profile edits refresh updated_at
DROP TRIGGER IF EXISTS touch_users_updated_at ON public.users;
CREATE TRIGGER touch_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();
