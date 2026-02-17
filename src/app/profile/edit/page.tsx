"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, MapPin, Award, FileText, Lock, Check, ChevronLeft, AlertCircle } from "lucide-react";
import { getProfile, updateProfile } from "@/app/profile/actions";
import { cn } from "@/lib/utils";

export default function EditProfilePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        displayName: "",
        age: "",
        city: "",
        level: "debutant",
        bio: "",
        isPublic: true,
    });

    useEffect(() => {
        async function fetchProfile() {
            const profile = await getProfile(1); // Mock UserId
            if (profile) {
                setFormData({
                    displayName: profile.display_name,
                    age: profile.age || "",
                    city: profile.city || "",
                    level: profile.level || "debutant",
                    bio: profile.bio || "",
                    isPublic: profile.is_public === 1,
                });
            }
            setLoading(false);
        }
        fetchProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        const result = await updateProfile(1, formData);

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
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-brand-green" /> Biographie
                        </label>
                        <textarea
                            rows={4}
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            placeholder="Parlez de votre jeu, vos disponibilités..."
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
