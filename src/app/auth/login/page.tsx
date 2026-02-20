"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, Lock, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import { login } from "../actions";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (searchParams.get("registered")) {
            setSuccess("Compte créé avec succès ! Connectez-vous maintenant.");
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        const result = await login({ phone, password });

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            const redirectTo = searchParams.get("redirect") || "/profile";
            router.push(redirectTo);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-2xl mb-6 shadow-xl shadow-brand-green/20">
                    <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Bon retour !</h1>
                <p className="text-gray-500">Connectez-vous pour retrouver vos partenaires.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 text-sm animate-shake">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-2xl flex items-center gap-3 text-sm animate-fade-in">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        {success}
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Numéro de téléphone</label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                            <Phone className="w-5 h-5" />
                        </div>
                        <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="01 02 03 04 05"
                            className="w-full bg-white border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-sm font-semibold text-gray-700">Mot de passe</label>
                        <Link href="/auth/forgot" className="text-xs font-medium text-brand-green hover:underline">
                            Oublié ?
                        </Link>
                    </div>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-green text-white py-4 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brand-green/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? "Connexion..." : "Se connecter"} <ArrowRight className="w-5 h-5" />
                </button>
            </form>

            <p className="mt-10 text-center text-gray-500">
                Pas encore de compte ?{" "}
                <Link href="/auth/signup" className="text-brand-green font-bold hover:underline">
                    Inscrivez-vous
                </Link>
            </p>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <Suspense fallback={<div>Chargement...</div>}>
                <LoginForm />
            </Suspense>
        </div>
    );
}
