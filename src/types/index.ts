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
    country?: string;
    city?: string;
    level?: UserLevel;
    experience?: string;
    avatar_url?: string;
    bio?: string;
    is_public: boolean;
}

export interface Victory {
    id: number;
    user_id: number;
    title: string;
    description?: string;
    event_date?: string;
    created_at: Date;
}

export type AdType = 'partenaire' | 'match' | 'tournoi' | 'materiel';

export interface Ad {
    id: number;
    user_id: number;
    type: AdType;
    title: string;
    description: string;
    country: string;
    city: string;
    location?: string;
    location_details?: string;
    event_datetime?: Date;
    required_level?: UserLevel;
    is_active: boolean;
    is_deleted: boolean;
    created_at: Date;
    display_name?: string; // Appended by join
    avatar_url?: string; // Appended by join
}
