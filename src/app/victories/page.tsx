import { Trophy, Plus, Calendar, User, MapPin, Filter } from "lucide-react";
import Link from "next/link";
import { getVictories } from "./actions";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function VictoriesPage() {
    const userId = await getCurrentUserId();
    const victories = await getVictories({ limit: 50 });

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Victoires & Performances</h1>
                    <p className="text-gray-500">Célébrez vos succès et inspirez la communauté.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filtrer
                    </button>
                    {userId && (
                        <Link
                            href="/victories/create"
                            className="bg-brand-green text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all shadow-lg"
                        >
                            <Plus className="w-5 h-5" /> Partager une victoire
                        </Link>
                    )}
                </div>
            </div>

            {victories.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-dashed border-gray-200 py-20 text-center">
                    <div className="w-20 h-20 bg-ui-gray/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune victoire partagée</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Soyez le premier à partager votre performance et inspirer la communauté !
                    </p>
                    {userId && (
                        <Link
                            href="/victories/create"
                            className="text-brand-green font-bold flex items-center gap-2 justify-center hover:translate-x-1 transition-transform"
                        >
                            Partager ma première victoire <Trophy className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {victories.map((victory: any) => (
                        <div key={victory.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
                            {/* Photo or placeholder */}
                            <div className="h-48 bg-gradient-to-br from-brand-green/10 to-brand-yellow/10 relative overflow-hidden">
                                {victory.photo_url ? (
                                    <img 
                                        src={victory.photo_url} 
                                        alt={victory.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Trophy className="w-16 h-16 text-brand-green/30" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-brand-green text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                        {victory.match_type || 'singles'}
                                    </span>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-brand-green/10 rounded-full flex items-center justify-center">
                                        {victory.avatar_url ? (
                                            <img 
                                                src={victory.avatar_url} 
                                                alt={victory.display_name}
                                                className="w-full h-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-brand-green font-bold text-sm uppercase">
                                                {victory.display_name?.charAt(0) || "U"}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-sm">{victory.display_name}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(victory.created_at).toLocaleDateString('fr-FR')}
                                        </p>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-brand-green transition-colors">
                                    {victory.title}
                                </h3>

                                {victory.description && (
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {victory.description}
                                    </p>
                                )}

                                {/* Match details */}
                                <div className="space-y-2 text-xs text-gray-500">
                                    {victory.opponent_name && (
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            <span>Adversaire: {victory.opponent_name}</span>
                                        </div>
                                    )}
                                    {victory.score && (
                                        <div className="flex items-center gap-2">
                                            <Trophy className="w-3 h-3" />
                                            <span>Score: {victory.score}</span>
                                        </div>
                                    )}
                                    {victory.event_date && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-3 h-3" />
                                            <span>{new Date(victory.event_date).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Action */}
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <Link
                                        href={`/victories/${victory.id}`}
                                        className="text-brand-green font-medium text-sm hover:underline flex items-center gap-1"
                                    >
                                        Voir les détails
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Load more */}
            {victories.length > 0 && (
                <div className="text-center mt-12">
                    <button className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                        Charger plus de victoires
                    </button>
                </div>
            )}
        </div>
    );
}
