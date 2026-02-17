"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { MOCK_PROFILE, MOCK_ADS } from "@/lib/mockData";

export async function getProfile(userId: number) {
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('*, users(phone)')
            .eq('user_id', userId)
            .single();

        if (error || !data) return MOCK_PROFILE;

        return {
            ...data,
            phone: data.users?.phone
        };
    } catch (error) {
        console.error("Fetch profile error (mock fallback):", error);
        return MOCK_PROFILE;
    }
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

        if (error || !data || data.length === 0) return MOCK_ADS.filter(a => a.user_id === userId);

        return data;
    } catch (error) {
        console.error("Fetch user ads error (mock fallback):", error);
        return MOCK_ADS.filter(a => a.user_id === userId);
    }
}
