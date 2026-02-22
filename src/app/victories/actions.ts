"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createVictory(formData: any) {
  const { userId, title, description, opponentName, score, eventDate, matchType, photoUrl, isPublic } = formData;

  if (!userId || !title) {
    return { error: "Le titre est requis." };
  }

  try {
    const { data, error } = await supabase
      .from('victories')
      .insert([
        {
          user_id: userId,
          title,
          description: description || null,
          opponent_name: opponentName || null,
          score: score || null,
          event_date: eventDate || null,
          match_type: matchType || 'singles',
          photo_url: photoUrl || null,
          is_public: isPublic !== false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    revalidatePath("/profile");
    revalidatePath("/victories");

    return { success: true, victory: data };
  } catch (error: any) {
    console.error("Create victory error:", error);
    return { error: "Une erreur est survenue lors de la création de la publication : " + (error.message || "Erreur inconnue") };
  }
}

export async function getVictories(filters: any = {}) {
  const { userId, limit = 20, offset = 0 } = filters;

  try {
    let query = supabase
      .from('victories')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    return data?.map((victory: any) => ({
      ...victory,
      display_name: victory.user_profiles?.display_name || "Joueur",
      avatar_url: victory.user_profiles?.avatar_url
    })) || [];
  } catch (error) {
    console.error("Fetch victories error:", error);
    return [];
  }
}

export async function getMyVictories(userId: number) {
  try {
    const { data, error } = await supabase
      .from('victories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase fetch my victories error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Fetch my victories error:", error);
    return [];
  }
}

export async function updateVictory(victoryId: string, formData: any, userId: number) {
  const { title, description, opponentName, score, eventDate, matchType, photoUrl, isPublic } = formData;

  if (!victoryId || !title) {
    return { error: "Le titre est requis." };
  }

  try {
    // First check if the victory belongs to the user
    const { data: existingVictory, error: checkError } = await supabase
      .from('victories')
      .select('user_id')
      .eq('id', victoryId)
      .single();

    if (checkError || !existingVictory) {
      return { error: "Publication non trouvée." };
    }

    if (existingVictory.user_id !== userId) {
      return { error: "Vous n'êtes pas autorisé à modifier cette publication." };
    }

    const { data, error } = await supabase
      .from('victories')
      .update({
        title,
        description: description || null,
        opponent_name: opponentName || null,
        score: score || null,
        event_date: eventDate || null,
        match_type: matchType || 'singles',
        photo_url: photoUrl || null,
        is_public: isPublic !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', victoryId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    revalidatePath("/profile");
    revalidatePath("/victories");
    revalidatePath(`/victories/${victoryId}`);

    return { success: true, victory: data };
  } catch (error: any) {
    console.error("Update victory error:", error);
    return { error: "Une erreur est survenue lors de la mise à jour : " + (error.message || "Erreur inconnue") };
  }
}

export async function deleteVictory(victoryId: string, userId: number) {
  if (!victoryId) {
    return { error: "ID de la publication requis." };
  }

  try {
    // First check if the victory belongs to the user
    const { data: existingVictory, error: checkError } = await supabase
      .from('victories')
      .select('user_id')
      .eq('id', victoryId)
      .single();

    if (checkError || !existingVictory) {
      return { error: "Publication non trouvée." };
    }

    if (existingVictory.user_id !== userId) {
      return { error: "Vous n'êtes pas autorisé à supprimer cette publication." };
    }

    const { error } = await supabase
      .from('victories')
      .delete()
      .eq('id', victoryId);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    revalidatePath("/profile");
    revalidatePath("/victories");

    return { success: true };
  } catch (error: any) {
    console.error("Delete victory error:", error);
    return { error: "Une erreur est survenue lors de la suppression : " + (error.message || "Erreur inconnue") };
  }
}

export async function getVictoryById(id: string) {
  try {
    const { data, error } = await supabase
      .from('victories')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      display_name: data.user_profiles?.display_name || "Joueur",
      avatar_url: data.user_profiles?.avatar_url
    };
  } catch (error) {
    console.error("Fetch victory detail error:", error);
    return null;
  }
}
