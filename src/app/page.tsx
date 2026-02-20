import { Search, Users, Trophy, ShoppingBag, ArrowRight, MapPin, Calendar as CalendarIcon, Sparkles, Package } from "lucide-react";
import Link from "next/link";
import { getAds } from "./ads/actions";

export const dynamic = "force-dynamic";

export default async function Home() {
  const ads = await getAds();
  const recentAds = ads.slice(0, 3);

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {/* Hero Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="/img/img6.webp"
            alt="Tennis Action"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-brand-green/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-green via-transparent to-brand-green/30" />
        </div>

        <div className="absolute inset-0 opacity-10 z-0">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white" />
          <div className="absolute top-0 left-1/2 w-1 h-full bg-white" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white rounded-full" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center text-white">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 mb-8 animate-fade-in shadow-xl">
            <span className="w-2 h-2 bg-brand-yellow rounded-full animate-pulse" />
            <span className="text-sm font-medium">Rejoignez la communauté des joueurs locaux</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
            Le Tennis est plus fun <br />
            <span className="text-brand-yellow underline decoration-brand-yellow/30 underline-offset-8">quand on joue à deux.</span>
          </h1>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md">
            Trouvez instantanément des partenaires de votre niveau, participez à des tournois et échangez votre matériel. La communauté tennis n°1.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/ads"
              className="w-full sm:w-auto bg-brand-yellow text-brand-green px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brand-yellow/30 flex items-center justify-center gap-2"
            >
              Trouver un match <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/auth/signup"
              className="w-full sm:w-auto bg-white/10 backdrop-blur-md text-white border border-white/20 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            >
              Créer mon compte
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats/Categories */}
      <section className="max-w-7xl mx-auto px-6 w-full -mt-24 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Users, label: "Partenaires", color: "bg-blue-500", href: "/ads?type=partenaire", img: "/img/img4.jpg" },
            { icon: Trophy, label: "Tournois", color: "bg-orange-500", href: "/ads?type=tournoi", img: "/img/img2.webp" },
            { icon: ShoppingBag, label: "Matériel", color: "bg-purple-500", href: "/ads?type=materiel", img: "/img/img8.jpg" },
            { icon: CalendarIcon, label: "Calendrier", color: "bg-emerald-500", href: "/calendar", img: "/img/img7.webp" },
          ].map((cat, i) => (
            <Link
              key={i}
              href={cat.href}
              className="bg-white rounded-3xl shadow-2xl shadow-gray-200/40 flex flex-col items-center hover:-translate-y-2 transition-all border border-gray-50 group overflow-hidden"
            >
              <div className="w-full h-32 relative">
                <img src={cat.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={cat.label} />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`${cat.color} w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    <cat.icon className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                </div>
              </div>
              <div className="py-4 md:py-6 text-center">
                <span className="font-bold text-gray-900 md:text-lg">{cat.label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Ads Preview */}
      <section className="max-w-7xl mx-auto px-6 w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Annonces récentes</h2>
            <p className="text-gray-500">Découvrez les dernières opportunités de jeu autour de vous.</p>
          </div>
          <Link href="/ads" className="hidden md:flex items-center gap-2 text-brand-green font-bold hover:gap-3 transition-all">
            Tout voir <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {recentAds.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <p className="text-gray-500">Aucune annonce pour le moment. Soyez le premier à publier !</p>
            <Link href="/ads/create" className="text-brand-green font-bold hover:underline mt-4 inline-block">Publier une annonce</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentAds.map((ad: any) => (
              <Link key={ad.id} href={`/ads/${ad.id}`} className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all flex flex-col h-full">
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <div className="absolute top-4 left-4 bg-brand-green text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider z-10">
                    {ad.type}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-green/10 to-brand-yellow/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    {ad.type === 'partenaire' && <Users className="w-16 h-16 text-brand-green/20" />}
                    {ad.type === 'match' && <Trophy className="w-16 h-16 text-brand-green/20" />}
                    {ad.type === 'tournoi' && <Sparkles className="w-16 h-16 text-brand-green/20" />}
                    {ad.type === 'materiel' && <Package className="w-16 h-16 text-brand-green/20" />}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-green transition-colors line-clamp-2">
                    {ad.title}
                  </h3>
                  <div className="flex flex-col gap-2 text-gray-500 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-brand-green" /> {ad.city}
                    </div>
                    {ad.event_datetime && (
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-brand-green" /> {new Date(ad.event_datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                  </div>
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-brand-green/10 rounded-full flex items-center justify-center text-brand-green font-bold text-[10px] uppercase">
                        {ad.display_name?.charAt(0) || "U"}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{ad.display_name}</span>
                    </div>
                    <span className="text-brand-green font-bold text-xs group-hover:translate-x-1 transition-transform">Détails →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 md:hidden text-center">
          <Link href="/ads" className="inline-flex items-center gap-2 text-brand-green font-bold">
            Voir toutes les annonces <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 w-full mb-10">
        <div className="relative group bg-brand-green rounded-[40px] p-10 md:p-20 overflow-hidden text-center md:text-left shadow-2xl shadow-brand-green/20">
          <div className="absolute inset-0 z-0">
            <img src="/img/img9.jpg" className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-700" alt="CTA Match" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-green via-brand-green/80 to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Prêt à fouler les courts? <br />
                <span className="text-brand-yellow italic">Trouvez votre prochain adversaire.</span>
              </h2>
              <p className="text-white/80 text-lg mb-0 leading-relaxed drop-shadow-sm">
                Inscrivez-vous gratuitement et rejoignez la plus grande communauté de tennis. Publication gratuite d'annonces en moins de 2 minutes.
              </p>
            </div>
            <Link
              href="/auth/signup"
              className="bg-brand-yellow text-brand-green px-10 py-5 rounded-full font-bold text-lg hover:scale-110 active:scale-95 transition-all shadow-xl shadow-brand-yellow/30"
            >
              C'est parti !
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

