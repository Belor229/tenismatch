"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function createEvent(formData: any) {
  const { 
    userId, 
    title, 
    description, 
    eventType, 
    startDatetime, 
    endDatetime, 
    location, 
    city, 
    country, 
    maxParticipants, 
    registrationDeadline, 
    entryFee, 
    requirements, 
    bannerUrl,
    isPublic 
  } = formData;

  if (!userId || !title || !description || !startDatetime || !endDatetime || !location || !city || !country) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  try {
    const { data, error } = await supabase
      .from('events')
      .insert([
        {
          user_id: userId,
          title,
          description,
          event_type: eventType || 'local_meetup',
          start_datetime: startDatetime,
          end_datetime: endDatetime,
          location,
          city,
          country,
          max_participants: maxParticipants || null,
          registration_deadline: registrationDeadline || null,
          entry_fee: entryFee || null,
          requirements: requirements || null,
          banner_url: bannerUrl || null,
          is_public: isPublic !== false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    revalidatePath("/events");
    revalidatePath("/profile");

    return { success: true, event: data };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { error: "Une erreur est survenue lors de la création de l'événement : " + (error.message || "Erreur inconnue") };
  }
}

export async function getEvents(filters: any = {}) {
  const { city, country, eventType, limit = 20, offset = 0 } = filters;

  try {
    let query = supabase
      .from('events')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('is_public', true)
      .eq('is_active', true)
      .order('start_datetime', { ascending: true })
      .range(offset, offset + limit - 1);

    if (city) {
      query = query.ilike('city', `%${city}%`);
    }
    if (country) {
      query = query.eq('country', country);
    }
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return [];
    }

    return data?.map((event: any) => ({
      ...event,
      display_name: event.user_profiles?.display_name || "Organisateur",
      avatar_url: event.user_profiles?.avatar_url,
      is_full: event.max_participants && event.current_participants >= event.max_participants
    })) || [];
  } catch (error) {
    console.error("Fetch events error:", error);
    return [];
  }
}

export async function getMyEvents(userId: number) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase fetch my events error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Fetch my events error:", error);
    return [];
  }
}

export async function getEventById(id: string) {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      display_name: data.user_profiles?.display_name || "Organisateur",
      avatar_url: data.user_profiles?.avatar_url,
      is_full: data.max_participants && data.current_participants >= data.max_participants
    };
  } catch (error) {
    console.error("Fetch event detail error:", error);
    return null;
  }
}

export async function updateEvent(eventId: string, formData: any, userId: number) {
  const { 
    title, 
    description, 
    eventType, 
    startDatetime, 
    endDatetime, 
    location, 
    city, 
    country, 
    maxParticipants, 
    registrationDeadline, 
    entryFee, 
    requirements, 
    bannerUrl,
    isPublic 
  } = formData;

  if (!eventId || !title || !description || !startDatetime || !endDatetime || !location || !city || !country) {
    return { error: "Veuillez remplir tous les champs obligatoires." };
  }

  try {
    // First check if the event belongs to the user
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (checkError || !existingEvent) {
      return { error: "Événement non trouvé." };
    }

    if (existingEvent.user_id !== userId) {
      return { error: "Vous n'êtes pas autorisé à modifier cet événement." };
    }

    const { data, error } = await supabase
      .from('events')
      .update({
        title,
        description,
        event_type: eventType || 'local_meetup',
        start_datetime: startDatetime,
        end_datetime: endDatetime,
        location,
        city,
        country,
        max_participants: maxParticipants || null,
        registration_deadline: registrationDeadline || null,
        entry_fee: entryFee || null,
        requirements: requirements || null,
        banner_url: bannerUrl || null,
        is_public: isPublic !== false,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    revalidatePath("/events");
    revalidatePath("/profile");
    revalidatePath(`/events/${eventId}`);

    return { success: true, event: data };
  } catch (error: any) {
    console.error("Update event error:", error);
    return { error: "Une erreur est survenue lors de la mise à jour : " + (error.message || "Erreur inconnue") };
  }
}

export async function deleteEvent(eventId: string, userId: number) {
  if (!eventId) {
    return { error: "ID de l'événement requis." };
  }

  try {
    // First check if the event belongs to the user
    const { data: existingEvent, error: checkError } = await supabase
      .from('events')
      .select('user_id')
      .eq('id', eventId)
      .single();

    if (checkError || !existingEvent) {
      return { error: "Événement non trouvé." };
    }

    if (existingEvent.user_id !== userId) {
      return { error: "Vous n'êtes pas autorisé à supprimer cet événement." };
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error("Supabase delete error:", error);
      throw error;
    }

    revalidatePath("/events");
    revalidatePath("/profile");

    return { success: true };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return { error: "Une erreur est survenue lors de la suppression : " + (error.message || "Erreur inconnue") };
  }
}

export async function joinEvent(eventId: string, userId: number) {
  if (!eventId) {
    return { error: "ID de l'événement requis." };
  }

  try {
    // Check if event exists and has space
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('max_participants, current_participants, registration_deadline')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return { error: "Événement non trouvé." };
    }

    if (event.max_participants && event.current_participants >= event.max_participants) {
      return { error: "Cet événement est complet." };
    }

    if (event.registration_deadline && new Date(event.registration_deadline) < new Date()) {
      return { error: "La période d'inscription est terminée." };
    }

    // Check if already registered
    const { data: existingParticipant } = await supabase
      .from('event_participants')
      .select('*')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existingParticipant) {
      return { error: "Vous êtes déjà inscrit à cet événement." };
    }

    // Register participant
    const { error: participantError } = await supabase
      .from('event_participants')
      .insert([{
        event_id: eventId,
        user_id: userId,
        status: 'registered'
      }]);

    if (participantError) {
      console.error("Supabase insert participant error:", participantError);
      throw participantError;
    }

    // Update participant count
    await supabase
      .from('events')
      .update({
        current_participants: event.current_participants + 1
      })
      .eq('id', eventId);

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");

    return { success: true };
  } catch (error: any) {
    console.error("Join event error:", error);
    return { error: "Une erreur est survenue lors de l'inscription : " + (error.message || "Erreur inconnue") };
  }
}

export async function leaveEvent(eventId: string, userId: number) {
  if (!eventId) {
    return { error: "ID de l'événement requis." };
  }

  try {
    // Get current participant count
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('current_participants')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return { error: "Événement non trouvé." };
    }

    // Remove participant
    const { error: participantError } = await supabase
      .from('event_participants')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (participantError) {
      console.error("Supabase delete participant error:", participantError);
      throw participantError;
    }

    // Update participant count
    await supabase
      .from('events')
      .update({
        current_participants: Math.max(0, event.current_participants - 1)
      })
      .eq('id', eventId);

    revalidatePath(`/events/${eventId}`);
    revalidatePath("/events");

    return { success: true };
  } catch (error: any) {
    console.error("Leave event error:", error);
    return { error: "Une erreur est survenue lors du désistement : " + (error.message || "Erreur inconnue") };
  }
}

export async function getEventParticipants(eventId: string) {
  try {
    const { data, error } = await supabase
      .from('event_participants')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('event_id', eventId)
      .eq('status', 'registered');

    if (error) {
      console.error("Supabase fetch participants error:", error);
      return [];
    }

    return data?.map((participant: any) => ({
      ...participant,
      display_name: participant.user_profiles?.display_name || "Participant",
      avatar_url: participant.user_profiles?.avatar_url
    })) || [];
  } catch (error) {
    console.error("Fetch event participants error:", error);
    return [];
  }
}
