# Guide de Déploiement - TenisMatch (Authentification par Téléphone)

## 🎾 Overview

TenisMatch est une plateforme complète de mise en relation entre joueurs de tennis, construite avec Next.js 16, TypeScript, TailwindCSS et Supabase. **Version avec authentification par téléphone uniquement adaptée à chaque pays.**

## 🚀 Prérequis

- Node.js 18+ 
- npm ou yarn
- Un compte Supabase
- Un compte Vercel (pour le déploiement)

## 📋 Configuration de la Base de Données

### 1. Créer le projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet : `tenismatch-phone`
3. Notez votre URL et clé anon

### 2. Exécuter le schéma SQL

1. Dans le dashboard Supabase, allez à `SQL Editor`
2. Copiez et exécutez le contenu complet de `supabase/schema-phone-only.sql`
3. Vérifiez que toutes les tables ont été créées

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` à la racine :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase

# Application Configuration
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
JWT_SECRET=votre_secret_jwt_tres_securise
```

## 🔧 Installation et Développement Local

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Builder pour production
npm run build

# Démarrer le serveur de production
npm start
```

## 🌐 Déploiement sur Vercel

### Méthode 1: Script Automatisé

```bash
# Rendre le script exécutable (macOS/Linux)
chmod +x vercel-deploy.sh

# Exécuter le déploiement
./vercel-deploy.sh
```

### Méthode 2: Manuel

1. **Préparer le déploiement**
   ```bash
   npm install
   npm run build
   ```

2. **Configuration Vercel**
   Dans Vercel, ajoutez ces variables d'environnement :
   ```
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
   NEXT_PUBLIC_APP_URL=https://votre-domaine.vercel.app
   JWT_SECRET=votre_secret_jwt_tres_securise
   ```

3. **Déployer**
   ```bash
   npm install -g vercel
   vercel --prod
   ```

## 📱 Pays Supportés (21 pays)

### Europe
- 🇫🇷 France (+33) - Format: 0X XX XX XX XX
- 🇨🇭 Suisse (+41) - Format: 0XX XXX XX XX
- 🇧🇪 Belgique (+32) - Format: 0XXX XX XX XX
- 🇳🇱 Pays-Bas (+31) - Format: 0XXX XX XX XX
- 🇩🇪 Allemagne (+49) - Format: 0XXX XX XX XX
- 🇬🇧 Royaume-Uni (+44) - Format: 0XXXX XXXXXX
- 🇪🇸 Espagne (+34) - Format: XXX XXX XXX
- 🇮🇹 Italie (+39) - Format: XXX XXX XXXX
- 🇵🇹 Portugal (+351) - Format: XXX XXX XXXX

### Afrique du Nord
- 🇲🇦 Maroc (+212) - Format: XX XX XX XX
- 🇹🇳 Tunisie (+216) - Format: XX XX XX XX
- 🇩🇿 Algérie (+213) - Format: XX XX XX XX
- 🇪🇬 Égypte (+20) - Format: XX XX XX XX

### Amérique
- 🇺🇸 USA/Canada (+1) - Format: XXX XXX XXXX
- 🇧🇷 Brésil (+55) - Format: XX XXXX XXXX

### Asie
- 🇯🇵 Japon (+81) - Format: XX XXX XXXX
- 🇨🇳 Chine (+86) - Format: 1XX XXXX XXXX
- 🇮🇳 Inde (+91) - Format: XX XX XX XX
- 🇷🇺 Russie (+7) - Format: XXX XX XX XX

### Océanie
- 🇦🇺 Australie (+61) - Format: XX XX XX XX

## 📊 Fonctionnalités Déployées

### ✅ Authentification par Téléphone
- **Inscription par téléphone** avec validation par pays
- **Connexion sécurisée** avec bcrypt
- **Sessions persistantes** (7 jours)
- **Support multi-pays** avec formats validés
- **Vérification SMS** (préparation pour production)

### ✅ Gestion des Annonces
- CRUD complet des annonces
- Types: partenaire, match, tournoi, matériel
- Filtrage avancé par lieu, niveau, type
- Gestion du statut (actif/inactif)

### ✅ Messagerie en Temps Réel
- Chat instantané avec Supabase Realtime
- Notifications de messages
- Indicateurs de lecture
- Optimistic updates

### ✅ Publications et Victoires
- Partage de victoires et performances
- Photos et descriptions
- Timeline publique avec filtres
- Types de match (singles, doubles, tournament)

### ✅ Événements et Tournois
- Création d'événements
- Inscription des participants avec limites
- Gestion des dates et lieux
- Frais d'inscription optionnels
- **Génération de flyers numériques** (3 styles)

### ✅ Profils Utilisateurs
- Profils complets avec avatar
- Niveaux de jeu
- Statistiques personnelles
- Paramètres de confidentialité

## 🔒 Sécurité

- Hashage bcrypt (10 rounds)
- Protection XSS avec Next.js
- CSRF protection
- Row Level Security (RLS) sur Supabase
- Validation des numéros par pays
- Variables d'environnement sécurisées

## 📱 Responsive Design

- Mobile-first design
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Animations fluides
- Touch-friendly interactions
- Interface adaptée au téléphone

## 🎨 Personnalisation

### Couleurs principales
- Vert principal: `#0B6E4F`
- Jaune accent: `#F5E400`
- Gris UI: `#F4F4F4`

### Polices
- Police principale: Inter (ou system font)
- Poids: 400-700
- Tailles responsive

## 📈 Monitoring et Analytics

### Logs Supabase
- Monitorer les requêtes SQL
- Surveiller les erreurs
- Analytics des performances

### Vercel Analytics
- Statistiques d'utilisation
- Performance des pages
- Erreurs client

## 🔄 Maintenance

### Mises à jour du schéma
1. Tester les changements en développement
2. Créer des migrations SQL
3. Appliquer progressivement en production

### Backups
- Backups automatiques Supabase
- Export régulier des données
- Plan de restauration

## 🚨 Gestion des Erreurs

### Erreurs communes
1. **CORS**: Configurer les domaines autorisés dans Supabase
2. **Connexion DB**: Vérifier les variables d'environnement
3. **Build**: Vérifier les imports et types TypeScript
4. **Format téléphone**: Vérifier le pays sélectionné

### Debugging
```bash
# Logs de développement
npm run dev

# Build avec logs détaillés
npm run build --debug

# Tests
npm run test
```

## 📞 Support

Pour toute question ou problème :
1. Vérifier les logs dans Vercel
2. Consulter la documentation Supabase
3. Tester en environnement local
4. Vérifier le format du numéro de téléphone

## 🎯 Prochaines Étapes

- [ ] Intégration SMS réel (Twilio/Vonage)
- [ ] Notifications push mobile
- [ ] Intégration paiements Stripe
- [ ] Algorithmes de matching
- [ ] Chat vidéo/WebRTC
- [ ] Application mobile native

---

**TenisMatch v1.0 Phone-Only - Prêt pour le déploiement mondial ! 🎾🌍**

## 🚀 Déploiement Rapide

```bash
# Clonez le projet
git clone <repository-url>
cd tennis-match

# Déployez en une commande
./vercel-deploy.sh
```

Votre plateforme sera disponible en quelques minutes !

