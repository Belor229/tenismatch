"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function getProfile(userId: number) {
    try {
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*, users(phone)')
            .eq('user_id', userId)
            .single();

        if (profileError || !profile) return null;

        const { data: victories, error: victoriesError } = await supabase
            .from('victories')
            .select('*')
            .eq('user_id', userId)
            .order('event_date', { ascending: false });

        return {
            ...profile,
            phone: profile.users?.phone,
            victories: victories || []
        };
    } catch (error) {
        console.error("Fetch profile error:", error);
        return null;
    }
}

export async function getProfileForCurrentUser() {
    const userId = await getCurrentUserId();
    if (!userId) return null;
    return getProfile(userId);
}

export async function updateProfile(userId: number, data: any) {
    const { displayName, age, country, city, level, bio, experience, avatarUrl, isPublic } = data;

    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                display_name: displayName,
                age: age || null,
                country: country || null,
                city: city || null,
                level: level || null,
                bio: bio || null,
                experience: experience || null,
                avatar_url: avatarUrl || null,
                is_public: isPublic
            })
            .eq('user_id', userId);

        if (error) throw error;

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Update profile error:", error);
        return { error: "Erreur lors de la mise à jour du profil." };
    }
}

export async function getUserAds(userId: number) {
    try {
        const { data, error } = await supabase
            .from('ads')
            .select('*')
            .eq('user_id', userId)
            .eq('is_deleted', false)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error("Fetch user ads error:", error);
        return [];
    }
}

export async function updateProfileForCurrentUser(data: any) {
    const userId = await getCurrentUserId();
    if (!userId) return { error: "Non authentifié." };
    return updateProfile(userId, data);
}

export async function addVictory(userId: number, data: any) {
    const { title, description, eventDate } = data;
    try {
        const { error } = await supabase
            .from('victories')
            .insert([{ user_id: userId, title, description, event_date: eventDate }]);

        if (error) throw error;
        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Add victory error:", error);
        return { error: "Erreur lors de l'ajout de la victoire." };
    }
}

export async function addVictoryForCurrentUser(data: any) {
    const userId = await getCurrentUserId();
    if (!userId) return { error: "Non authentifié." };
    return addVictory(userId, data);
}
