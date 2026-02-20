import { notFound, redirect } from "next/navigation";
import { getMessages, getOtherParticipantName } from "../actions";
import ChatWindow from "@/components/ChatWindow";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const userId = await getCurrentUserId();
    if (!userId) redirect("/auth/login?redirect=/messages/" + id);
    const conversationId = parseInt(id);

    if (isNaN(conversationId)) notFound();

    const [initialMessages, otherUserName] = await Promise.all([
        getMessages(conversationId),
        getOtherParticipantName(conversationId, userId),
    ]);

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
