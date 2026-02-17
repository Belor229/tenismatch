export type UserLevel = 'debutant' | 'intermediaire' | 'avance';

export interface User {
    id: number;
    phone: string;
    is_active: boolean;
    is_banned: boolean;
    created_at: Date;
}

export interface UserProfile {
    user_id: number;
    display_name: string;
    age?: number;
    city?: string;
    level?: UserLevel;
    avatar_url?: string;
    bio?: string;
    is_public: boolean;
}

export type AdType = 'partenaire' | 'match' | 'tournoi' | 'materiel';

export interface Ad {
    id: number;
    user_id: number;
    type: AdType;
    title: string;
    description: string;
    city: string;
    location?: string;
    event_datetime?: Date;
    required_level?: UserLevel;
    is_active: boolean;
    is_deleted: boolean;
    created_at: Date;
}
