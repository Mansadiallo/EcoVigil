// ===== Typographie commune à toute l'application EcoVigil (MASTER : Inter seule) =====
// Une seule famille (Inter, repli police système), définie par --ev-font dans ecovigil-theme.css.
// Titres en 600, texte en 400. Échelle volontairement courte — rien en dessous de 12 px :
//   meta 12    infos secondaires (dates, légendes, pastilles)
//   small 13   texte d'appoint, explications, petits boutons
//   body 14    texte courant, boutons, libellés
//   field 16   champs de saisie (évite le zoom automatique de Safari sur iPhone)
//   sub 16     sous-titres de section
//   title 18   titres de section
//   display 22 grands titres (titre d'écran, nom du profil, confirmations)
const STACK = '"Inter", system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
export const FONT_TITRE = `var(--ev-font, ${STACK})`;
export const FONT_TEXTE = `var(--ev-font, ${STACK})`;
export const T = { meta: 12, small: 13, body: 14, field: 16, sub: 16, title: 18, display: 22 };

// La couleur reste à définir à l'endroit où le style est utilisé (var(--ev-text) par défaut).
export const TITRE_SOUS = { fontFamily: FONT_TITRE, fontSize: T.sub, fontWeight: 600, lineHeight: 1.3 };
export const TITRE_SECTION = { fontFamily: FONT_TITRE, fontSize: T.title, fontWeight: 600, lineHeight: 1.25 };
export const TITRE_GRAND = { fontFamily: FONT_TITRE, fontSize: T.display, fontWeight: 600, lineHeight: 1.2 };

// Règles globales, installées une seule fois à l'import de ce fichier. Boutons, champs et listes
// n'héritent pas de la police du navigateur par défaut : on le force pour que tout l'écran
// (modales, menus, popups de la carte compris) parle la même langue typographique.
const CSS_TYPO = `
body { font-family: ${FONT_TEXTE}; line-height: 1.55; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
button, input, select, textarea { font-family: inherit; }
input::placeholder, textarea::placeholder { font-family: inherit; }
.leaflet-container, .leaflet-container a, .leaflet-popup-content { font-family: inherit; }
`;
if (typeof document !== "undefined" && !document.getElementById("pace-typo")) {
  const el = document.createElement("style");
  el.id = "pace-typo";
  el.textContent = CSS_TYPO;
  document.head.appendChild(el);
}
