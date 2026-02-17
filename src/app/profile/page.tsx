import { User, MapPin, Calendar, Trophy, MessageSquare, Settings, Edit2, LogOut, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getProfile, getUserAds } from "./actions";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
    const userId = 1; // Mock current user for V1
    const profile = await getProfile(userId);
    const ads = await getUserAds(userId);

    if (!profile) return <div>Profil non trouvé.</div>;

    return (
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
            <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden mb-10">
                <div className="h-32 md:h-40 bg-gradient-to-r from-brand-green to-brand-green/80" />
                <div className="px-6 md:px-8 pb-10 -mt-12 md:-mt-16">
                    <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-6 text-center md:text-left">
                            <div className="w-24 h-24 md:w-32 md:h-32 bg-white p-1.5 md:p-2 rounded-[28px] md:rounded-[32px] shadow-xl">
                                <div className="w-full h-full bg-brand-green/10 rounded-[22px] md:rounded-[24px] flex items-center justify-center text-brand-green font-bold text-3xl md:text-4xl uppercase">
                                    {(profile.display_name || "U").charAt(0)}
                                </div>
                            </div>
                            <div className="pb-1">
                                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{profile.display_name}</h1>
                                <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
                                    <div className="flex items-center gap-1.5 text-gray-500 text-[10px] md:text-sm font-semibold uppercase tracking-widest">
                                        <MapPin className="w-3 h-3 md:w-4 md:h-4 text-brand-green" /> {profile.city || 'Ville non définie'}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-brand-green uppercase tracking-widest bg-brand-green/5 px-3 py-1 rounded-full">
                                        Joueur {profile.level}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2 md:gap-3 w-full md:w-auto">
                            <Link href="/profile/edit" className="flex-grow md:flex-none flex items-center justify-center gap-2 bg-ui-gray/50 hover:bg-ui-gray px-6 py-3.5 rounded-2xl font-bold text-sm text-gray-700 transition-all">
                                <Edit2 className="w-4 h-4" /> Modifier
                            </Link>
                            <button className="p-3.5 bg-red-50 text-red-500 rounded-2xl hover:bg-red-100 transition-all flex items-center justify-center">
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-gray-50">
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bio</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                {profile.bio || "Aucune biographie complétée pour le moment."}
                            </p>
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-ui-gray/30 p-5 rounded-3xl text-center">
                                <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Annonces</div>
                            </div>
                            <div className="bg-ui-gray/30 p-5 rounded-3xl text-center">
                                <div className="text-2xl font-bold text-gray-900">4</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Matchs joués</div>
                            </div>
                            <div className="bg-ui-gray/30 p-5 rounded-3xl text-center">
                                <div className="text-2xl font-bold text-gray-900">12</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Amis</div>
                            </div>
                            <div className="bg-ui-gray/30 p-5 rounded-3xl text-center">
                                <div className="text-2xl font-bold text-gray-900">2</div>
                                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Tournois</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <Trophy className="w-7 h-7 text-brand-green" /> Mes annonces
                </h2>

                {ads.length === 0 ? (
                    <div className="bg-white p-12 rounded-[40px] text-center border border-dashed border-gray-200">
                        <p className="text-gray-500 mb-6">Vous n'avez pas encore publié d'annonce.</p>
                        <Link href="/ads/create" className="bg-brand-green text-white px-8 py-4 rounded-2xl font-bold inline-flex items-center gap-2">
                            Publier ma première annonce <ChevronRight className="w-5 h-5" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {ads.map((ad: any) => (
                            <Link key={ad.id} href={`/ads/${ad.id}`} className="bg-white p-6 rounded-[32px] border border-gray-100 flex items-center gap-4 group hover:shadow-xl transition-all">
                                <div className="w-16 h-16 bg-brand-green/5 rounded-2xl flex items-center justify-center text-brand-green">
                                    {ad.type === 'match' ? <Trophy className="w-8 h-8" /> : <MessageSquare className="w-8 h-8" />}
                                </div>
                                <div className="flex-grow">
                                    <h4 className="font-bold text-gray-900 group-hover:text-brand-green transition-colors">{ad.title}</h4>
                                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">{ad.type} &bull; {ad.city}</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-brand-green" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
