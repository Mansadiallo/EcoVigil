import React from "react";

// ===== Typographie commune à tous les écrans EcoVigil =====
// Titres : Fraunces (serif à empattement doux). Texte, boutons et champs : Work Sans.
// Échelle volontairement courte — rien en dessous de 12 px :
//   meta 12    infos secondaires (dates, légendes, pastilles)
//   small 13   texte d'appoint, explications, petits boutons
//   body 14    texte courant, boutons, libellés
//   field 16   champs de saisie (évite le zoom automatique de Safari sur iPhone)
//   sub 16     sous-titres de section
//   title 18   titres de section
//   display 22 grands titres (nom du profil, écrans de confirmation)
export const FONT_TITRE = '"Fraunces", Georgia, "Times New Roman", serif';
export const FONT_TEXTE = '"Work Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
export const T = { meta: 12, small: 13, body: 14, field: 16, sub: 16, title: 18, display: 22 };

// Le poids (fontWeight) et la couleur restent à définir à l'endroit où le style est utilisé.
export const TITRE_SOUS = { fontFamily: FONT_TITRE, fontSize: T.sub, letterSpacing: "-0.005em", lineHeight: 1.3 };
export const TITRE_SECTION = { fontFamily: FONT_TITRE, fontSize: T.title, letterSpacing: "-0.01em", lineHeight: 1.25 };
export const TITRE_GRAND = { fontFamily: FONT_TITRE, fontSize: T.display, letterSpacing: "-0.015em", lineHeight: 1.2 };

// Boutons, champs et listes n'héritent pas de la police du navigateur par défaut : on le force
// pour que tout l'écran parle la même langue typographique.
const CSS_TYPO = `
[data-typo] { font-family: ${FONT_TEXTE}; line-height: 1.45; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
[data-typo] button, [data-typo] input, [data-typo] select, [data-typo] textarea { font-family: inherit; }
[data-typo] input::placeholder, [data-typo] textarea::placeholder { font-family: inherit; opacity: .7; }
`;

// À placer autour du contenu d'un écran. N'ajoute aucune boîte à la mise en page (display: contents).
export function TypoScope({ children }) {
  return (
    <>
      <style>{CSS_TYPO}</style>
      <div data-typo style={{ display: "contents" }}>{children}</div>
    </>
  );
}
