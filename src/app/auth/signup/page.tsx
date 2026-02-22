"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Lock, User, Award, ChevronRight, AlertCircle, ArrowRight, Eye, EyeOff, Globe } from "lucide-react";
import { signupWithPhone } from "@/lib/auth-phone";
import { getSupportedCountries, parsePhoneNumber, validatePhoneNumber } from "@/lib/auth-phone-client";

export default function SignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedCountry, setSelectedCountry] = useState('+33');
    const [formData, setFormData] = useState({
        phone: '',
        displayName: '',
        password: '',
        confirmPassword: '',
        country: '',
        city: '',
        age: '',
        level: 'debutant',
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [phoneError, setPhoneError] = useState("");

    const countries = getSupportedCountries();
    const selectedCountryData = countries.find(c => c.code === selectedCountry);

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
        setFormData({ ...formData, phone: value });
        if (value) {
            validatePhone(value);
        } else {
            setPhoneError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères.");
            setLoading(false);
            return;
        }

        if (!validatePhone(formData.phone)) {
            setError("Veuillez corriger le format du numéro de téléphone.");
            setLoading(false);
            return;
        }

        try {
            const fullPhone = selectedCountry + formData.phone;
            const additionalData = {
                country: selectedCountryData?.name || 'France',
                city: formData.city,
                level: formData.level,
                age: formData.age ? parseInt(formData.age) : undefined
            };

            const result = await signupWithPhone({
                phone: fullPhone,
                password: formData.password,
                displayName: formData.displayName,
                ...additionalData
            });

            if (result.error) {
                setError(result.error);
            } else {
                router.push("/auth/login?registered=true");
            }
        } catch (error) {
            setError("Une erreur inattendue est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-yellow rounded-2xl mb-6 shadow-xl shadow-brand-yellow/20">
                        <Phone className="w-8 h-8 text-brand-green" />
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

                    {/* Phone Input with Country Selection */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Numéro de téléphone</label>
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
                                    value={formData.phone}
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
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Mot de passe</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Confirmer le mot de passe</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-white border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Âge</label>
                            <input
                                type="number"
                                value={formData.age}
                                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                min="16"
                                max="100"
                                placeholder="25"
                                className="w-full bg-white border border-gray-200 py-4 px-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                            />
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Pays</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <select
                                    required
                                    value={formData.country}
                                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                    className="w-full bg-white border border-gray-200 py-4 px-4 pl-12 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all appearance-none"
                                >
                                    <option value="">Sélectionner un pays</option>
                                    {countries.map((country) => (
                                        <option key={country.name} value={country.name}>
                                            {country.flag} {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">Ville</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-brand-green transition-colors">
                                    <MapPin className="w-4 h-4" />
                                </div>
                                <input
                                    type="text"
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="Paris"
                                    className="w-full bg-white border border-gray-200 py-4 pl-12 pr-4 rounded-2xl focus:ring-2 focus:ring-brand-green focus:border-transparent outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!phoneError}
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
