-- Fix the reference of event_notes.created_by so it points to profiles instead of auth.users
-- This allows PostgREST to automatically resolve embeddings like 'profiles(full_name, image_url)'

ALTER TABLE public.event_notes DROP CONSTRAINT IF EXISTS event_notes_created_by_fkey;
ALTER TABLE public.event_notes ADD CONSTRAINT event_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
