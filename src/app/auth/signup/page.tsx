"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Phone, Lock, User, MapPin, ArrowRight, AlertCircle } from "lucide-react";
import { signup } from "../actions";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState<{
        phone: string;
        displayName: string;
        password: string;
        country: string;
        level: string;
    }>({
        phone: "",
        displayName: "",
        password: "",
        country: "",
        level: "debutant",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await signup(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push("/auth/login?registered=true");
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-yellow rounded-2xl mb-6 shadow-xl shadow-brand-yellow/20">
                        <User className="w-8 h-8 text-brand-green" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
                    <p className="text-gray-500">Rejoignez la communauté des tennisman locaux.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm animate-shake">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Nom / Pseudo</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                <User className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                required
                                value={formData.displayName}
                                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                                placeholder="Votre nom ou pseudo"
                                className="w-full bg-white border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Numéro de téléphone</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                <Phone className="w-5 h-5" />
                            </div>
                            <input
                                type="tel"
                                required
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="01 02 03 04 05"
                                className="w-full bg-white border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Pays</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <select
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full bg-white border border-gray-200 py-4 pl-10 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all appearance-none"
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
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Niveau</label>
                            <select
                                value={formData.level}
                                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                                className="w-full bg-white border border-gray-200 py-4 px-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all appearance-none"
                            >
                                <option value="debutant">Débutant</option>
                                <option value="intermediaire">Intermédiaire</option>
                                <option value="avance">Avancé</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1 pt-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mot de passe</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-white border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? "Création..." : "Créer mon compte"} <ArrowRight className="w-5 h-5" />
                    </button>
                </form>

                <p className="mt-8 text-center text-gray-500">
                    Déjà un compte ?{" "}
                    <Link href="/auth/login" className="text-brand-green font-bold hover:underline">
                        Connectez-vous
                    </Link>
                </p>
            </div>
        </div>
    );
}
