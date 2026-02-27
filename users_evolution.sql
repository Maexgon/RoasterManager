-- users_evolution.sql
-- 1. Modificar tabla Profiles para el nuevo sistema de roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text DEFAULT 'Staff';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_parent boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS force_password_change boolean DEFAULT false;

-- 2. Migrar roles actuales a la nueva estructura (Head Coach = Admin)
UPDATE public.profiles SET role = 'Admin' WHERE sports_role = 'Head Coach';
UPDATE public.profiles SET role = 'Manager' WHERE sports_role = 'Manager';
UPDATE public.profiles SET role = 'Staff' WHERE sports_role IN ('Entrenador', 'Preparador Físico');

-- 3. Crear tabla de Vinculación Familiar (Padres)
CREATE TABLE IF NOT EXISTS public.player_parents (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  parent_profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  player_id uuid REFERENCES public.players(id) ON DELETE CASCADE NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(parent_profile_id, player_id)
);

-- 4. Habilitar RLS en la nueva tabla
ALTER TABLE public.player_parents ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de RLS para player_parents
DROP POLICY IF EXISTS "Admins and Managers can mannage player_parents" ON player_parents;
CREATE POLICY "Admins and Managers can mannage player_parents" 
ON player_parents FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role IN ('Admin', 'Manager')
  )
);

DROP POLICY IF EXISTS "Parents can view their own linkages" ON player_parents;
CREATE POLICY "Parents can view their own linkages" 
ON player_parents FOR SELECT 
USING (parent_profile_id = auth.uid());

-- 6. ACTUALIZACIÓN DE RLS EN OTRAS TABLAS (Basado en rules.md)

-- PLAYERS
DROP POLICY IF EXISTS "Players visibility based on rules" ON players;
CREATE POLICY "Players visibility based on rules" ON players FOR SELECT
USING (
  -- Admin, Manager y Staff ven todo
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager', 'Staff'))
  OR
  -- Padres solo ven sus hijos vinculados
  EXISTS (SELECT 1 FROM player_parents WHERE parent_profile_id = auth.uid() AND player_id = players.id)
);

-- SKILLS
DROP POLICY IF EXISTS "Skills visibility based on rules" ON skills;
CREATE POLICY "Skills visibility based on rules" ON skills FOR SELECT
USING (
  -- Admin, Manager y Staff ven todo
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager', 'Staff'))
  OR
  -- Padres solo ven las de sus hijos vinculados
  EXISTS (SELECT 1 FROM player_parents WHERE parent_profile_id = auth.uid() AND player_id = skills.player_id)
);

-- BILLBOARD_POSTS (Categorización estricta por visibilidad)
DROP POLICY IF EXISTS "Billboard visibility based on rules" ON billboard_posts;
CREATE POLICY "Billboard visibility based on rules" ON billboard_posts FOR SELECT
USING (
  -- Admin, Manager y Staff ven todo (incluyendo privados si son autores)
  (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('Admin', 'Manager', 'Staff')))
  OR
  -- Padres solo ven mensajes públicos
  (category = 'publico')
);

-- Notificar recarga de caché
NOTIFY pgrst, 'reload schema';
