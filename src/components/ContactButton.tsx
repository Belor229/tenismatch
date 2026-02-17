"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { getOrCreateConversation } from "@/app/messages/actions";

export default function ContactButton({
    myId,
    otherUserId,
    adId
}: {
    myId: number,
    otherUserId: number,
    adId: number
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleContact = async () => {
        setLoading(true);
        const result = await getOrCreateConversation(myId, otherUserId, adId);

        if (result.conversationId) {
            router.push(`/messages/${result.conversationId}`);
        } else {
            alert("Erreur lors de la création de la conversation.");
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleContact}
            disabled={loading}
            className="w-full bg-brand-green text-white py-5 rounded-[22px] font-bold text-lg hover:scale-[1.02] transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3 disabled:opacity-50"
        >
            <MessageSquare className="w-6 h-6" /> {loading ? "Ouverture..." : "Contacter"}
        </button>
    );
}
