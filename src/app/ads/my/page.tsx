import { redirect } from "next/navigation";
import { Trophy, MessageSquare, Plus, ChevronRight, LayoutList, Edit, Trash2, Eye, EyeOff, Users, Calendar, Package } from "lucide-react";
import Link from "next/link";
import { getMyAds } from "../actions";
import { getCurrentUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function getAdIcon(type: string) {
  switch (type) {
    case 'partenaire': return Users;
    case 'match': return Trophy;
    case 'tournoi': return Calendar;
    case 'materiel': return Package;
    default: return MessageSquare;
  }
}

function getAdTypeColor(type: string) {
  switch (type) {
    case 'partenaire': return "bg-blue-100 text-blue-600";
    case 'match': return "bg-orange-100 text-orange-600";
    case 'tournoi': return "bg-purple-100 text-purple-600";
    case 'materiel': return "bg-green-100 text-green-600";
    default: return "bg-gray-100 text-gray-600";
  }
}

export default async function MyAdsPage() {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/auth/login?redirect=/ads/my");

    const ads = await getMyAds(userId);

    return (
        <div className="max-w-6xl mx-auto px-6 py-12 md:py-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Mes annonces</h1>
                    <p className="text-gray-500">Gérez vos publications et trouvez vos futurs partenaires.</p>
                </div>
                <Link
                    href="/ads/create"
                    className="w-full md:w-auto bg-brand-green text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all shadow-xl shadow-brand-green/20"
                >
                    <Plus className="w-5 h-5" /> Publier une nouvelle annonce
                </Link>
            </div>

            {ads.length === 0 ? (
                <div className="bg-white rounded-[40px] border border-dashed border-gray-200 py-20 text-center">
                    <div className="w-20 h-20 bg-ui-gray/30 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <LayoutList className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune annonce pour le moment</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                        Partagez vos disponibilités ou proposez un match pour commencer à rencontrer d'autres joueurs.
                    </p>
                    <Link
                        href="/ads/create"
                        className="text-brand-green font-bold flex items-center gap-2 justify-center hover:translate-x-1 transition-transform"
                    >
                        Créer ma première annonce <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {ads.map((ad: any) => {
                        const Icon = getAdIcon(ad.type);
                        const typeColor = getAdTypeColor(ad.type);
                        
                        return (
                            <div key={ad.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-green/20 transition-all group">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-brand-green/5 rounded-xl flex items-center justify-center text-brand-green">
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                    typeColor
                                                )}>
                                                    {ad.type}
                                                </span>
                                                <span className={cn(
                                                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                                                    ad.is_active 
                                                        ? "bg-green-100 text-green-600" 
                                                        : "bg-gray-100 text-gray-600"
                                                )}>
                                                    {ad.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-900 text-lg leading-tight">{ad.title}</h4>
                                        </div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link
                                            href={`/ads/${ad.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                            title="Modifier"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <Link
                                            href={`/ads/${ad.id}`}
                                            className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/5 rounded-lg transition-all"
                                            title="Voir"
                                        >
                                            <Eye className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {ad.description}
                                </p>

                                {/* Location and Date */}
                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                                    <span className="flex items-center gap-1">
                                        <LayoutList className="w-3 h-3" />
                                        {ad.city}
                                    </span>
                                    {ad.event_datetime && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(ad.event_datetime).toLocaleDateString('fr-FR', {
                                                day: 'numeric',
                                                month: 'short',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">
                                        Créée le {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                                    </span>
                                    
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/ads/${ad.id}`}
                                            className="text-brand-green font-medium text-sm hover:underline flex items-center gap-1"
                                        >
                                            Voir détails
                                            <ChevronRight className="w-3 h-3" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Stats Summary */}
            {ads.length > 0 && (
                <div className="mt-12 bg-white rounded-3xl p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-brand-green">{ads.length}</div>
                            <div className="text-sm text-gray-500">Total annonces</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {ads.filter(ad => ad.is_active).length}
                            </div>
                            <div className="text-sm text-gray-500">Actives</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-600">
                                {ads.filter(ad => !ad.is_active).length}
                            </div>
                            <div className="text-sm text-gray-500">Inactives</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {ads.filter(ad => ad.type === 'partenaire').length}
                            </div>
                            <div className="text-sm text-gray-500">Partenaires</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
