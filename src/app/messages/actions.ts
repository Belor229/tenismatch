"use server";

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function getConversations(userId: number) {
    try {
        const { data: myParticipants, error: pError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', userId);

        if (pError || !myParticipants?.length) return [];

        const convIds = myParticipants.map(p => p.conversation_id);

        const { data: convs, error } = await supabase
            .from('conversations')
            .select('*')
            .in('id', convIds)
            .order('last_message_at', { ascending: false });

        if (error || !convs) return [];

        const result = [];
        for (const conv of convs) {
            const { data: otherParticipants } = await supabase
                .from('conversation_participants')
                .select('user_id')
                .eq('conversation_id', conv.id)
                .neq('user_id', userId)
                .limit(1);

            const otherUserId = otherParticipants?.[0]?.user_id;
            let otherUserName = "Joueur";

            if (otherUserId) {
                const { data: profile } = await supabase
                    .from('user_profiles')
                    .select('display_name')
                    .eq('user_id', otherUserId)
                    .single();
                otherUserName = profile?.display_name || "Joueur";
            }

            const { data: msgs } = await supabase
                .from('messages')
                .select('message_text, created_at')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1);

            const lastMsg = msgs?.[0];

            result.push({
                id: conv.id,
                last_message: lastMsg?.message_text,
                last_message_time: lastMsg?.created_at,
                other_user_name: otherUserName,
                other_user_id: otherUserId,
            });
        }

        return result;
    } catch (error) {
        console.error("Fetch conversations error:", error);
        return [];
    }
}

export async function getOtherParticipantName(conversationId: number, currentUserId: number): Promise<string> {
    try {
        const { data: participants } = await supabase
            .from('conversation_participants')
            .select('user_id')
            .eq('conversation_id', conversationId)
            .neq('user_id', currentUserId)
            .limit(1);

        const otherUserId = participants?.[0]?.user_id;
        if (!otherUserId) return "Joueur";

        const { data: profile } = await supabase
            .from('user_profiles')
            .select('display_name')
            .eq('user_id', otherUserId)
            .single();

        return profile?.display_name || "Joueur";
    } catch {
        return "Joueur";
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
