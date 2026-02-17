"use server";

import { supabase } from "@/lib/supabase";
import { AdType, UserLevel } from "@/types";
import { revalidatePath } from "next/cache";
import { MOCK_ADS } from "@/lib/mockData";

export async function createAd(formData: any) {
  const { userId, type, title, description, city, location, eventDatetime, requiredLevel } = formData;

  if (!userId || !type || !title || !description || !city) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  try {
    const { data, error } = await supabase
      .from('ads')
      .insert([
        {
          user_id: userId,
          type,
          title,
          description,
          city,
          location: location || null,
          event_datetime: eventDatetime || null,
          required_level: requiredLevel || null
        }
      ])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/");
    revalidatePath("/ads");

    return { success: true, adId: data.id };
  } catch (error: any) {
    console.error("Create ad error:", error);
    return { error: "Une erreur est survenue lors de la création de l'annonce." };
  }
}

export async function getAds(filters: any = {}) {
  const { type, city, level } = filters;

  try {
    let query = supabase
      .from('ads')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('is_active', true)
      .eq('is_deleted', false);

    if (type) {
      query = query.eq('type', type);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (level) {
      query = query.eq('required_level', level);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.warn("Supabase fetch error (falling back to mocks):", error);
      return MOCK_ADS;
    }

    if (!data || data.length === 0) return MOCK_ADS;

    // Flatten the join result for convenience if needed, 
    // but the UI currently expects ad.display_name
    return data.map((ad: any) => ({
      ...ad,
      display_name: ad.user_profiles?.display_name || "Utilisateur",
      avatar_url: ad.user_profiles?.avatar_url
    }));
  } catch (error) {
    console.error("Fetch ads error (falling back to mocks):", error);
    return MOCK_ADS;
  }
}

export async function getAdById(id: string) {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*, user_profiles(display_name, avatar_url, level), users(phone)')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.warn("Ad not found or error (falling back to mocks):", error);
      const mock = MOCK_ADS.find(a => a.id.toString() === id.toString());
      return mock || null;
    }

    return {
      ...data,
      display_name: data.user_profiles?.display_name || "Utilisateur",
      avatar_url: data.user_profiles?.avatar_url || null,
      user_level: data.user_profiles?.level || "debutant",
      phone: data.users?.phone || ""
    };
  } catch (error) {
    console.error("Fetch ad detail error (falling back to mocks):", error);
    const mock = MOCK_ADS.find(a => a.id.toString() === id.toString());
    return mock || null;
  }
}
