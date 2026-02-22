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
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,
    auth_provider TEXT NOT NULL DEFAULT 'email' CHECK (auth_provider IN ('email', 'phone', 'google', 'facebook')),
    provider_id TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour recherche par téléphone et email
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON public.users(auth_provider, provider_id);

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
-- 10. TABLE victories (publications)
-- ============================================
CREATE TABLE IF NOT EXISTS public.victories (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    opponent_name TEXT,
    score TEXT,
    event_date TIMESTAMPTZ,
    match_type TEXT CHECK (match_type IN ('singles', 'doubles', 'tournament')),
    photo_url TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_victories_user_id ON public.victories(user_id);
CREATE INDEX IF NOT EXISTS idx_victories_created_at ON public.victories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_victories_is_public ON public.victories(is_public);

-- ============================================
-- 11. TABLE events
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    event_type TEXT CHECK (event_type IN ('tournament', 'local_meetup', 'training', 'social')),
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    max_participants INTEGER,
    current_participants INTEGER DEFAULT 0,
    registration_deadline TIMESTAMPTZ,
    entry_fee DECIMAL(10,2),
    requirements TEXT,
    banner_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON public.events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_city ON public.events(city);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON public.events(is_public);

-- ============================================
-- 12. TABLE event_participants
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_participants (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    registration_date TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT CHECK (status IN ('registered', 'confirmed', 'cancelled', 'attended')) DEFAULT 'registered',
    notes TEXT,
    UNIQUE(event_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user_id ON public.event_participants(user_id);

-- ============================================
-- 13. TABLE notifications
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'ad_reply', 'event_invite', 'victory_like', 'follow')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT, -- ID of related entity (message, ad, event, etc.)
    related_type TEXT, -- Type of related entity
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================
-- ROW LEVEL SECURITY for new tables
-- ============================================
ALTER TABLE public.victories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Victories policies
CREATE POLICY "Victories are viewable by everyone" ON public.victories
    FOR SELECT USING (is_public = true);

CREATE POLICY "Victories insertable by anon" ON public.victories
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Victories updatable by anon" ON public.victories
    FOR UPDATE USING (true);

CREATE POLICY "Victories deletable by anon" ON public.victories
    FOR DELETE USING (true);

-- Events policies
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Events insertable by anon" ON public.events
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Events updatable by anon" ON public.events
    FOR UPDATE USING (true);

CREATE POLICY "Events deletable by anon" ON public.events
    FOR DELETE USING (true);

-- Event participants policies
CREATE POLICY "Participants viewable" ON public.event_participants
    FOR SELECT USING (true);

CREATE POLICY "Participants insertable" ON public.event_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Participants updatable" ON public.event_participants
    FOR UPDATE USING (true);

-- Notifications policies
CREATE POLICY "Notifications viewable by owner" ON public.notifications
    FOR SELECT USING (true);

CREATE POLICY "Notifications insertable" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Notifications updatable" ON public.notifications
    FOR UPDATE USING (true);

-- ============================================
-- TRIGGERS for updated_at columns
-- ============================================
DROP TRIGGER IF EXISTS trigger_victories_updated_at ON public.victories;
CREATE TRIGGER trigger_victories_updated_at
    BEFORE UPDATE ON public.victories
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
-- FIN DU SCRIPT
-- ============================================
-- Après exécution, votre base TennisMatch est prête.
-- Configurez les variables d'environnement dans Vercel :
--   NEXT_PUBLIC_SUPABASE_URL
--   NEXT_PUBLIC_SUPABASE_ANON_KEY

