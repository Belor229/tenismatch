"use server";

import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { UserLevel } from "@/types";
import { RowDataPacket, ResultSetHeader } from "mysql2";

export async function signup(formData: any) {
    const { phone, displayName, password, city, level } = formData;

    if (!phone || !displayName || !password) {
        return { error: "Tous les champs obligatoires doivent être remplis." };
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Check if user exists
            const [existingUsers] = await connection.query<RowDataPacket[]>(
                "SELECT id FROM users WHERE phone = ?",
                [phone]
            );

            if (existingUsers.length > 0) {
                throw new Error("Ce numéro de téléphone est déjà utilisé.");
            }

            // Insert User
            const [userResult] = await connection.query<ResultSetHeader>(
                "INSERT INTO users (phone, password_hash) VALUES (?, ?)",
                [phone, hashedPassword]
            );

            const userId = userResult.insertId;

            // Insert Profile
            await connection.query(
                "INSERT INTO user_profiles (user_id, display_name, city, level) VALUES (?, ?, ?, ?)",
                [userId, displayName, city, level]
            );

            await connection.commit();
            return { success: true };
        } catch (error: any) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error: any) {
        console.error("Signup error:", error);
        return { error: error.message || "Une erreur est survenue lors de l'inscription." };
    }
}

export async function login(formData: any) {
    const { phone, password } = formData;

    try {
        const [users] = await pool.query<RowDataPacket[]>(
            "SELECT u.*, p.display_name FROM users u JOIN user_profiles p ON u.id = p.user_id WHERE u.phone = ?",
            [phone]
        );

        if (users.length === 0) {
            return { error: "Identifiants invalides." };
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return { error: "Identifiants invalides." };
        }

        // In a real V1, we'd set a session cookie here.
        // For now we'll just return success.
        return { success: true, user: { id: user.id, phone: user.phone, displayName: user.display_name } };
    } catch (error: any) {
        console.error("Login error:", error);
        return { error: "Une erreur est survenue lors de la connexion." };
    }
}
