# Structure de src/

`main.jsx` charge `App.jsx`. Les autres fichiers sont regroupés par rôle.


## Racine

- `App.jsx` — Composant racine : état global, navigation, chargement des données, assemblage des écrans

## lib/

- `lib/audit.js` — Journaux d'activité et d'audit, demandes de suppression, inscription bénévole
- `lib/carteUtils.jsx` — Outils de carte : marqueurs, couches, tuiles hors ligne, Sentinel-2, zones de reboisement
- `lib/categories.jsx` — Catégories de signalement, taxonomie environnementale, fiche environnementale
- `lib/exports.js` — Exports CSV, Excel, Word, PDF
- `lib/i18n.js` — Traductions (fr/en/pt/es) et fonction t()
- `lib/offline.js` — File d'attente hors ligne (signalements et enquêtes) et synchronisation
- `lib/push.js` — Notifications push
- `lib/supabase.js` — Client Supabase, sessions (citoyen, admin, appareil), requêtes REST/Auth/Storage
- `lib/utils.js` — Calculs et formats : CO2, distances, coordonnées (DD/DMS/UTM), priorité, limites de fréquence

## components/

- `components/ChargementEcran.jsx` — Écran « Chargement… » et garde-fou affichant un message + bouton « Recharger » si un écran ne se charge pas
- `components/VerifFileInput.jsx` — Champ d'envoi de fichier pour les dossiers de vérification
- `components/PasswordInput.jsx` — Champ mot de passe et règles de robustesse
- `components/icons.jsx` — Icônes SVG
- `components/media.jsx` — Photo, vidéo et audio : capture, vignettes, compression, envoi
- `components/shell.jsx` — Barre d'onglets, cloche de notifications, panneau Affichage, menu hamburger, écran d'accueil, onboarding
- `components/ui.jsx` — Éléments d'interface communs (Screen, SectionTitle, StatCard, TreeRing)

## screens/

- `screens/Accueil.jsx` — Écran d'accueil et carrousel
- `screens/Assistant.jsx` — Assistant de décision environnementale
- `screens/Biodiversite.jsx` — Observations de biodiversité
- `screens/Carte.jsx` — Carte interactive
- `screens/Confidentialite.jsx` — Confidentialité et suppression des données
- `screens/EspaceOrganisation.jsx` — Espace organisation
- `screens/Evenements.jsx` — Événements
- `screens/GroupesTerrain.jsx` — Groupes de terrain
- `screens/MonArbre.jsx` — Suivi des arbres plantés
- `screens/Organisation.jsx` — Inscription et connexion organisation, vérification du dossier
- `screens/Profil.jsx` — Profil, inscription bénévole
- `screens/Signaler.jsx` — Création d'un signalement

## enquetes/

- `enquetes/EnquetesTerrain.jsx` — Enquêtes terrain (écran bénévole, formulaires, bibliothèque de questions)
- `enquetes/OrgEnquetes.jsx` — Enquêtes côté organisation

## admin/

- `admin/AdminContenu.jsx` — Actualités et événements (admin)
- `admin/AdminEnquetes.jsx` — Enquêtes (admin)
- `admin/AdminOrganisations.jsx` — Organisations et contenu environnemental (admin)
- `admin/AdminRapports.jsx` — Rapports et équipe (admin)
- `admin/AdminSecurite.jsx` — Sécurité, connexions, historique, double authentification (admin)
- `admin/AdminSpace.jsx` — Espace administrateur (point d'entrée)
- `admin/AdminUtilisateurs.jsx` — Suppressions et bénévoles (admin)
- `admin/Verification.jsx` — Vérification des dossiers
- `admin/constants.js` — Constantes et libellés de l'administration
- `admin/formulaires.jsx` — Formulaires de documents et de preuves, styles communs

## Chargement à la demande

`App.jsx` charge au démarrage uniquement l'essentiel (accueil, signaler, mon arbre, profil, menu).
Ces écrans sont téléchargés à leur première ouverture (`React.lazy`) : administration, carte,
enquêtes terrain, espace organisation, groupes de terrain, événements, assistant, biodiversité,
confidentialité. Pour en ajouter un : même schéma que les lignes `const … = lazy(…)` dans `App.jsx`.
Règle à respecter : un écran chargé à la demande ne doit être importé *statiquement* que par d'autres
écrans eux-mêmes chargés à la demande, sinon il repasse dans le téléchargement initial.
