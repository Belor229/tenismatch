"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, MessageSquare, Package, ChevronRight, AlertCircle, Sparkles, Trophy } from "lucide-react";
import { COUNTRIES } from "@/lib/countries";
import { createAd } from "../actions";
import { getCurrentUserIdAction } from "@/app/auth/actions";
import { cn } from "@/lib/utils";

const adTypes = [
  { id: "partenaire", label: "Chercher partenaire", icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "match", label: "Match amical", icon: Trophy, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "tournoi", label: "Événement / Tournoi", icon: Sparkles, color: "text-emerald-500", bg: "bg-emerald-50" },
  { id: "materiel", label: "Vente matériel", icon: Package, color: "text-purple-500", bg: "bg-purple-50" },
];

export default function CreateAdPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    getCurrentUserIdAction().then((id) => {
      if (!id) router.push("/auth/login?redirect=/ads/create");
      else setUserId(id);
    });
  }, [router]);

  const [formData, setFormData] = useState<{
    type: string;
    title: string;
    description: string;
    country: string;
    city: string;
    location: string;
    location_details: string;
    eventDatetime: string;
    requiredLevel: string;
  }>({
    type: "partenaire",
    title: "",
    description: "",
    country: "",
    city: "",
    location: "",
    location_details: "",
    eventDatetime: "",
    requiredLevel: "intermediaire",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setLoading(true);
    setError("");

    const result: any = await createAd({ ...formData, userId });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/ads?created=true");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Publier une annonce</h1>
        <p className="text-gray-500">Choisissez le type d'annonce et partagez les détails.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Type Selection */}
        <div className="space-y-4">
          <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">Type d'annonce</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {adTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setFormData({ ...formData, type: type.id })}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all gap-3",
                  formData.type === type.id
                    ? "border-brand-green bg-brand-green/5 ring-4 ring-brand-green/10"
                    : "border-gray-100 bg-white hover:border-gray-200"
                )}
              >
                <div className={cn("p-3 rounded-2xl group", type.bg)}>
                  <type.icon className={cn("w-6 h-6", type.color)} />
                </div>
                <span className={cn("text-xs font-bold text-center", formData.type === type.id ? "text-brand-green" : "text-gray-600")}>
                  {type.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50 space-y-6 border border-gray-100">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Titre de l'annonce</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Cherche partenaire pour demain soir"
              className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Détaillez votre recherche..."
              className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" /> Pays
              </label>
              <select
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all appearance-none"
              >
                <option value="">Choisir un pays</option>
                {COUNTRIES.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-green" /> Ville
              </label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ex: Cotonou"
                className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Indication de localisation précise</label>
            <textarea
              rows={2}
              value={formData.location_details}
              onChange={(e) => setFormData({ ...formData, location_details: e.target.value })}
              placeholder="Ex: Près du stade de l'amitié, terrain C"
              className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all resize-none"
            />
          </div>

          <div className={`${formData.type === 'materiel' ? 'hidden' : 'block'} space-y-2`}>
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-green" /> Date & Heure
            </label>
            <input
              type="datetime-local"
              value={formData.eventDatetime}
              onChange={(e) => setFormData({ ...formData, eventDatetime: e.target.value })}
              className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Niveau requis</label>
            <select
              value={formData.requiredLevel}
              onChange={(e) => setFormData({ ...formData, requiredLevel: e.target.value })}
              className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all appearance-none"
            >
              <option value="debutant">Débutant</option>
              <option value="intermediaire">Intermédiaire</option>
              <option value="avance">Avancé</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !userId}
          className="w-full bg-brand-green text-white py-5 rounded-[22px] font-bold text-lg hover:bg-opacity-95 transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {loading ? "Publication..." : "Publier l'annonce"} <ChevronRight className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
