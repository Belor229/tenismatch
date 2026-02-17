import { notFound } from "next/navigation";
import { getMessages } from "../actions";
import ChatWindow from "@/components/ChatWindow";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = 1; // Mock current user for V1
    const conversationId = parseInt(id);

    if (isNaN(conversationId)) notFound();

    // Get initial messages
    const initialMessages = await getMessages(conversationId);

    // Get other user name
    const { data: participants, error } = await supabase
        .from('conversation_participants')
        .select(`
            user_profiles(display_name)
        `)
        .eq('conversation_id', conversationId)
        .neq('user_id', userId)
        .single();

    if (error || !participants) notFound();

    // @ts-ignore
    const otherUserName = participants.user_profiles?.display_name || "Joueur";

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
            <ChatWindow
                conversationId={conversationId}
                userId={userId}
                initialMessages={initialMessages}
                otherUserName={otherUserName}
            />
        </div>
    );
}
