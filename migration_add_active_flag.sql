-- migration_add_active_flag.sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT false;

-- Marcar como activos a los que ya tienen cuenta (los que están en auth.users)
UPDATE public.profiles 
SET is_active = true 
WHERE id IN (SELECT id FROM auth.users);

-- Ajustar RLS para permitir que el admin vea todo
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can do everything on profiles" ON profiles;
CREATE POLICY "Admins can do everything on profiles" ON profiles FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'Admin')
);
