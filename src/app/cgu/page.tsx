import { Shield, Scale, Info, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function CGUPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 font-semibold mb-10 hover:text-brand-green transition-colors">
                <ChevronLeft className="w-5 h-5" /> Retour
            </Link>

            <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12 border-b border-gray-50 bg-gradient-to-br from-brand-green/5 to-transparent">
                    <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center text-brand-green mb-6">
                        <Scale className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Conditions Générales d'Utilisation</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">
                        Dernière mise à jour : {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-green text-white rounded-lg flex items-center justify-center text-sm">1</span>
                            Objet des CGU
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Les présentes Conditions Générales d'Utilisation (CGU) encadrent l'accès et l'utilisation de la plateforme **TennisMatch**. En accédant à ce site, vous acceptez sans réserve ces conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-green text-white rounded-lg flex items-center justify-center text-sm">2</span>
                            Services proposés
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            TennisMatch permet aux utilisateurs de :
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 ml-4">
                            <li>Rechercher des partenaires de tennis locaux.</li>
                            <li>Publier des annonces de recherche de matchs ou partenaires.</li>
                            <li>Gérer leur profil sportif et leur palmarès.</li>
                            <li>Échanger via une messagerie intégrée.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-green text-white rounded-lg flex items-center justify-center text-sm">3</span>
                            Responsabilités
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            L'utilisateur est seul responsable des informations qu'il publie sur son profil et dans ses annonces. TennisMatch n'agit qu'en tant qu'intermédiaire technique et ne saurait être tenu responsable des rencontres physiques entre utilisateurs ou des litiges découlant de l'utilisation du service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <span className="w-8 h-8 bg-brand-green text-white rounded-lg flex items-center justify-center text-sm">4</span>
                            Propriété intellectuelle
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Tous les éléments du site (logo, design, textes, algorithmes) sont la propriété exclusive de TennisMatch. Toute reproduction non autorisée est strictement interdite.
                        </p>
                    </section>

                    <div className="bg-ui-gray/30 p-8 rounded-3xl border border-gray-100 flex gap-4">
                        <Info className="w-6 h-6 text-brand-green flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-bold text-gray-900 mb-1">Besoin d'aide ?</h4>
                            <p className="text-sm text-gray-500 leading-relaxed">
                                Si vous avez des questions concernant nos CGU, contactez notre équipe via la messagerie ou par email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
