"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

export async function getProfile(userId: number) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*, users(phone)')
            .eq('user_id', userId)
            .single();

        if (error || !data) return null;

        return {
            ...data,
            phone: data.users?.phone
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
    const { displayName, age, city, level, bio, isPublic } = data;

    try {
        const { error } = await supabase
            .from('user_profiles')
            .update({
                display_name: displayName,
                age: age || null,
                city: city || null,
                level: level || null,
                bio: bio || null,
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
