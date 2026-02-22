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
      .eq('is_deleted', false)
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

export async function updateAd(adId: string, formData: any, userId: number) {
  const { type, title, description, country, city, location, location_details, eventDatetime, requiredLevel } = formData;

  if (!adId || !type || !title || !description || !country || !city) {
    return { error: "Veuillez remplir tous les champs obligatoires (Type, Titre, Description, Pays, Ville)." };
  }

  try {
    // First check if the ad belongs to the user
    const { data: existingAd, error: checkError } = await supabase
      .from('ads')
      .select('user_id')
      .eq('id', adId)
      .single();

    if (checkError || !existingAd) {
      return { error: "Annonce non trouvée." };
    }

    if (existingAd.user_id !== userId) {
      return { error: "Vous n'êtes pas autorisé à modifier cette annonce." };
    }

    const { data, error } = await supabase
      .from('ads')
      .update({
        type,
        title,
        description,
        country,
        city,
        location: location || null,
        location_details: location_details || null,
        event_datetime: eventDatetime || null,
        required_level: requiredLevel || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', adId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    revalidatePath("/ads");
    revalidatePath("/ads/my");
    revalidatePath(`/ads/${adId}`);

    return { success: true, ad: data };
  } catch (error: any) {
    console.error("Update ad error:", error);
    return { error: "Une erreur est survenue lors de la mise à jour de l'annonce : " + (error.message || "Erreur inconnue") };
  }
}

export async function deleteAd(adId: string, userId: number) {
  if (!adId) {
    return { error: "ID de l'annonce requis." };
  }

  try {
    // First check if the ad belongs to the user
    const { data: existingAd, error: checkError } = await supabase
      .from('ads')
      .select('user_id')
      .eq('id', adId)
      .single();

    if (checkError || !existingAd) {
      return { error: "Annonce non trouvée." };
    }

    if (existingAd.user_id !== userId) {
      return { error: "Vous n'êtes pas autorisé à supprimer cette annonce." };
    }

    // Soft delete
    const { error } = await supabase
      .from('ads')
      .update({ 
        is_deleted: true, 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', adId);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    revalidatePath("/ads");
    revalidatePath("/ads/my");
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Delete ad error:", error);
    return { error: "Une erreur est survenue lors de la suppression de l'annonce : " + (error.message || "Erreur inconnue") };
  }
}

export async function getMyAds(userId: number) {
  try {
    const { data, error } = await supabase
      .from('ads')
      .select('*')
      .eq('user_id', userId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase fetch my ads error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Fetch my ads error:", error);
    return [];
  }
}

export async function toggleAdStatus(adId: string, userId: number) {
  if (!adId) {
    return { error: "ID de l'annonce requis." };
  }

  try {
    // First check if the ad belongs to the user
    const { data: existingAd, error: checkError } = await supabase
      .from('ads')
      .select('user_id, is_active')
      .eq('id', adId)
      .single();

    if (checkError || !existingAd) {
      return { error: "Annonce non trouvée." };
    }

    if (existingAd.user_id !== userId) {
      return { error: "Vous n'êtes pas autorisé à modifier cette annonce." };
    }

    // Toggle status
    const { error } = await supabase
      .from('ads')
      .update({ 
        is_active: !existingAd.is_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', adId);

    if (error) {
      console.error("Supabase toggle status error:", error);
      throw error;
    }

    revalidatePath("/ads");
    revalidatePath("/ads/my");

    return { success: true, isActive: !existingAd.is_active };
  } catch (error: any) {
    console.error("Toggle ad status error:", error);
    return { error: "Une erreur est survenue lors de la modification du statut : " + (error.message || "Erreur inconnue") };
  }
}
