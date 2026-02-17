export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 py-10 md:py-16 mt-auto hidden md:block">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
                <div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 bg-brand-green rounded-full flex items-center justify-center">
                            <div className="w-3 h-3 bg-brand-yellow rounded-full shadow-sm" />
                        </div>
                        <span className="font-bold text-lg tracking-tight text-brand-green italic">TennisMatch</span>
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                        La plateforme n°1 pour trouver des partenaires de tennis, organiser des matchs et participer à des tournois locaux.
                    </p>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Liens Rapides</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><a href="/ads" className="hover:text-brand-green transition-colors">Toutes les annonces</a></li>
                        <li><a href="/calendar" className="hover:text-brand-green transition-colors">Calendrier</a></li>
                        <li><a href="/auth/login" className="hover:text-brand-green transition-colors">Se connecter</a></li>
                        <li><a href="/about" className="hover:text-brand-green transition-colors">À propos</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-900 mb-4">Légal</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li><a href="/cgu" className="hover:text-brand-green transition-colors">CGU</a></li>
                        <li><a href="/privacy" className="hover:text-brand-green transition-colors">Confidentialité</a></li>
                    </ul>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-gray-100 text-center text-xs text-gray-400">
                &copy; {new Date().getFullYear()} TennisMatch. Tous droits réservés.
            </div>
        </footer>
    );
}
