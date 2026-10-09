# EcoVigil — Design System (MASTER)

> Source de vérité du design d'EcoVigil, au format « Master + Overrides » de UI UX Pro Max.
> Établi en suivant la méthode du dépôt `nextlevelbuilder/ui-ux-pro-max-skill` (pattern, style, couleurs, typographie, effets, anti-patterns, checklist). Ce n'est pas une sortie de son moteur de recherche.
> Pour une page précise, créer `pages/<nom>.md` : ses règles priment sur ce fichier.

## Produit

- **Type** : plateforme de signalement et de modération environnementale (Centre EcoVigil : équipe de modération, Super administrateur).
- **Ton** : sérieux, institutionnel, fiable.
- **Appareils** : téléphone et ordinateur (responsive obligatoire).
- **Modes** : clair et sombre.

## Pattern (structure)

- **Application de gestion** (pas de page marketing) : navigation fixe + zone de contenu.
- Téléphone : barre de navigation en bas. Ordinateur : menu latéral (240 px), contenu centré (max 1100 px).
- Écran de connexion : une seule carte centrée (`.ev-card--auth`), un seul bouton principal, lien « Mot de passe oublié ? » visible.

## Style

- **Minimalisme fonctionnel** : surfaces unies, bordures fines, ombres légères, coins de 8 px.
- Priorité à la lisibilité des données (tableaux, statuts, listes de signalements).
- Les couleurs servent le sens (statuts), jamais la décoration.

## Couleurs

| Rôle | Clair | Sombre |
|---|---|---|
| Principale (vert forêt) | `#1F5C45` | `#4FB58A` |
| Accent (bleu ardoise) | `#2F5D7C` | `#7FB0D1` |
| Fond | `#F7F9F8` | `#0F1715` |
| Cartes | `#FFFFFF` | `#17221F` |
| Texte | `#14201C` | `#E6EEEB` |
| Texte secondaire | `#5B6B65` | `#9DB0A9` |
| Bordures | `#DDE5E1` | `#26352F` |
| Succès | `#2E7D32` | `#66BB6A` |
| Alerte | `#9A5A00` | `#FFB74D` |
| Erreur | `#B3261E` | `#F2796F` |
| Texte sur Erreur (bouton danger) | `#FFFFFF` | `#0B1511` |
| Bordure de champ (≥ 3:1) | `#76867F` | `#667C73` |

Implémentation : `ecovigil-theme.css` (variables `--ev-*`).

## Typographie

- **Inter** (repli : police système), une seule famille.
- Interligne 1,55. Titres en 600, texte en 400.
- Échelle (`T` dans `typo.jsx`), rien en dessous de 12 px : meta 12 (dates, légendes), small 13 (texte d'appoint), body 14 (listes, tableaux, boutons, libellés : interface dense), field 16 (champs, évite le zoom iPhone), sub 16, title 18, display 22.
- Le texte de lecture continue (paragraphes, aide, conditions) reste à 16 px, ainsi que le `body` de la page (`ecovigil-theme.css`).
- Le texte doit rester lisible agrandi : unités relatives pour le texte long, aucun texte coupé à 200 %.
- Longueur de ligne ≤ 70 caractères pour les paragraphes.
- Import (facultatif) : Google Fonts, famille Inter 400/600.

## Effets et mouvement

- Transitions courtes (150 ms) uniquement sur les boutons et le focus.
- Aucune animation d'entrée décorative. Seule exception : l'écran d'accueil (cinq pages de message puis logo dessiné, 11 s maximum, au plus une fois toutes les 24 h, fermable d'un toucher, absent avec `prefers-reduced-motion`) : il masque le chargement et ne retarde jamais l'app.
- `prefers-reduced-motion` respecté (animations désactivées).

## Composants

- **Boutons** : hauteur ≥ 44 px, un seul bouton principal par écran, libellé = action (« Se connecter », « Valider le signalement »).
- **Champs** : 16 px minimum (évite le zoom sur iPhone), étiquette visible, erreur sous le champ, bordure `--ev-border-strong` (contraste ≥ 3:1).
- **Cases à cocher / boutons radio** : classe `.ev-check`, zone tactile ≥ 44 px, contrôle de 20 px.
- **Messages** : gravité indiquée par un libellé ou une icône SVG, pas seulement par la couleur.
- **Statuts** : badge avec texte + couleur (jamais la couleur seule).
- **Tableaux** : défilement horizontal sur petit écran (`min-width` du tableau, conteneur `tabindex="0"` avec `aria-label`).
- **Icônes** : SVG (Lucide ou Heroicons), jamais d'emojis.

## Textes d'interface

- Phrases courtes, verbes d'action, vocabulaire simple.
- Messages d'erreur : dire ce qui s'est passé et comment corriger (ex. « E-mail ou mot de passe incorrect. Vérifiez-les ou utilisez « Mot de passe oublié ? » »).

## Anti-patterns à éviter

- Couleurs néon, dégradés violet/rose « IA ».
- Glassmorphism ou effets de flou sur les écrans de modération.
- Animations brusques ou décoratives.
- Emojis comme icônes.
- Sens porté par la couleur seule.
- Texte tronqué sans moyen d'accéder à la valeur complète.

## Checklist avant livraison

- [ ] Aucune icône en emoji (SVG uniquement)
- [ ] `cursor: pointer` sur tous les éléments cliquables
- [ ] Contraste du texte ≥ 4,5:1 en mode clair **et** sombre (y compris sur les boutons et badges de statut)
- [ ] Contraste des bordures de champs ≥ 3:1
- [ ] Focus clavier visible
- [ ] `prefers-reduced-motion` respecté
- [ ] Zones tactiles ≥ 44 px
- [ ] Le texte se réorganise sans être coupé (étroit, zoom, texte agrandi)
- [ ] Testé à 375 px, 768 px, 1024 px et 1440 px
- [ ] Connexion testée sur téléphone **et** ordinateur
