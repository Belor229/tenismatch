"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, MapPin, Award, FileText, Check, ChevronLeft, AlertCircle } from "lucide-react";
import { getProfileForCurrentUser, updateProfileForCurrentUser } from "@/app/profile/actions";

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<{
        displayName: string;
        age: string | number;
        country: string;
        city: string;
        level: string;
        bio: string;
        experience: string;
        avatarUrl: string;
        isPublic: boolean;
    }>({
        displayName: "",
        age: "",
        country: "",
        city: "",
        level: "debutant",
        bio: "",
        experience: "",
        avatarUrl: "",
        isPublic: true,
    });

    useEffect(() => {
        async function fetchProfile() {
            const profile = await getProfileForCurrentUser();
            if (profile) {
                setFormData({
                    displayName: profile.display_name || "",
                    age: profile.age || "",
                    country: profile.country || "",
                    city: profile.city || "",
                    level: profile.level || "debutant",
                    bio: profile.bio || "",
                    experience: profile.experience || "",
                    avatarUrl: profile.avatar_url || "",
                    isPublic: profile.is_public === true || profile.is_public === 1,
                });
            } else {
                router.push("/auth/login?redirect=/profile/edit");
            }
            setLoading(false);
        }
        fetchProfile();
    }, [router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const result: any = await updateProfileForCurrentUser(formData);

        if (result.success) {
            router.push("/profile");
        } else {
            setError(result.error || "Une erreur est survenue.");
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto px-6 py-12 md:py-20">
            <Link href="/profile" className="inline-flex items-center gap-2 text-gray-500 font-semibold mb-10 hover:text-brand-green transition-colors">
                <ChevronLeft className="w-5 h-5" /> Retour au profil
            </Link>

            <div className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Modifier mon profil</h1>
                <p className="text-gray-500">Personnalisez votre présence sur la plateforme.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <div className="bg-white p-8 rounded-[40px] shadow-xl shadow-gray-200/50 space-y-6 border border-gray-100">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <User className="w-4 h-4 text-brand-green" /> Nom / Pseudo
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-brand-green" /> Pays
                            </label>
                            <select
                                value={formData.country}
                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all appearance-none"
                            >
                                <option value="">Choisir...</option>
                                <option value="Bénin">Bénin</option>
                                <option value="Togo">Togo</option>
                                <option value="Côte d'Ivoire">Côte d'Ivoire</option>
                                <option value="Sénégal">Sénégal</option>
                                <option value="Cameroun">Cameroun</option>
                                <option value="France">France</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-brand-green" /> Ville
                            </label>
                            <input
                                type="text"
                                value={formData.city}
                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                placeholder="Ex: Paris"
                                className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <Award className="w-4 h-4 text-brand-green" /> Niveau
                            </label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all appearance-none"
                            >
                                <option value="debutant">Débutant</option>
                                <option value="intermediaire">Intermédiaire</option>
                                <option value="avance">Avancé</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                <User className="w-4 h-4 text-brand-green" /> Photo de profil (URL)
                            </label>
                            <input
                                type="text"
                                value={formData.avatarUrl}
                                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                                placeholder="https://exemple.com/image.jpg"
                                className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-brand-green" /> Expérience & Parcours
                        </label>
                        <textarea
                            rows={3}
                            value={formData.experience}
                            onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                            placeholder="Décrivez vos années de pratique, vos clubs, votre style de jeu..."
                            className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-brand-green" /> Biographie (Rapide)
                        </label>
                        <textarea
                            rows={3}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Un petit mot sur vous..."
                            className="w-full bg-ui-gray/50 border border-gray-100 py-4 px-6 rounded-2xl focus:ring-2 focus:ring-brand-green focus:bg-white outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-ui-gray/20 rounded-2xl">
                        <input
                            type="checkbox"
                            id="isPublic"
                            checked={formData.isPublic}
                            onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                            className="w-5 h-5 accent-brand-green cursor-pointer"
                        />
                        <label htmlFor="isPublic" className="text-sm font-medium text-gray-600 cursor-pointer select-none">
                            Rendre mon profil public pour les autres membres
                        </label>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-brand-green text-white py-5 rounded-[22px] font-bold text-lg hover:bg-opacity-95 transition-all shadow-xl shadow-brand-green/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    {saving ? "Enregistrement..." : "Enregistrer les modifications"} <Check className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
