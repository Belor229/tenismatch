import { Search, MessageSquare, Clock, User } from "lucide-react";
import Link from "next/link";
import { getConversations } from "./actions";

export default async function MessagesPage() {
    // Mock current user ID for V1
    const userId = 1;
    const conversations = await getConversations(userId);

    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
            <div className="mb-10 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Messages</h1>
                    <p className="text-gray-500">Gérez vos conversations et vos rencontres.</p>
                </div>
                <div className="bg-brand-green/10 p-4 rounded-full text-brand-green">
                    <MessageSquare className="w-6 h-6" />
                </div>
            </div>

            <div className="space-y-4">
                {conversations.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Pas de message pour le moment</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            Contactez des joueurs à partir des annonces pour lancer des discussions.
                        </p>
                        <Link href="/ads" className="inline-flex mt-8 text-brand-green font-bold hover:underline">
                            Voir les annonces
                        </Link>
                    </div>
                ) : (
                    conversations.map((conv: any) => (
                        <Link
                            key={conv.id}
                            href={`/messages/${conv.id}`}
                            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-5 group"
                        >
                            <div className="relative">
                                <div className="w-16 h-16 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green font-bold text-xl uppercase">
                                    {conv.other_user_name.charAt(0)}
                                </div>
                                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                            </div>

                            <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-gray-900 group-hover:text-brand-green transition-colors">
                                        {conv.other_user_name}
                                    </h3>
                                    {conv.last_message_time && (
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                            {new Date(conv.last_message_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 truncate pr-4">
                                    {conv.last_message || "Démarrer la discussion..."}
                                </p>
                            </div>

                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 group-hover:bg-brand-green/10 group-hover:text-brand-green transition-all">
                                    <Clock className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
