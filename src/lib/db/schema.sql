-- ==============================================================================
-- GenAct PWA · Esquema de Base de Datos PostgreSQL & Supabase con RLS
-- ==============================================================================

-- 1. Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabla de Perfiles Docentes (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  school_name TEXT DEFAULT '',
  role TEXT DEFAULT 'Docente de Primaria',
  avatar_url TEXT DEFAULT '',
  is_pro BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Tabla de Fichas Guardadas por Docente (Vault personal)
CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'wordsearch', 'crossword', 'sudoku', etc.
  difficulty TEXT NOT NULL DEFAULT 'medium',
  folder TEXT NOT NULL DEFAULT 'General',
  notes TEXT DEFAULT '',
  word_count INT DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  snapshot JSONB NOT NULL, -- Almacena palabras, pistas, cuadrículas y opciones de encabezado
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Tabla de Biblioteca Pública Comunitaria (Public Shared Feed)
CREATE TABLE IF NOT EXISTS public.community_feed (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'medium',
  subject TEXT NOT NULL DEFAULT 'General',
  grade TEXT NOT NULL DEFAULT 'Primaria',
  description TEXT NOT NULL,
  snapshot JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  likes_count INT DEFAULT 0,
  downloads_count INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Tabla de Me Gusta de la Comunidad (Evita votos duplicados)
CREATE TABLE IF NOT EXISTS public.community_likes (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  community_id UUID NOT NULL REFERENCES public.community_feed(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (user_id, community_id)
);

-- ==============================================================================
-- POLÍTICAS DE SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Los perfiles son visibles públicamente"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Los docentes sólo editan su propio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para Activities (Personal Vault)
CREATE POLICY "Los docentes sólo leen sus propias actividades"
  ON public.activities FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Los docentes sólo insertan sus propias actividades"
  ON public.activities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los docentes sólo actualizan sus propias actividades"
  ON public.activities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Los docentes sólo eliminan sus propias actividades"
  ON public.activities FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para Community Feed
CREATE POLICY "Cualquier persona puede leer la biblioteca pública"
  ON public.community_feed FOR SELECT
  USING (true);

CREATE POLICY "Docentes autenticados pueden publicar en la comunidad"
  ON public.community_feed FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Índices de alto rendimiento para búsquedas pedagógicas
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON public.activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_folder ON public.activities(folder);
CREATE INDEX IF NOT EXISTS idx_community_subject ON public.community_feed(subject);
CREATE INDEX IF NOT EXISTS idx_community_type ON public.community_feed(type);
CREATE INDEX IF NOT EXISTS idx_community_created_at ON public.community_feed(created_at DESC);
