"use server";

import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { revalidatePath } from "next/cache";
import { MOCK_PROFILE, MOCK_ADS } from "@/lib/mockData";

export async function getProfile(userId: number) {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT p.*, u.phone FROM user_profiles p JOIN users u ON p.user_id = u.id WHERE p.user_id = ?",
            [userId]
        );
        if (rows.length === 0) return MOCK_PROFILE;
        return rows[0];
    } catch (error) {
        console.error("Fetch profile error (mock fallback):", error);
        return MOCK_PROFILE;
    }
}

export async function updateProfile(userId: number, data: any) {
    const { displayName, age, city, level, bio, isPublic } = data;

    try {
        await pool.query(
            `UPDATE user_profiles 
       SET display_name = ?, age = ?, city = ?, level = ?, bio = ?, is_public = ? 
       WHERE user_id = ?`,
            [displayName, age || null, city || null, level || null, bio || null, isPublic ? 1 : 0, userId]
        );

        revalidatePath("/profile");
        return { success: true };
    } catch (error) {
        console.error("Update profile error:", error);
        return { error: "Erreur lors de la mise à jour du profil." };
    }
}

export async function getUserAds(userId: number) {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM ads WHERE user_id = ? AND is_deleted = 0 ORDER BY created_at DESC",
            [userId]
        );
        return rows.length > 0 ? rows : MOCK_ADS.filter(a => a.user_id === userId);
    } catch (error) {
        console.error("Fetch user ads error (mock fallback):", error);
        return MOCK_ADS.filter(a => a.user_id === userId);
    }
}
