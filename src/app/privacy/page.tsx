import { ShieldCheck, Lock, Eye, ChevronLeft } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
    return (
        <div className="max-w-4xl mx-auto px-6 py-12 md:py-20">
            <Link href="/" className="inline-flex items-center gap-2 text-gray-500 font-semibold mb-10 hover:text-brand-green transition-colors">
                <ChevronLeft className="w-5 h-5" /> Retour
            </Link>

            <div className="bg-white rounded-[40px] shadow-2xl border border-gray-100 overflow-hidden">
                <div className="p-8 md:p-12 border-b border-gray-50 bg-gradient-to-br from-indigo-50 to-transparent">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
                        <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Politique de Confidentialité</h1>
                    <p className="text-gray-500 text-lg leading-relaxed">
                        Votre vie privée est notre priorité absolue. Découvrez comment nous protégeons vos données.
                    </p>
                </div>

                <div className="p-8 md:p-12 space-y-10">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <Lock className="w-6 h-6 text-indigo-500" />
                            Données collectées
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Nous collectons uniquement les données nécessaires au bon fonctionnement du service :
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 ml-4">
                            <li>Numéro de téléphone (pour l'authentification).</li>
                            <li>Informations de profil (nom, niveau, pays, ville).</li>
                            <li>Messages échangés sur la plateforme.</li>
                            <li>Historique des annonces publiées.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <Eye className="w-6 h-6 text-indigo-500" />
                            Utilisation des données
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Vos données sont utilisées pour :
                        </p>
                        <ul className="list-disc list-inside mt-4 space-y-2 text-gray-600 ml-4">
                            <li>Vous permettre de trouver des partenaires.</li>
                            <li>Sécuriser votre compte.</li>
                            <li>Améliorer l'expérience utilisateur et les filtres de recherche.</li>
                        </ul>
                        <p className="mt-4 text-gray-600 italic">
                            Nous ne vendons jamais vos données personnelles à des tiers.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-3">
                            <ShieldCheck className="w-6 h-6 text-indigo-500" />
                            Vos droits
                        </h2>
                        <p className="text-gray-600 leading-relaxed">
                            Conformément au RGPD et aux lois locales sur la protection des données, vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Vous pouvez modifier vos informations à tout moment depuis votre page profil.
                        </p>
                    </section>

                    <div className="bg-indigo-50/50 p-8 rounded-3xl border border-indigo-100">
                        <p className="text-sm text-indigo-700 leading-relaxed">
                            Pour toute demande de suppression de compte ou de données, vous pouvez nous contacter directement via notre support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
