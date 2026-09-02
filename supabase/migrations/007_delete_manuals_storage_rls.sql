-- Storage RLS: instructors can DELETE manual PDFs they uploaded (any file in manuals bucket).
-- (INSERT + UPDATE already added in 006_manual_pdf.sql; SELECT for public too.)
DROP POLICY IF EXISTS "Instructors delete manuals" ON storage.objects;
CREATE POLICY "Instructors delete manuals"
ON storage.objects
FOR DELETE TO authenticated
USING (
  bucket_id = 'manuals' AND
  public.auth_user_role() = 'instructor'
);
