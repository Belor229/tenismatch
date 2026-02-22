#!/bin/bash

# Script de déploiement TenisMatch pour Vercel
# Usage: ./vercel-deploy.sh

echo "🎾 Déploiement de TenisMatch sur Vercel..."

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé. Installation en cours..."
    npm install -g vercel
fi

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Ce n'est pas un projet Next.js. Veuillez exécuter ce script depuis la racine du projet."
    exit 1
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Build du projet
echo "🔨 Build du projet..."
npm run build

# Vérifier le build
if [ $? -ne 0 ]; then
    echo "❌ Le build a échoué. Veuillez corriger les erreurs avant de déployer."
    exit 1
fi

echo "✅ Build réussi!"

# Déploiement sur Vercel
echo "🚀 Déploiement sur Vercel..."
vercel --prod

echo "🎉 Déploiement terminé!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Configurez les variables d'environnement dans Vercel:"
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "   - NEXT_PUBLIC_APP_URL"
echo "   - JWT_SECRET"
echo ""
echo "2. Exécutez le script SQL dans Supabase:"
echo "   - Allez dans le dashboard Supabase > SQL Editor"
echo "   - Copiez-collez le contenu de supabase/schema-phone-only.sql"
echo "   - Exécutez le script"
echo ""
echo "3. Testez l'application:"
echo "   - Inscription par téléphone"
echo "   - Connexion"
echo "   - Création d'annonces"
echo "   - Messagerie"
echo ""
echo "🌍 Votre plateforme TenisMatch est maintenant en ligne!"
