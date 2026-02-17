import { notFound } from "next/navigation";
import { getMessages, getConversations } from "../actions";
import ChatWindow from "@/components/ChatWindow";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export default async function ConversationPage({ params }: { params: { id: string } }) {
    const userId = 1; // Mock current user for V1
    const conversationId = parseInt(params.id);

    if (isNaN(conversationId)) notFound();

    // Get initial messages
    const initialMessages = await getMessages(conversationId);

    // Get other user name (simplified: fetch other participant from DB)
    const [participants] = await pool.query<RowDataPacket[]>(
        `SELECT p.display_name 
     FROM conversation_participants cp 
     JOIN user_profiles p ON cp.user_id = p.user_id 
     WHERE cp.conversation_id = ? AND cp.user_id != ?`,
        [conversationId, userId]
    );

    if (participants.length === 0) notFound();

    return (
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-10">
            <ChatWindow
                conversationId={conversationId}
                userId={userId}
                initialMessages={initialMessages}
                otherUserName={participants[0].display_name}
            />
        </div>
    );
}
