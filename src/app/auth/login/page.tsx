"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Phone, Lock, ArrowRight, AlertCircle, CheckCircle, Eye, EyeOff, Globe } from "lucide-react";
import { loginWithPhone } from "@/lib/auth-phone";
import { getSupportedCountries, parsePhoneNumber, validatePhoneNumber } from "@/lib/auth-phone-client";

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('+33');
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState("");

    const countries = getSupportedCountries();
    const selectedCountryData = countries.find(c => c.code === selectedCountry);

    useEffect(() => {
        if (searchParams.get("registered")) {
            setSuccess("Compte créé avec succès ! Connectez-vous maintenant.");
        }
    }, [searchParams]);

    const validatePhone = (phone: string) => {
        const fullPhone = selectedCountry + phone;
        const validation = validatePhoneNumber(fullPhone, selectedCountry);
        if (!validation.isValid) {
            setPhoneError(validation.error || 'Format invalide');
            return false;
        }
        setPhoneError('');
        return true;
    };

    const handlePhoneChange = (value: string) => {
        setPhone(value);
        if (value) {
            validatePhone(value);
        } else {
            setPhoneError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        if (!validatePhone(phone)) {
            setError("Veuillez corriger le format du numéro de téléphone.");
            setLoading(false);
            return;
        }

        try {
            const fullPhone = selectedCountry + phone;
            const result = await loginWithPhone({ phone: fullPhone, password });

            if (result.error) {
                setError(result.error);
            } else {
                const redirectTo = searchParams.get("redirect") || "/profile";
                router.push(redirectTo);
            }
        } catch (error) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-green rounded-2xl mb-6 shadow-xl shadow-brand-green/20">
                    <Phone className="w-8 h-8 text-white" />
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

                {/* Phone Input with Country Selection */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 ml-1">Numéro de téléphone</label>
                    <div className="flex gap-2">
                        <div className="relative">
                            <select
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 py-4 pl-10 pr-8 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all text-sm"
                            >
                                {countries.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.flag} {country.code}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Globe className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        <div className="relative group flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                <Phone className="w-5 h-5" />
                            </div>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => handlePhoneChange(e.target.value)}
                                placeholder={selectedCountryData?.format || "0X XX XX XX XX"}
                                className={`w-full bg-white border py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all ${
                                    phoneError ? 'border-red-500' : 'border-gray-200'
                                }`}
                            />
                        </div>
                    </div>
                    {phoneError && (
                        <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                    )}
                    {selectedCountryData && (
                        <p className="text-xs text-gray-500 mt-1">
                            Format {selectedCountryData.name}: {selectedCountryData.format}
                        </p>
                    )}
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
                            type={showPassword ? "text" : "password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full bg-white border border-gray-200 py-4 pl-12 pr-12 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading || !!phoneError}
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
