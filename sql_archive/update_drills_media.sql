-- 1. Añadimos las columnas de image_url y video_url a la tabla drills
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS video_url text;

-- 2. Creamos el bucket 'drills' en Supabase Storage (si no existe)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('drills', 'drills', true) 
ON CONFLICT (id) DO NOTHING;

-- 3. Políticas de seguridad para el bucket 'drills'
CREATE POLICY "Drills Storage Upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'drills');
CREATE POLICY "Drills Storage Update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'drills');
CREATE POLICY "Drills Storage Delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'drills');
CREATE POLICY "Drills Storage View" ON storage.objects FOR SELECT TO public USING (bucket_id = 'drills');

-- Recargamos el cache (Opcional)
NOTIFY pgrst, 'reload schema';
