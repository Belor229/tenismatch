"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import { getOrCreateConversation } from "@/app/messages/actions";

export default function ContactButton({
    myId,
    otherUserId,
    adId
}: {
    myId: number | null;
    otherUserId: number;
    adId: number;
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!myId) {
        return (
            <Link
                href={`/auth/login?redirect=/ads/${adId}`}
                className="w-full bg-brand-green text-white py-5 rounded-[22px] font-bold text-lg hover:scale-[1.02] transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3"
            >
                <MessageSquare className="w-6 h-6" /> Se connecter pour contacter
            </Link>
        );
    }

    const handleContact = async () => {
        setLoading(true);
        const result = await getOrCreateConversation(myId, otherUserId, adId);

        if (result.conversationId) {
            router.push(`/messages/${result.conversationId}`);
        } else {
            alert(result?.error || "Erreur lors de la création de la conversation.");
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
