"use server";

import { supabase } from "@/lib/supabase";
import { AdType, UserLevel } from "@/types";
import { revalidatePath } from "next/cache";

export async function createAd(formData: any) {
  const { userId, type, title, description, country, city, location, location_details, eventDatetime, requiredLevel } = formData;

  if (!userId || !type || !title || !description || !country || !city) {
    return { error: "Veuillez remplir tous les champs obligatoires (Type, Titre, Description, Pays, Ville)." };
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
          country,
          city,
          location: location || null,
          location_details: location_details || null,
          event_datetime: eventDatetime || null,
          required_level: requiredLevel || null,
          is_active: true,
          is_deleted: false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    revalidatePath("/ads");
    revalidatePath("/ads/my");
    revalidatePath("/");

    return { success: true, adId: data.id };
  } catch (error: any) {
    console.error("Create ad error:", error);
    return { error: "Une erreur est survenue lors de la création de l'annonce : " + (error.message || "Erreur inconnue") };
  }
}

export async function getAds(filters: any = {}) {
  const { type, country, city, level } = filters;

  try {
    let query = supabase
      .from('ads')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('is_deleted', false)
      .eq('is_active', true);

    if (type) {
      query = query.eq('type', type);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (level) {
      query = query.eq('required_level', level);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // Flatten the join result for convenience if needed, 
    // but the UI currently expects ad.display_name
    return data.map((ad: any) => ({
      ...ad,
      display_name: ad.user_profiles?.display_name || "Utilisateur",
      avatar_url: ad.user_profiles?.avatar_url
    }));
  } catch (error) {
    console.error("Fetch ads error:", error);
    return [];
  }
}

export async function getAdById(id: string) {
  try {
    const numericId = parseInt(id);
    const { data, error } = await supabase
      .from('ads')
      .select('*, user_profiles(display_name, avatar_url, level), users(phone)')
      .eq('id', isNaN(numericId) ? id : numericId)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      display_name: data.user_profiles?.display_name || "Utilisateur",
      avatar_url: data.user_profiles?.avatar_url || null,
      user_level: data.user_profiles?.level || "debutant",
      phone: data.users?.phone || ""
    };
  } catch (error) {
    console.error("Fetch ad detail error:", error);
    return null;
  }
}
