-- Add expected_output to assignments (nullable text)
ALTER TABLE public.assignments
ADD COLUMN IF NOT EXISTS expected_output TEXT;

-- Add auto_passed to submissions (nullable boolean, or default false)
ALTER TABLE public.submissions
ADD COLUMN IF NOT EXISTS auto_passed BOOLEAN;
