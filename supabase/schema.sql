-- ============================================
-- TennisMatch - Script SQL complet pour Supabase
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de votre projet Supabase
-- (Dashboard Supabase > SQL Editor > New query)

-- ============================================
-- 1. TABLE users
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    phone TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour recherche par téléphone
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- ============================================
-- 2. TABLE user_profiles
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    age INTEGER,
    city TEXT,
    level TEXT CHECK (level IN ('debutant', 'intermediaire', 'avance')),
    avatar_url TEXT,
    bio TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);

-- ============================================
-- 3. TABLE ads
-- ============================================
CREATE TABLE IF NOT EXISTS public.ads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('partenaire', 'match', 'tournoi', 'materiel')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    city TEXT NOT NULL,
    location TEXT,
    event_datetime TIMESTAMPTZ,
    required_level TEXT CHECK (required_level IN ('debutant', 'intermediaire', 'avance')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_user_id ON public.ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_type ON public.ads(type);
CREATE INDEX IF NOT EXISTS idx_ads_city ON public.ads(city);
CREATE INDEX IF NOT EXISTS idx_ads_event_datetime ON public.ads(event_datetime);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);

-- ============================================
-- 4. TABLE conversations
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
    id BIGSERIAL PRIMARY KEY,
    created_by BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ad_id BIGINT REFERENCES public.ads(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);

-- ============================================
-- 5. TABLE conversation_participants
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    last_read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(conversation_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_conv_participants_conv ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conv_participants_user ON public.conversation_participants(user_id);

-- ============================================
-- 6. TABLE messages
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users: lecture publique (pour vérification login), écriture via service role
CREATE POLICY "Users are viewable by anon key for auth" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users insertable by anon" ON public.users
    FOR INSERT WITH CHECK (true);

-- User profiles: lecture publique
CREATE POLICY "Profiles are viewable by everyone" ON public.user_profiles
    FOR SELECT USING (true);

CREATE POLICY "Profiles insertable by anon" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Profiles updatable by anon" ON public.user_profiles
    FOR UPDATE USING (true);

-- Ads: lecture publique
CREATE POLICY "Ads are viewable by everyone" ON public.ads
    FOR SELECT USING (is_active = true AND is_deleted = false);

CREATE POLICY "Ads insertable by anon" ON public.ads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Ads updatable by anon" ON public.ads
    FOR UPDATE USING (true);

-- Conversations: lecture pour participants (via anon pour simplifier)
CREATE POLICY "Conversations viewable" ON public.conversations
    FOR SELECT USING (true);

CREATE POLICY "Conversations insertable" ON public.conversations
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Conversations updatable" ON public.conversations
    FOR UPDATE USING (true);

-- Conversation participants
CREATE POLICY "Participants viewable" ON public.conversation_participants
    FOR SELECT USING (true);

CREATE POLICY "Participants insertable" ON public.conversation_participants
    FOR INSERT WITH CHECK (true);

-- Messages
CREATE POLICY "Messages viewable" ON public.messages
    FOR SELECT USING (true);

CREATE POLICY "Messages insertable" ON public.messages
    FOR INSERT WITH CHECK (true);

-- ============================================
-- 8. FONCTION pour mettre à jour updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- 9. FONCTION pour mettre à jour last_message_at
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_messages_update_conversation ON public.messages;
CREATE TRIGGER trigger_messages_update_conversation
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE PROCEDURE update_conversation_last_message();

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après exécution, votre base TennisMatch est prête.
-- Configurez les variables d'environnement dans Vercel :
--   NEXT_PUBLIC_SUPABASE_URL
--   NEXT_PUBLIC_SUPABASE_ANON_KEY

