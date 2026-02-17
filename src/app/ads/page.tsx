import { Search, MapPin, Calendar, Filter, Plus, Users, Sparkles, Trophy, Package } from "lucide-react";
import Link from "next/link";
import { getAds } from "./actions";
import { AdType, UserLevel } from "@/types";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdsPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: AdType; city?: string; level?: UserLevel; created?: string }>;
}) {
    const filters = await searchParams;
    const ads = await getAds(filters);

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Toutes les annonces</h1>
                    <p className="text-gray-500">Trouvez ce dont vous avez besoin dans la communauté.</p>
                </div>
                <Link
                    href="/ads/create"
                    className="bg-brand-green text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-brand-green/20 hover:scale-105 transition-all"
                >
                    <Plus className="w-5 h-5" /> Publier une annonce
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-10 overflow-hidden">
                <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                    <div className="flex-shrink-0 flex items-center gap-2 bg-ui-gray/50 px-4 py-3 rounded-2xl text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <Filter className="w-4 h-4" /> Filtrer
                    </div>
                    <Link
                        href="/ads"
                        className={cn("flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm", !filters.type ? "bg-brand-green text-white shadow-brand-green/20" : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50")}
                    >
                        Tous
                    </Link>
                    {[
                        { id: 'partenaire', label: 'Partenaires' },
                        { id: 'match', label: 'Matchs' },
                        { id: 'tournoi', label: 'Tournois' },
                        { id: 'materiel', label: 'Matériel' },
                    ].map((t) => (
                        <Link
                            key={t.id}
                            href={`/ads?type=${t.id}`}
                            className={cn(
                                "flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm",
                                filters.type === t.id ? "bg-brand-green text-white shadow-brand-green/20" : "bg-white border border-gray-100 text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {t.label}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {ads.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune annonce trouvée</h3>
                    <p className="text-gray-500">Essayez de modifier vos filtres ou soyez le premier à publier !</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ads.map((ad: any) => (
                        <Link key={ad.id} href={`/ads/${ad.id}`} className="group bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:shadow-2xl transition-all flex flex-col h-full">
                            <div className="h-48 bg-gray-100 relative overflow-hidden">
                                <div className="absolute top-4 left-4 bg-brand-green text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                                    {ad.type}
                                </div>
                                {/* Visual placeholder */}
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-green/20 to-brand-yellow/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                                    {ad.type === 'partenaire' && <Users className="w-16 h-16 text-brand-green/20" />}
                                    {ad.type === 'match' && <Trophy className="w-16 h-16 text-brand-green/20" />}
                                    {ad.type === 'tournoi' && <Sparkles className="w-16 h-16 text-brand-green/20" />}
                                    {ad.type === 'materiel' && <Package className="w-16 h-16 text-brand-green/20" />}
                                </div>
                            </div>
                            <div className="p-8 flex flex-col flex-grow">
                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-green transition-colors line-clamp-2">
                                    {ad.title}
                                </h3>
                                <div className="flex flex-col gap-2 text-gray-500 text-sm mb-6">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-brand-green" /> {ad.city}
                                    </div>
                                    {ad.event_datetime && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-brand-green" /> {new Date(ad.event_datetime).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    )}
                                </div>
                                <div className="mt-auto pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green font-bold text-xs uppercase">
                                            {(ad.display_name || "U").charAt(0)}
                                        </div>
                                        <span className="font-semibold text-gray-900 text-sm">{ad.display_name || "Utilisateur"}</span>
                                    </div>
                                    {ad.required_level && (
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{ad.required_level}</span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
