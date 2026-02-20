import { MapPin, Calendar, Trophy, ChevronLeft, Flag, Share2, User, Info } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAdById } from "../actions";
import ContactButton from "@/components/ContactButton";
import { getCurrentUserId } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const ad = await getAdById(id);
    const myId = await getCurrentUserId();

    if (!ad) notFound();

    return (
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
            <Link href="/ads" className="inline-flex items-center gap-2 text-gray-500 font-semibold mb-10 hover:text-brand-green transition-colors">
                <ChevronLeft className="w-5 h-5" /> Retour aux annonces
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-10">
                    <div className="bg-white rounded-[40px] overflow-hidden border border-gray-100 shadow-sm">
                        <div className="h-64 md:h-[400px] bg-gray-100 relative">
                            <div className="absolute top-6 left-6 bg-brand-green text-white text-xs font-bold px-4 py-2 rounded-full uppercase tracking-wider z-10 shadow-lg">
                                {ad.type}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 to-brand-yellow/10 flex items-center justify-center">
                                <Trophy className="w-32 h-32 text-brand-green/5" />
                            </div>
                        </div>
                        <div className="p-8 md:p-12">
                            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                                {ad.title}
                            </h1>

                            <div className="flex flex-wrap gap-6 mb-10">
                                <div className="flex items-center gap-3 text-gray-600 bg-ui-gray/50 px-5 py-3 rounded-2xl">
                                    <MapPin className="w-5 h-5 text-brand-green" />
                                    <span className="font-semibold">{ad.city} {ad.location && `- ${ad.location} `}</span>
                                </div>
                                {ad.event_datetime && (
                                    <div className="flex items-center gap-3 text-gray-600 bg-ui-gray/50 px-5 py-3 rounded-2xl">
                                        <Calendar className="w-5 h-5 text-brand-green" />
                                        <span className="font-semibold">
                                            {new Date(ad.event_datetime).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed mb-12">
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                                <p>{ad.description}</p>
                            </div>

                            <div className="flex items-center justify-between pt-10 border-t border-gray-50">
                                <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 font-bold text-sm transition-colors">
                                    <Flag className="w-4 h-4" /> Signaler l'annonce
                                </button>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-brand-green font-bold text-sm transition-colors">
                                    <Share2 className="w-4 h-4" /> Partager
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-8">
                    {/* User Profile Card */}
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="w-24 h-24 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green font-bold text-3xl uppercase mb-4 shadow-inner">
                                {(ad?.display_name || "U").charAt(0)}
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{ad?.display_name || "Utilisateur"}</h3>
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-brand-green uppercase tracking-widest bg-brand-green/5 px-3 py-1 rounded-full">
                                Joueur {ad?.user_level || "Amateur"}
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                <Calendar className="w-5 h-5 text-gray-400" />
                                Membre depuis {new Date(ad.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </div>
                            <div className="flex items-center gap-3 text-gray-600 text-sm">
                                <Info className="w-5 h-5 text-gray-400" />
                                Membre actif
                            </div>
                        </div>

                        <ContactButton
                            myId={myId}
                            otherUserId={ad.user_id}
                            adId={ad.id}
                        />
                        <p className="text-[10px] text-gray-400 text-center mt-4 uppercase font-bold tracking-tighter">
                            Le numéro de téléphone n'est pas affiché publiquement.
                        </p>
                    </div>

                    {/* Tips Card */}
                    <div className="bg-brand-yellow/10 p-8 rounded-[32px] border border-brand-yellow/20">
                        <h4 className="font-bold text-brand-green mb-3 flex items-center gap-2">
                            <Trophy className="w-5 h-5" /> Conseil TennisMatch
                        </h4>
                        <p className="text-sm text-brand-green/80 leading-relaxed">
                            N'oubliez pas d'arriver 10 minutes à l'avance pour vous échauffer et vérifier l'état des balles !
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
