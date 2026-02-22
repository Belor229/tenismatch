"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Eye, EyeOff, MapPin, Calendar, Trophy, Package, Users } from "lucide-react";
import { getAdById, updateAd, deleteAd, toggleAdStatus } from "../../actions";
import { getCurrentUserId } from "@/lib/auth";
import { COUNTRIES } from "@/lib/countries";

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;
  
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    type: "partenaire",
    title: "",
    description: "",
    country: "",
    city: "",
    location: "",
    location_details: "",
    eventDatetime: "",
    requiredLevel: ""
  });

  useEffect(() => {
    loadAd();
  }, [adId]);

  const loadAd = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        router.push("/auth/login");
        return;
      }

      const adData = await getAdById(adId);
      if (!adData) {
        setError("Annonce non trouvée");
        setLoading(false);
        return;
      }

      if (adData.user_id !== userId) {
        setError("Vous n'êtes pas autorisé à modifier cette annonce");
        setLoading(false);
        return;
      }

      setAd(adData);
      setFormData({
        type: adData.type,
        title: adData.title,
        description: adData.description,
        country: adData.country,
        city: adData.city,
        location: adData.location || "",
        location_details: adData.location_details || "",
        eventDatetime: adData.event_datetime ? new Date(adData.event_datetime).toISOString().slice(0, 16) : "",
        requiredLevel: adData.required_level || ""
      });
      setLoading(false);
    } catch (error) {
      console.error("Load ad error:", error);
      setError("Erreur lors du chargement de l'annonce");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        router.push("/auth/login");
        return;
      }

      const result = await updateAd(adId, formData, userId);
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess("Annonce mise à jour avec succès !");
        setTimeout(() => {
          router.push(`/ads/${adId}`);
        }, 2000);
      }
    } catch (error) {
      setError("Une erreur inattendue est survenue");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
      return;
    }

    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        router.push("/auth/login");
        return;
      }

      const result = await deleteAd(adId, userId);
      
      if (result.error) {
        setError(result.error);
      } else {
        router.push("/ads/my");
      }
    } catch (error) {
      setError("Une erreur inattendue est survenue");
    }
  };

  const handleToggleStatus = async () => {
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        router.push("/auth/login");
        return;
      }

      const result = await toggleAdStatus(adId, userId);
      
      if (result.error) {
        setError(result.error);
      } else {
        setAd({ ...ad, is_active: result.isActive });
        setSuccess(`Annonce ${result.isActive ? 'activée' : 'désactivée'} avec succès !`);
      }
    } catch (error) {
      setError("Une erreur inattendue est survenue");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error && !ad) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 text-red-600 p-6 rounded-2xl mb-4">
            {error}
          </div>
          <Link href="/ads/my" className="text-brand-green font-bold hover:underline">
            Retour à mes annonces
          </Link>
        </div>
      </div>
    );
  }

  const getAdIcon = (type: string) => {
    switch (type) {
      case 'partenaire': return Users;
      case 'match': return Trophy;
      case 'tournoi': return Calendar;
      case 'materiel': return Package;
      default: return Users;
    }
  };

  const AdIcon = getAdIcon(formData.type);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            href={`/ads/${adId}`}
            className="flex items-center gap-2 text-gray-600 hover:text-brand-green transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour à l'annonce
          </Link>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleStatus}
              className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                ad?.is_active 
                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {ad?.is_active ? 'Désactiver' : 'Activer'}
            </button>
            
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Supprimer
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-2xl mb-6">
            {success}
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-brand-green/10 rounded-2xl flex items-center justify-center">
              <AdIcon className="w-8 h-8 text-brand-green" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modifier l'annonce</h1>
              <p className="text-gray-600">Mettez à jour les informations de votre annonce</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'annonce
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { value: 'partenaire', label: 'Partenaire', icon: Users },
                  { value: 'match', label: 'Match', icon: Trophy },
                  { value: 'tournoi', label: 'Tournoi', icon: Calendar },
                  { value: 'materiel', label: 'Matériel', icon: Package }
                ].map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: type.value })}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        formData.type === type.value
                          ? 'border-brand-green bg-brand-green/10 text-brand-green'
                          : 'border-gray-200 hover:border-gray-300 text-gray-600'
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                      <span className="text-sm font-medium">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Titre *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="Recherche partenaire pour match hebdomadaire"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="Décrivez ce que vous cherchez..."
              />
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pays *
                </label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent"
                >
                  <option value="">Sélectionner un pays</option>
                  {COUNTRIES.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent"
                  placeholder="Paris"
                />
              </div>
            </div>

            {/* Location Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lieu spécifique (optionnel)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent"
                placeholder="Roland Garros, Court central..."
              />
            </div>

            {/* Event Date (for tournaments/matches) */}
            {(formData.type === 'tournoi' || formData.type === 'match') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date et heure de l'événement
                </label>
                <input
                  type="datetime-local"
                  value={formData.eventDatetime}
                  onChange={(e) => setFormData({ ...formData, eventDatetime: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent"
                />
              </div>
            )}

            {/* Required Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau requis
              </label>
              <select
                value={formData.requiredLevel}
                onChange={(e) => setFormData({ ...formData, requiredLevel: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-green focus:border-transparent"
              >
                <option value="">Tous niveaux</option>
                <option value="debutant">Débutant</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Avancé</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <Link
                href={`/ads/${adId}`}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-brand-green text-white rounded-xl hover:bg-brand-green/90 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
