-- 006_manual_pdf.sql: storage for assignment manual PDFs + auto-grading columns already in place

ALTER TABLE public.assignments ADD COLUMN IF NOT EXISTS manual_pdf_url TEXT;

-- Idempotently create the "manuals" public storage bucket
INSERT INTO storage.buckets (id, name, public, created_at)
VALUES ('manuals', 'manuals', true, now())
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: instructors can upload / overwrite any PDF in manuals bucket
DROP POLICY IF EXISTS "Instructors upload manuals" ON storage.objects;
CREATE POLICY "Instructors upload manuals"
ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'manuals' AND
  public.auth_user_role() = 'instructor'
);

DROP POLICY IF EXISTS "Instructors update manuals" ON storage.objects;
CREATE POLICY "Instructors update manuals"
ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'manuals' AND public.auth_user_role() = 'instructor')
WITH CHECK (bucket_id = 'manuals' AND public.auth_user_role() = 'instructor');

-- Anyone (anon + authenticated) can read manuals bucket (PDFs are public materials)
DROP POLICY IF EXISTS "Public read manuals" ON storage.objects;
CREATE POLICY "Public read manuals"
ON storage.objects
FOR SELECT
USING (bucket_id = 'manuals');
