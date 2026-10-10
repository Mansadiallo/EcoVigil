# EcoVigil

**Observer • Signaler • Protéger**

EcoVigil est une application citoyenne hybride (web + mobile, PWA) pour le signalement environnemental, le suivi d'arbres plantés et la conduite d'enquêtes environnementales de terrain, développée dans le cadre de la Plateforme Africaine d'Actions et de Contrôle Environnemental.

## Fonctionnalités

- **Signalement environnemental** géolocalisé, avec photo, catégorisation et suivi de statut
- **Suivi d'arbres plantés** avec surface à reboiser (citoyens et organisations)
- **Enquêtes environnementales** : constructeur de questionnaires libres, ou modèle standard structuré (identification, localisation, constat, impacts par domaine, preuves, niveau de gravité, recommandations) avec formulaire par étapes, fonctionnement hors connexion, génération de rapport (narratif, tableau, carte, chronologie) et affichage des dossiers validés sur la carte
- **Espace bénévole** avec module Profil (compte de base requis avant inscription) et accès aux dossiers d'enquête assignés
- **Espace Organisation** : dossier d'inscription, membres invités par code (partageable via WhatsApp), gestion des groupes de terrain, suivi des enquêtes de l'organisation avec filtres, statistiques et export Excel
- **Centre d'EcoVigil** : back-office de modération et d'administration (signalements, enquêtes, bénévoles, organisations, contenu, sécurité)
- Carte interactive multi-couches, assistant IA, biodiversité, événements, actualités
- Hors-ligne avec file d'attente de synchronisation (signalements, enquêtes, inscriptions) et détection de conflit
- Multilingue (français, anglais, portugais, espagnol, swahili, arabe — RTL supporté)

## Stack technique

- [Vite](https://vitejs.dev) + React 18, avec un point d'entrée (`src/main.jsx`) et l'application principale dans `src/App.jsx`
- [Supabase](https://supabase.com) : base de données Postgres, authentification, stockage de fichiers, fonctions RPC et politiques de sécurité (RLS)
- Leaflet, Esri Leaflet et MapLibre GL (cartographie), SheetJS (export Excel) et jsPDF (export PDF), chargés en CDN
- PWA : `manifest.json` + service worker + icônes pour l'installation sur mobile et bureau

## Structure du dépôt

```
.
├── index.html                     # Gabarit HTML (styles, polices, scripts CDN, point de montage)
├── src/
│   ├── main.jsx                   # Point d'entrée : monte <App /> dans #root
│   └── App.jsx                    # Application complète (interface + logique)
├── public/
│   ├── manifest.json              # Manifeste PWA
│   ├── service-worker.js
│   ├── icon-16.png
│   ├── icon-32.png
│   ├── icon-180.png
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-512-maskable.png
├── .github/workflows/deploy.yml   # Construction et publication automatiques sur GitHub Pages
├── package.json
├── vite.config.js
└── .gitignore
```

## Déploiement

Le dépôt est construit automatiquement par **GitHub Actions** à chaque envoi sur `main` (voir `.github/workflows/deploy.yml`), qui installe les dépendances, exécute `npm run build`, puis publie le contenu de `dist/` sur GitHub Pages.

Réglage requis une seule fois sur le dépôt : **Settings → Pages → Source : GitHub Actions**.

### En local

```bash
npm install
npm run dev      # serveur de développement
npm run build    # build de production dans dist/
```

## Configuration

La connexion à Supabase (URL du projet et clé publique `anon`) est intégrée en tête de `src/App.jsx` (constantes `SUPABASE_URL` et clé associée). Si vous déployez votre propre instance Supabase, remplacez ces valeurs et appliquez le schéma de base de données (tables, fonctions RPC, politiques RLS) correspondant.

`vite.config.js` définit `base: "/EcoVigil/"`, qui doit correspondre au nom du dépôt si celui-ci change.

## Licence

Copyright (c) 2026 Mansa Diallo.
Ce code est distribué sous licence GNU AGPL-3.0 (voir le fichier LICENSE).
Toute version modifiée, y compris proposée en ligne, doit rester ouverte sous la même licence.

Le nom et le logo EcoVigil sont réservés et ne sont pas couverts par cette licence.
Code développé avec l'assistance d'une IA, sous la direction de Mansa Diallo.
