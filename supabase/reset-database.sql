-- ============================================
-- SCRIPT DE RÉINITIALISATION COMPLÈTE - TenisMatch
-- ============================================
-- Ce script supprime TOUTES les tables et les recrée entièrement
-- À utiliser pour une réinitialisation complète de la base de données

-- DÉSACTIVER les contraintes temporairement
SET CONSTRAINTS ALL OFF;

-- Supprimer toutes les tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.event_participants CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.victories CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversation_participants CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Supprimer les vues
DROP VIEW IF EXISTS public.conversations_full CASCADE;
DROP VIEW IF EXISTS public.ads_full CASCADE;
DROP VIEW IF EXISTS public.user_profiles_full CASCADE;

-- Supprimer les fonctions
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_conversation_last_message() CASCADE;
DROP FUNCTION IF EXISTS public.increment_event_participants() CASCADE;
DROP FUNCTION IF EXISTS public.decrement_event_participants() CASCADE;

-- Supprimer les triggers
DROP TRIGGER IF EXISTS trigger_victories_updated_at ON public.victories;
DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
DROP TRIGGER IF EXISTS trigger_ads_updated_at ON public.ads;
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
DROP TRIGGER IF EXISTS trigger_messages_update_conversation ON public.messages;
DROP TRIGGER IF EXISTS trigger_event_participants_increment ON public.event_participants;
DROP TRIGGER IF EXISTS trigger_event_participants_decrement ON public.event_participants;

-- Réactiver les contraintes
SET CONSTRAINTS ALL;

-- ============================================
# RECÉATION COMPLÈTE DE LA BASE DE DONNÉES
# ============================================

-- 1. TABLE users (authentification par téléphone uniquement)
CREATE TABLE IF NOT EXISTS public.users (
    id BIGSERIAL PRIMARY KEY,
    phone TEXT NOT NULL UNIQUE,
    country_code TEXT NOT NULL DEFAULT '+33', -- Code pays par défaut (France)
    phone_number TEXT NOT NULL, -- Numéro sans le code pays
    full_phone TEXT GENERATED ALWAYS AS (country_code || '') || phone_number STORED,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_banned BOOLEAN NOT NULL DEFAULT false,
    is_verified BOOLEAN NOT NULL DEFAULT false, -- Pour vérification par SMS
    verification_code TEXT, -- Code de vérification SMS
    verification_expires_at TIMESTAMPTZ, -- Expiration du code de vérification
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index pour recherche par téléphone
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(full_phone);
CREATE INDEX IF NOT EXISTS idx_users_country_code ON public.users(country_code);
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);

-- 2. TABLE user_profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    age INTEGER,
    country TEXT NOT NULL,
    city TEXT,
    level TEXT CHECK (level IN ('debutant', 'intermediaire', 'avance')),
    avatar_url TEXT,
    bio TEXT,
    is_public BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_country ON public.user_profiles(country);
CREATE INDEX IF NOT EXISTS idx_user_profiles_city ON public.user_profiles(city);
CREATE INDEX IF NOT EXISTS idx_user_profiles_level ON public.user_profiles(level);

-- 3. TABLE ads
CREATE TABLE IF NOT EXISTS public.ads (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('partenaire', 'match', 'tournoi', 'materiel')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    country TEXT NOT NULL,
    city TEXT NOT NULL,
    location TEXT,
    location_details TEXT,
    event_datetime TIMESTAMPTZ,
    required_level TEXT CHECK (required_level IN ('debutant', 'intermediaire', 'avance')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ads_user_id ON public.ads(user_id);
CREATE INDEX IF NOT EXISTS idx_ads_type ON public.ads(type);
CREATE INDEX IF NOT EXISTS idx_ads_country ON public.ads(country);
CREATE INDEX IF NOT EXISTS idx_ads_city ON public.ads(city);
CREATE INDEX IF NOT EXISTS idx_ads_event_datetime ON public.ads(event_datetime);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ads_active ON public.ads(is_active, is_deleted);

-- 4. TABLE conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id BIGSERIAL PRIMARY KEY,
    created_by BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    ad_id BIGINT REFERENCES public.ads(id) ON DELETE SET NULL,
    last_message_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by ON public.conversations(created_by);

-- 5. TABLE conversation_participants
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

-- 6. TABLE messages
CREATE TABLE IF NOT EXISTS public.messages (
    id BIGSERIAL PRIMARY KEY,
    conversation_id BIGINT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'location')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_read ON public.messages(is_read);

-- 7. TABLE victories (publications)
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
CREATE INDEX IF NOT EXISTS idx_victories_event_date ON public.victories(event_date DESC);

-- 8. TABLE events
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
CREATE INDEX IF NOT EXISTS idx_events_country ON public.events(country);
CREATE INDEX IF NOT EXISTS idx_events_is_public ON public.events(is_public, is_active);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(event_type);

-- 9. TABLE event_participants
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
CREATE INDEX IF NOT EXISTS idx_event_participants_status ON public.event_participants(status);

-- 10. TABLE notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('message', 'ad_reply', 'event_invite', 'victory_like', 'follow', 'verification')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT,
    related_type TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);

-- ============================================
# FONCTION POUR METTRE À JOUR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
DROP TRIGGER IF EXISTS trigger_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_ads_updated_at ON public.ads;
CREATE TRIGGER trigger_ads_updated_at
    BEFORE UPDATE ON public.ads
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_victories_updated_at ON public.victories;
CREATE TRIGGER trigger_victories_updated_at
    BEFORE UPDATE ON public.victories
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_events_updated_at ON public.events;
CREATE TRIGGER trigger_events_updated_at
    BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================
# FONCTION POUR METTRE À JOUR last_message_at DANS CONVERSATIONS
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
# FONCTIONS POUR METTRE À JOUR current_participants DANS ÉVÉNEMENTS
-- ============================================
CREATE OR REPLACE FUNCTION increment_event_participants()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.events
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decrement_event_participants()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.events
    SET current_participants = GREATEST(0, current_participants - 1)
    WHERE id = OLD.event_id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_event_participants_increment ON public.event_participants;
CREATE TRIGGER trigger_event_participants_increment
    AFTER INSERT ON public.event_participants
    FOR EACH ROW EXECUTE PROCEDURE increment_event_participants();

DROP TRIGGER IF EXISTS trigger_event_participants_decrement ON public.event_participants;
CREATE TRIGGER trigger_event_participants_decrement
    AFTER DELETE ON public.event_participants
    FOR EACH ROW EXECUTE PROCEDURE decrement_event_participants();

-- ============================================
# VUES POUR FACILITER LES REQUÊTES
-- ============================================

-- Vue des utilisateurs avec profils
CREATE OR REPLACE VIEW public.user_profiles_full AS
SELECT 
    u.id,
    u.full_phone,
    u.phone_number,
    u.country_code,
    u.is_active,
    u.is_verified,
    up.display_name,
    up.age,
    up.country as profile_country,
    up.city,
    up.level,
    up.avatar_url,
    up.bio,
    up.is_public,
    u.created_at as user_created_at,
    up.updated_at as profile_updated_at
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id;

-- Vue des annonces avec infos utilisateur
CREATE OR REPLACE VIEW public.ads_full AS
SELECT 
    a.*,
    up.display_name,
    up.avatar_url,
    up.level as user_level,
    u.full_phone,
    u.country_code
FROM public.ads a
JOIN public.users u ON a.user_id = u.id
LEFT JOIN public.user_profiles up ON u.id = up.user_id
WHERE a.is_deleted = false;

-- Vue des conversations avec participants
CREATE OR REPLACE VIEW public.conversations_full AS
SELECT 
    c.*,
    cp.user_id as participant_id,
    up.display_name as participant_name,
    up.avatar_url as participant_avatar
FROM public.conversations c
JOIN public.conversation_participants cp ON c.id = cp.conversation_id
JOIN public.users u ON cp.user_id = u.id
LEFT JOIN public.user_profiles up ON u.id = up.user_id;

-- ============================================
# ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users: lecture par téléphone uniquement
CREATE POLICY "Users readable by phone for auth" ON public.users
    FOR SELECT USING (true);

CREATE POLICY "Users insertable by anon" ON public.users
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users updatable by owner" ON public.users
    FOR UPDATE USING (id = current_setting('app.current_user_id')::bigint);

-- User profiles: lecture publique
CREATE POLICY "Profiles are viewable by everyone" ON public.user_profiles
    FOR SELECT USING (is_public = true);

CREATE POLICY "Profiles insertable by anon" ON public.user_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Profiles updatable by owner" ON public.user_profiles
    FOR UPDATE USING (user_id = current_setting('app.current_user_id')::bigint);

-- Ads: lecture publique des annonces actives
CREATE POLICY "Ads are viewable by everyone" ON public.ads
    FOR SELECT USING (is_active = true AND is_deleted = false);

CREATE POLICY "Ads insertable by authenticated" ON public.ads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Ads updatable by owner" ON public.ads
    FOR UPDATE USING (user_id = current_setting('app.current_user_id')::bigint);

CREATE POLICY "Ads deletable by owner" ON public.ads
    FOR DELETE USING (user_id = current_setting('app.current_user_id')::bigint);

-- Conversations: lecture pour participants
CREATE POLICY "Conversations viewable by participants" ON public.conversations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp 
            WHERE cp.conversation_id = public.conversations.id 
            AND cp.user_id = current_setting('app.current_user_id')::bigint
        )
    );

CREATE POLICY "Conversations insertable by authenticated" ON public.conversations
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Conversation participants
CREATE POLICY "Participants viewable by participants" ON public.conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp2 
            WHERE cp2.conversation_id = public.conversation_participants.conversation_id 
            AND cp2.user_id = current_setting('app.current_user_id')::bigint
        )
    );

CREATE POLICY "Participants insertable by authenticated" ON public.conversation_participants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Messages
CREATE POLICY "Messages viewable by conversation participants" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp 
            WHERE cp.conversation_id = public.messages.conversation_id 
            AND cp.user_id = current_setting('app.current_user_id')::bigint
        )
    );

CREATE POLICY "Messages insertable by authenticated" ON public.messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Victories: lecture publique
CREATE POLICY "Victories are viewable by everyone" ON public.victories
    FOR SELECT USING (is_public = true);

CREATE POLICY "Victories insertable by authenticated" ON public.victories
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Victories updatable by owner" ON public.victories
    FOR UPDATE USING (user_id = current_setting('app.current_user_id')::bigint);

CREATE POLICY "Victories deletable by owner" ON public.victories
    FOR DELETE USING (user_id = current_setting('app.current_user_id')::bigint);

-- Events: lecture publique
CREATE POLICY "Events are viewable by everyone" ON public.events
    FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Events insertable by authenticated" ON public.events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Events updatable by owner" ON public.events
    FOR UPDATE USING (user_id = current_setting('app.current_user_id')::bigint);

CREATE POLICY "Events deletable by owner" ON public.events
    FOR DELETE USING (user_id = current_setting('app.current_user_id')::bigint);

-- Event participants
CREATE POLICY "Event participants viewable by everyone" ON public.event_participants
    FOR SELECT USING (true);

CREATE POLICY "Event participants insertable by authenticated" ON public.event_participants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Notifications: lecture par propriétaire uniquement
CREATE POLICY "Notifications viewable by owner" ON public.notifications
    FOR SELECT USING (user_id = current_setting('app.current_user_id')::bigint);

CREATE POLICY "Notifications insertable by system" ON public.notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Notifications updatable by owner" ON public.notifications
    FOR UPDATE USING (user_id = current_setting('app.current_user_id')::bigint);

-- ============================================
# FIN DU SCRIPT DE RÉINITIALISATION
-- ============================================
-- Après exécution, votre base TennisMatch est complètement réinitialisée.
-- Vous pouvez maintenant exécuter le script schema-phone-only.sql pour recréer les tables.
-- Configurez les variables d'environnement dans Vercel :
--   NEXT_PUBLIC_SUPABASE_URL
--   NEXT_PUBLIC_SUPABASE_ANON_KEY
