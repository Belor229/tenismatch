# Déploiement TennisMatch

## Variables d'environnement

Créez un fichier `.env.local` à la racine du projet (ou configurez-les sur Vercel) :

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon_supabase
```

**Sur Vercel :** Project Settings > Environment Variables > Ajoutez ces deux variables pour Production, Preview et Development.

## Configuration Supabase

1. Créez un projet sur [supabase.com](https://supabase.com)
2. Allez dans **SQL Editor** > **New query**
3. Copiez-collez le contenu de `supabase/schema.sql`
4. Exécutez le script
5. Récupérez l'URL et la clé anon dans **Settings** > **API**

## Déploiement Vercel

1. Poussez le code sur GitHub
2. Importez le projet sur [vercel.com](https://vercel.com)
3. Configurez les variables d'environnement Supabase
4. Déployez

Le site sera opérationnel une fois Supabase configuré et les variables d'environnement définies.

