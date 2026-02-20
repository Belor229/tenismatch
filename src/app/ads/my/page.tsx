import { redirect } from "next/navigation";
import { Trophy, MessageSquare, Plus, ChevronRight, LayoutList } from "lucide-react";
import Link from "next/link";
import { getUserAds } from "@/app/profile/actions";
import { getCurrentUserId } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MyAdsPage() {
    const userId = await getCurrentUserId();
    if (!userId) redirect("/auth/login?redirect=/ads/my");

    const ads = await getUserAds(userId);

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {ads.map((ad: any) => (
                        <div key={ad.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-green/20 transition-all flex items-center gap-4 group">
                            <div className="w-16 h-16 bg-brand-green/5 rounded-2xl flex items-center justify-center text-brand-green">
                                {ad.type === 'match' ? <Trophy className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full",
                                        ad.type === 'match' ? "bg-orange-100 text-orange-600" : "bg-blue-100 text-blue-600"
                                    )}>
                                        {ad.type}
                                    </span>
                                    <span className="text-gray-400 text-[10px]">• {new Date(ad.created_at).toLocaleDateString()}</span>
                                </div>
                                <h4 className="font-bold text-gray-900 mb-1">{ad.title}</h4>
                                <p className="text-xs text-gray-500">{ad.city} &bull; {ad.is_active ? "En ligne" : "Hors ligne"}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <Link
                                    href={`/ads/${ad.id}`}
                                    className="p-2 bg-ui-gray/50 rounded-xl text-gray-400 hover:text-brand-green hover:bg-brand-green/5 transition-all"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
