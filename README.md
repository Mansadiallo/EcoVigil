# EcoVigil

**Observer • Signaler • Protéger**

EcoVigil est une application citoyenne hybride (web + mobile, PWA) pour le signalement environnemental et le suivi d'arbres plantés, développée dans le cadre de la Plateforme Africaine d'Actions et de Contrôle Environnemental.

## Fonctionnalités

- **Signalement environnemental** géolocalisé, avec photo, catégorisation et suivi de statut
- **Suivi d'arbres plantés** avec surface à reboiser (citoyens et organisations)
- **Espace bénévole** avec module Profil (compte de base requis avant inscription)
- **Espace Organisation** : dossier d'inscription, membres invités par code (partageable via WhatsApp), gestion des groupes de terrain
- **Centre d'EcoVigil** : back-office de modération et d'administration (signalements, bénévoles, organisations, contenu, sécurité)
- Carte interactive, assistant IA, biodiversité, événements, actualités
- Hors-ligne avec file d'attente de synchronisation
- Multilingue (français, anglais, portugais, espagnol, swahili, arabe — RTL supporté)

## Stack technique

- Application monofichier (`index.html`) : React (via CDN, JSX transpilé au chargement), sans étape de build
- [Supabase](https://supabase.com) : base de données Postgres, authentification, stockage de fichiers
- PWA : `manifest.json` + icônes pour l'installation sur mobile et bureau

## Structure du dépôt

```
.
├── index.html            # Application complète (interface + logique)
├── manifest.json         # Manifeste PWA
├── icon-16.png            
├── icon-32.png
├── icon-180.png
├── icon-192.png
├── icon-512.png
└── icon-512-maskable.png
```

## Déploiement

Ce projet ne nécessite aucune étape de build : il suffit de servir les fichiers statiquement.

### Avec GitHub Pages

1. **Settings → Pages** sur ce dépôt
2. Source : *Deploy from a branch* → branche `main`, dossier `/ (root)`
3. L'app est accessible à l'URL fournie par GitHub

### En local

Servez le dossier avec n'importe quel serveur statique, par exemple :

```bash
npx serve .
```

## Configuration

La connexion à Supabase (URL du projet et clé publique `anon`) est déjà intégrée dans `index.html`. Si vous déployez votre propre instance Supabase, remplacez `SUPABASE_URL` et `SUPABASE_KEY` en tête de fichier, et appliquez le schéma de base de données (tables, fonctions RPC, politiques RLS) correspondant.

## Licence

À définir par le porteur du projet.
