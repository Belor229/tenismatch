"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getConversations(userId: number) {
    try {
        // Fetch conversations where user is a participant
        const { data: participants, error: pError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId);

        if (pError || !participants) throw pError;

        const convIds = participants.map(p => p.conversation_id);
        if (convIds.length === 0) return [];

        // Fetch conversation details and other participants
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                *,
                conversation_participants!inner(user_id, last_read_at),
                messages(message_text, created_at)
            `)
            .in('id', convIds)
            .neq('conversation_participants.user_id', userId)
            .order('last_message_at', { ascending: false });

        if (error) throw error;

        // Fetch user profiles for other participants manually if needed, 
        // or join if Supabase allows more complex nested inner joins.
        // For simplicity in V1 refactor, we'll map the data to the expected format.

        return data.map(conv => {
            const lastMsg = conv.messages?.sort((a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0];

            return {
                ...conv,
                last_message: lastMsg?.message_text,
                last_message_time: lastMsg?.created_at,
                // We'd need another query for profiles usually, or a view
                other_user_name: "Joueur",
                other_user_id: conv.conversation_participants[0]?.user_id
            };
        });
    } catch (error) {
        console.error("Fetch conversations error:", error);
        return [];
    }
}

export async function getMessages(conversationId: number) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Fetch messages error:", error);
        return [];
    }
}

export async function sendMessage(conversationId: number, senderId: number, text: string) {
    try {
        const { error: msgError } = await supabase
            .from('messages')
            .insert([{ conversation_id: conversationId, sender_id: senderId, message_text: text }]);

        if (msgError) throw msgError;

        const { error: convError } = await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', conversationId);

        if (convError) throw convError;

        revalidatePath(`/messages/${conversationId}`);
        return { success: true };
    } catch (error) {
        console.error("Send message error:", error);
        return { error: "Erreur lors de l'envoi du message." };
    }
}

export async function getOrCreateConversation(myId: number, otherId: number, adId?: number) {
    try {
        // Find existing conversation between myId and otherId
        const { data: myConvs } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', myId);

        const { data: otherConvs } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherId);

        const myIds = myConvs?.map(c => c.conversation_id) || [];
        const otherIds = otherConvs?.map(c => c.conversation_id) || [];
        const common = myIds.filter(id => otherIds.includes(id));

        if (common.length > 0) {
            return { conversationId: common[0] };
        }

        // Create new
        const { data: conv, error: cError } = await supabase
            .from('conversations')
            .insert([{ created_by: myId, ad_id: adId || null }])
            .select()
            .single();

        if (cError) throw cError;

        const conversationId = conv.id;

        await supabase
            .from('conversation_participants')
            .insert([
                { conversation_id: conversationId, user_id: myId },
                { conversation_id: conversationId, user_id: otherId }
            ]);

        return { conversationId };
    } catch (error) {
        console.error("Get/Create conversation error:", error);
        return { error: "Erreur lors de la création de la conversation." };
    }
}
