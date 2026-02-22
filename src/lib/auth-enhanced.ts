"use server";

import bcrypt from "bcryptjs";
import { supabase } from "./supabase";
import { createSession } from "./auth";

export interface AuthProvider {
  email?: string;
  phone?: string;
  password?: string;
  provider?: 'email' | 'phone' | 'google' | 'facebook';
  providerId?: string;
  displayName?: string;
  avatar_url?: string;
}

export async function signupWithEmail(email: string, password: string, displayName: string, additionalData?: any) {
  if (!email || !password || !displayName) {
    return { error: "Email, mot de passe et nom sont requis." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email);

    if (checkError) throw checkError;
    if (existingUsers && existingUsers.length > 0) {
      return { error: "Cet email est déjà utilisé." };
    }

    // Insert User
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password_hash: hashedPassword,
        auth_provider: 'email',
        email_verified: false
      }])
      .select()
      .single();

    if (userError) throw userError;

    // Insert Profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userData.id,
        display_name: displayName,
        ...additionalData
      }]);

    if (profileError) {
      await supabase.from('users').delete().eq('id', userData.id);
      throw profileError;
    }

    return { success: true, userId: userData.id };
  } catch (error: any) {
    console.error("Email signup error:", error);
    return { error: error.message || "Une erreur est survenue lors de l'inscription." };
  }
}

export async function loginWithEmail(email: string, password: string) {
  if (!email || !password) {
    return { error: "Email et mot de passe sont requis." };
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('email', email)
      .eq('auth_provider', 'email')
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return { error: "Identifiants invalides." };
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');

    if (!isPasswordValid) {
      return { error: "Identifiants invalides." };
    }

    const profile = user.user_profiles as any;
    await createSession(user.id, user.email || user.phone, profile?.display_name);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: profile?.display_name,
        avatar_url: profile?.avatar_url
      }
    };
  } catch (error: any) {
    console.error("Email login error:", error);
    return { error: "Une erreur est survenue lors de la connexion." };
  }
}

export async function signupWithPhone(phone: string, password: string, displayName: string, additionalData?: any) {
  if (!phone || !password || !displayName) {
    return { error: "Téléphone, mot de passe et nom sont requis." };
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone);

    if (checkError) throw checkError;
    if (existingUsers && existingUsers.length > 0) {
      return { error: "Ce numéro de téléphone est déjà utilisé." };
    }

    // Insert User
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ 
        phone, 
        password_hash: hashedPassword,
        auth_provider: 'phone'
      }])
      .select()
      .single();

    if (userError) throw userError;

    // Insert Profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userData.id,
        display_name: displayName,
        ...additionalData
      }]);

    if (profileError) {
      await supabase.from('users').delete().eq('id', userData.id);
      throw profileError;
    }

    return { success: true, userId: userData.id };
  } catch (error: any) {
    console.error("Phone signup error:", error);
    return { error: error.message || "Une erreur est survenue lors de l'inscription." };
  }
}

export async function loginWithPhone(phone: string, password: string) {
  if (!phone || !password) {
    return { error: "Téléphone et mot de passe sont requis." };
  }

  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*, user_profiles(display_name, avatar_url)')
      .eq('phone', phone)
      .eq('auth_provider', 'phone')
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return { error: "Identifiants invalides." };
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash || '');

    if (!isPasswordValid) {
      return { error: "Identifiants invalides." };
    }

    const profile = user.user_profiles as any;
    await createSession(user.id, user.phone || user.email, profile?.display_name);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        displayName: profile?.display_name,
        avatar_url: profile?.avatar_url
      }
    };
  } catch (error: any) {
    console.error("Phone login error:", error);
    return { error: "Une erreur est survenue lors de la connexion." };
  }
}

export async function signupWithGoogle(providerId: string, email: string, displayName: string, avatar_url?: string) {
  try {
    // Check if user exists with this Google ID
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('provider_id', providerId)
      .eq('auth_provider', 'google');

    if (checkError) throw checkError;
    if (existingUsers && existingUsers.length > 0) {
      // User exists, log them in
      const user = existingUsers[0];
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name')
        .eq('user_id', user.id)
        .single();
      
      await createSession(user.id, email, profile?.display_name);
      return { success: true, user: { id: user.id, email, displayName, avatar_url } };
    }

    // Check if email is already used by another provider
    if (email) {
      const { data: emailUsers } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('auth_provider', 'google');

      if (emailUsers && emailUsers.length > 0) {
        return { error: "Cet email est déjà utilisé avec une autre méthode d'authentification." };
      }
    }

    // Insert new user
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([{ 
        email,
        auth_provider: 'google',
        provider_id: providerId,
        email_verified: true
      }])
      .select()
      .single();

    if (userError) throw userError;

    // Insert Profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([{
        user_id: userData.id,
        display_name: displayName,
        avatar_url
      }]);

    if (profileError) {
      await supabase.from('users').delete().eq('id', userData.id);
      throw profileError;
    }

    await createSession(userData.id, email, displayName);
    return { success: true, user: { id: userData.id, email, displayName, avatar_url } };
  } catch (error: any) {
    console.error("Google signup error:", error);
    return { error: error.message || "Une erreur est survenue lors de la connexion avec Google." };
  }
}

export async function requestPasswordReset(email: string) {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('auth_provider', 'email')
      .limit(1);

    if (!users || users.length === 0) {
      return { error: "Aucun compte trouvé avec cet email." };
    }

    // TODO: Implement email sending logic
    // For now, just return success
    return { success: true, message: "Instructions de réinitialisation envoyées par email." };
  } catch (error: any) {
    console.error("Password reset error:", error);
    return { error: "Une erreur est survenue lors de la demande de réinitialisation." };
  }
}
