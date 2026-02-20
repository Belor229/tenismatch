"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-12">
            <div className="w-full max-w-md text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Mot de passe oublié</h1>
                <p className="text-gray-500 mb-8">
                    Cette fonctionnalité sera disponible prochainement. En attendant, contactez le support si vous avez oublié votre mot de passe.
                </p>
                <Link
                    href="/auth/login"
                    className="inline-flex items-center gap-2 text-brand-green font-bold hover:underline"
                >
                    <ArrowLeft className="w-4 h-4" /> Retour à la connexion
                </Link>
            </div>
        </div>
    );
}

