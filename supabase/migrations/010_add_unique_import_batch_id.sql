-- 010_add_unique_import_batch_id.sql
-- Postgres UNIQUE constraint on manuals.import_batch_id so seed queries can
-- safely do ON CONFLICT (import_batch_id) WHERE import_batch_id IS NOT NULL DO NOTHING
-- without hitting "there is no unique or exclusion constraint matching the ON CONFLICT specification".

ALTER TABLE public.manuals
    ADD CONSTRAINT manuals_import_batch_id_key UNIQUE (import_batch_id);
