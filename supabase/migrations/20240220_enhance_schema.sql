-- ============================================
-- Enhancement: Countries, Experience, and Victories
-- ============================================

-- 1. Update user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS experience TEXT;

-- 2. Update ads
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS country TEXT;
ALTER TABLE public.ads ADD COLUMN IF NOT EXISTS location_details TEXT;

-- 3. Create victories table
CREATE TABLE IF NOT EXISTS public.victories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    event_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable RLS and add policies for victories
ALTER TABLE public.victories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Victories are viewable by everyone" ON public.victories
    FOR SELECT USING (true);

CREATE POLICY "Victories insertable by anon" ON public.victories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Victories updatable by anon" ON public.victories
    FOR UPDATE USING (true);

CREATE INDEX IF NOT EXISTS idx_victories_user_id ON public.victories(user_id);
CREATE INDEX IF NOT EXISTS idx_victories_event_date ON public.victories(event_date DESC);
