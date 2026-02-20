import { Sparkles, Users, Target, ChevronLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <div className="max-w-5xl mx-auto px-6 py-12 md:py-20">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 font-semibold mb-10 hover:text-brand-green transition-colors">
                <ChevronLeft className="w-5 h-5" /> Retour
            </Link>

            <div className="text-center mb-16 md:mb-24">
                <div className="inline-flex items-center gap-2 bg-brand-green/10 text-brand-green px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                    <Sparkles className="w-4 h-4" /> Notre Histoire
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                    Plus qu'une plateforme, <br />
                    <span className="text-brand-green italic">une communauté.</span>
                </h1>
                <p className="text-gray-500 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                    TennisMatch est né d'une idée simple : rendre le tennis plus accessible en connectant les passionnés, quel que soit leur niveau ou leur localisation.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-24">
                <div className="relative group">
                    <div className="absolute -inset-4 bg-brand-green/20 rounded-[48px] blur-3xl opacity-0 group-hover:opacity-100 transition-all duration-700" />
                    <div className="relative bg-white p-2 rounded-[40px] shadow-2xl border border-gray-100 aspect-square flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-brand-green/5 flex items-center justify-center">
                            <Users className="w-32 h-32 text-brand-green/20" />
                        </div>
                    </div>
                </div>
                <div className="space-y-8">
                    <div className="space-y-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                            <Target className="w-6 h-6" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Notre Mission</h2>
                        <p className="text-gray-500 leading-relaxed text-lg">
                            Nous croyons que le sport est le meilleur moyen de créer des liens sociaux. TennisMatch facilite l'organisation de matchs amicaux, la recherche de partenaires d'entraînement et la découverte de tournois locaux.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-6 pt-4">
                        <div className="bg-ui-gray/30 p-6 rounded-3xl">
                            <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Passion</div>
                        </div>
                        <div className="bg-ui-gray/30 p-6 rounded-3xl">
                            <div className="text-3xl font-bold text-gray-900 mb-1">Gratuit</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Accessibilité</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-brand-green p-12 md:p-20 rounded-[60px] text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-brand-yellow/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />

                <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 relative z-10">
                    Prêt à fouler les courts ?
                </h2>
                <Link
                    href="/auth/signup"
                    className="inline-flex items-center gap-3 bg-white text-brand-green px-10 py-5 rounded-3xl font-bold text-lg hover:scale-105 transition-transform relative z-10 shadow-xl"
                >
                    Rejoindre l'aventure <ArrowRight className="w-6 h-6" />
                </Link>
            </div>
        </div>
    );
}
