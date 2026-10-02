import { IconAlert, IconCalendar, IconCheck, IconClock, IconDownload, IconLayers, IconLock, IconNewspaper, IconSearch, IconShield, IconTarget, IconTree, IconUserCircle, IconUsers } from "../components/icons.jsx";

// Nombre maximal de tentatives de connexion échouées avant verrouillage temporaire côté client,
// et durée du verrouillage. Ceci décourage un enchaînement rapide de tentatives locales mais ne
// remplace pas une limitation réelle côté serveur (Supabase applique déjà ses propres limites de
// débit sur /auth/v1/token, indépendantes de ce compteur).
export const ADMIN_LOGIN_MAX_TENTATIVES = 5;

export const ADMIN_LOGIN_VERROUILLAGE_MS = 60000;

// Exception explicitement demandée par le propriétaire du projet, pour ce compte uniquement :
// exempté de l'obligation d'activer la 2FA pour accéder au Centre d'EcoVigil. À retirer de cette
// liste si l'exigence de 2FA obligatoire doit s'appliquer à nouveau à cette adresse.
// Exception à l'obligation de 2FA : aucune actuellement (liste laissée vide intentionnellement,
// après retour en arrière du propriétaire du projet — voir historique de la conversation).
export const EMAILS_EXEMPTES_2FA_OBLIGATOIRE = [];

export const MOTIF_LABELS_ADMIN = { faux: "Faux signalement", doublon: "Doublon", spam: "Spam", erreur_localisation: "Erreur de localisation" };

export const AUDIT_LABELS = {
  membre_rejoint: "Nouveau membre",
  mission_creee: "Mission créée",
  mission_a_faire: "Mission repassée à faire",
  mission_en_cours: "Mission démarrée",
  mission_termine: "Mission terminée",
  reconnaissance_demandee: "Reconnaissance demandée",
  reconnaissance_approuvee: "Reconnaissance approuvée",
  reconnaissance_refusee: "Reconnaissance refusée",
  affiliation_confirmee: "Affiliation confirmée par l'organisation",
  affiliation_refusee: "Demande d'affiliation refusée par l'organisation",
  affiliation_retiree: "Affiliation retirée par l'organisation",
};

export const MOTIF_OPTIONS_ADMIN = [
  { id: "faux", label: "Faux signalement" },
  { id: "doublon", label: "Doublon" },
  { id: "spam", label: "Spam" },
  { id: "erreur_localisation", label: "Erreur de localisation" },
];

// Point 5 : ancrage institutionnel — organismes responsables pouvant être crédités d'une résolution
export const ORGANISME_OPTIONS = [
  { id: "mairie", label: "Mairie / collectivité locale" },
  { id: "service_environnement", label: "Service de l'environnement" },
  { id: "ong_partenaire", label: "ONG partenaire" },
  { id: "benevoles_pace", label: "Bénévoles EcoVigil" },
  { id: "autre", label: "Autre organisme" },
];

export const ORGANISME_LABELS = Object.fromEntries(ORGANISME_OPTIONS.map(o => [o.id, o.label]));

// Regroupement des 14 panneaux du Centre d'EcoVigil en 4 catégories thématiques, pour une
// navigation à deux niveaux plus lisible qu'une seule rangée de 14 pastilles (hiérarchie de
// l'information, réduction de la charge cognitive — cf. réorganisation UI/UX du panneau admin).
export const CATEGORIES_ADMIN = [
  { id: "terrain", label: "Terrain", icon: IconAlert, panels: [
    ["signalements", "Signalements", IconAlert], ["arbres", "Arbres", IconTree], ["abus", "Abus/doublons", IconAlert],
    ["enquetes", "Enquêtes", IconSearch],
  ] },
  { id: "communaute", label: "Communauté", icon: IconUsers, panels: [
    ["benevoles", "Bénévoles", IconUsers], ["organisations", "Organisations", IconShield],
    ["publications", "Vérification", IconCheck], ["connexions", "Connexions", IconTarget],
  ] },
  { id: "contenu", label: "Contenu", icon: IconNewspaper, panels: [
    ["actualites", "Actualités", IconNewspaper], ["evenements", "Événements", IconCalendar], ["contenu_env", "Taxonomie", IconLayers],
  ] },
  { id: "systeme", label: "Système", icon: IconLock, panels: [
    ["historique", "Historique", IconClock], ["securite", "Sécurité", IconShield],
    ["rapports", "Rapports", IconDownload], ["suppressions", "Suppressions", IconUserCircle],
  ] },
];

export function categorieDuPanel(panelId) {
  const cat = CATEGORIES_ADMIN.find(c => c.panels.some(([id]) => id === panelId));
  return cat ? cat.id : CATEGORIES_ADMIN[0].id;
}
