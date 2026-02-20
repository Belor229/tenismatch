"use server";

import { cookies } from "next/headers";
import { supabase } from "./supabase";

const SESSION_COOKIE_NAME = "tenismatch_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 jours

export interface SessionUser {
  id: number;
  phone: string;
  displayName?: string;
}

/**
 * Crée une session utilisateur en stockant l'ID dans un cookie sécurisé
 */
export async function createSession(userId: number, phone: string, displayName?: string) {
  const cookieStore = await cookies();
  
  // Stocker les infos utilisateur dans le cookie
  const sessionData = {
    userId,
    phone,
    displayName: displayName || "",
    createdAt: Date.now(),
  };

  cookieStore.set(SESSION_COOKIE_NAME, JSON.stringify(sessionData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return sessionData;
}

/**
 * Récupère la session utilisateur actuelle
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return null;
    }

    const sessionData = JSON.parse(sessionCookie.value);
    
    // Vérifier que la session n'est pas expirée (7 jours)
    const sessionAge = Date.now() - sessionData.createdAt;
    if (sessionAge > SESSION_MAX_AGE * 1000) {
      await deleteSession();
      return null;
    }

    // Vérifier que l'utilisateur existe toujours et est actif
    const { data: user, error } = await supabase
      .from("users")
      .select("id, phone, is_active")
      .eq("id", sessionData.userId)
      .single();

    if (error || !user || !user.is_active) {
      await deleteSession();
      return null;
    }

    return {
      id: user.id,
      phone: user.phone,
      displayName: sessionData.displayName,
    };
  } catch (error) {
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Supprime la session utilisateur
 */
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Récupère l'ID de l'utilisateur connecté (utilitaire)
 */
export async function getCurrentUserId(): Promise<number | null> {
  const session = await getSession();
  return session?.id || null;
}

