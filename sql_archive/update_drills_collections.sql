-- 1. Añadimos columnas de arrays para las imágenes y PDFs múltiples
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';
ALTER TABLE public.drills ADD COLUMN IF NOT EXISTS pdf_urls text[] DEFAULT '{}';

-- Recargar cache de PostgREST
NOTIFY pgrst, 'reload schema';
