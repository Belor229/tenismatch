"use server";

import pool from "@/lib/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";
import { revalidatePath } from "next/cache";

export async function getConversations(userId: number) {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            `SELECT c.*, 
              (SELECT message_text FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
              p.display_name as other_user_name,
              p.avatar_url as other_user_avatar,
              p.user_id as other_user_id
       FROM conversations c
       JOIN conversation_participants cp_me ON c.id = cp_me.conversation_id AND cp_me.user_id = ?
       JOIN conversation_participants cp_other ON c.id = cp_other.conversation_id AND cp_other.user_id != ?
       JOIN user_profiles p ON cp_other.user_id = p.user_id
       ORDER BY last_message_time DESC`,
            [userId, userId]
        );
        return rows;
    } catch (error) {
        console.error("Fetch conversations error:", error);
        return [];
    }
}

export async function getMessages(conversationId: number) {
    try {
        const [rows] = await pool.query<RowDataPacket[]>(
            "SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC",
            [conversationId]
        );
        return rows;
    } catch (error) {
        console.error("Fetch messages error:", error);
        return [];
    }
}

export async function sendMessage(conversationId: number, senderId: number, text: string) {
    try {
        await pool.query<ResultSetHeader>(
            "INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)",
            [conversationId, senderId, text]
        );

        // Update conversation last_message_at
        await pool.query(
            "UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?",
            [conversationId]
        );

        revalidatePath(`/messages/${conversationId}`);
        return { success: true };
    } catch (error) {
        console.error("Send message error:", error);
        return { error: "Erreur lors de l'envoi du message." };
    }
}

export async function getOrCreateConversation(myId: number, otherId: number, adId?: number) {
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Check if conversation exists (simplified: check if both are in a conversation)
            const [existing] = await connection.query<RowDataPacket[]>(
                `SELECT cp1.conversation_id 
         FROM conversation_participants cp1
         JOIN conversation_participants cp2 ON cp1.conversation_id = cp2.conversation_id
         WHERE cp1.user_id = ? AND cp2.user_id = ?`,
                [myId, otherId]
            );

            if (existing.length > 0) {
                await connection.commit();
                return { conversationId: existing[0].conversation_id };
            }

            // Create new conversation
            const [convResult] = await connection.query<ResultSetHeader>(
                "INSERT INTO conversations (created_by, ad_id) VALUES (?, ?)",
                [myId, adId || null]
            );
            const conversationId = convResult.insertId;

            // Add participants
            await connection.query(
                "INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?), (?, ?)",
                [conversationId, myId, conversationId, otherId]
            );

            await connection.commit();
            return { conversationId };
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error("Get/Create conversation error:", error);
        return { error: "Erreur lors de la création de la conversation." };
    }
}
