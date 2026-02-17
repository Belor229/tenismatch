"use server";

import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

export async function signup(formData: any) {
    const { phone, displayName, password, city, level } = formData;

    if (!phone || !displayName || !password) {
        return { error: "Tous les champs obligatoires doivent être remplis." };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Check if user exists
        const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('id')
            .eq('phone', phone);

        if (checkError) throw checkError;
        if (existingUsers && existingUsers.length > 0) {
            return { error: "Ce numéro de téléphone est déjà utilisé." };
        }

        // 2. Insert User
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{ phone, password_hash: hashedPassword }])
            .select()
            .single();

        if (userError) throw userError;

        // 3. Insert Profile
        const { error: profileError } = await supabase
            .from('user_profiles')
            .insert([{
                user_id: userData.id,
                display_name: displayName,
                city,
                level
            }]);

        if (profileError) {
            // Cleanup user if profile fails (poor man's transaction)
            await supabase.from('users').delete().eq('id', userData.id);
            throw profileError;
        }

        return { success: true };
    } catch (error: any) {
        console.error("Signup error:", error);
        return { error: error.message || "Une erreur est survenue lors de l'inscription." };
    }
}

export async function login(formData: any) {
    const { phone, password } = formData;

    try {
        const { data: users, error } = await supabase
            .from('users')
            .select('*, user_profiles(display_name)')
            .eq('phone', phone)
            .limit(1);

        if (error) throw error;

        if (!users || users.length === 0) {
            return { error: "Identifiants invalides." };
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return { error: "Identifiants invalides." };
        }

        return {
            success: true,
            user: {
                id: user.id,
                phone: user.phone,
                displayName: user.user_profiles?.display_name
            }
        };
    } catch (error: any) {
        console.error("Login error:", error);
        return { error: "Une erreur est survenue lors de la connexion." };
    }
}
