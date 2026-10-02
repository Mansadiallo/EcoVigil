import { useEffect, useMemo, useRef, useState } from "react";
import { IconSend, IconSparkles } from "../components/icons.jsx";
import { Screen, SectionTitle } from "../components/ui.jsx";
import { categorieMeta } from "../lib/categories.jsx";
import { co2EstimeParArbre } from "../lib/utils.js";

const ASSISTANT_KB = [
  { id: "dechets", keywords: ["déchet", "dechets", "recycl", "tri", "plastique", "poubelle", "ordure", "compost"],
    reply: "Pour le tri des déchets : sépare au minimum le plastique/métal, le papier/carton, et les déchets organiques (compostables). Les déchets organiques peuvent devenir du compost pour tes cultures ou ton jardin en 2 à 3 mois. Pour le plastique, vérifie s'il existe un point de collecte ou un recycleur près de chez toi — signale une décharge sauvage directement depuis l'onglet \"Signaler\" de l'app, avec une photo et la localisation." },
  { id: "arbres", keywords: ["arbre", "reboisement", "planter", "plantation", "pépinière", "pepiniere", "essence", "espèces d'arbres"],
    reply: "Pour bien planter un arbre : choisis une espèce locale adaptée au climat de ta région (elle demande moins d'eau et s'intègre mieux à l'écosystème), creuse un trou deux fois plus large que la motte, arrose abondamment les 2 premières semaines puis régulièrement les 3 premiers mois. Utilise l'onglet \"Mon Arbre\" pour enregistrer ta plantation avec une photo et sa position GPS — ça compte aussi dans le calcul de CO₂ absorbé par la communauté." },
  { id: "biodiversite", keywords: ["biodiversité", "biodiversite", "animal", "oiseau", "insecte", "faune", "espèce", "identifier"],
    reply: "Je ne peux pas analyser de photo dans ce mode simplifié (sans IA), mais tu peux quand même enregistrer ton observation dans l'onglet \"Biodiversité\" avec une photo et une description — ça reste utile pour construire la base de données écologique locale. Pour une identification précise, décris la taille, la couleur, l'habitat et le comportement de l'espèce observée, ça aide déjà beaucoup." },
  { id: "climat", keywords: ["climat", "réchauffement", "rechauffement", "sécheresse", "secheresse", "chaleur", "pluie", "co2", "carbone"],
    reply: "Le réchauffement climatique en Afrique se traduit surtout par des sécheresses plus fréquentes, des pluies plus irrégulières et intenses, et une pression accrue sur les ressources en eau. Les gestes qui comptent à l'échelle individuelle : planter des arbres locaux, réduire les déchets brûlés à l'air libre, et économiser l'eau. Chaque arbre enregistré dans l'app contribue à l'estimation collective de CO₂ absorbé, visible sur ton profil." },
  { id: "signalement", keywords: ["signal", "pollution", "décharge", "decharge", "problème", "probleme"],
    reply: "Pour signaler un problème environnemental (décharge sauvage, pollution, arbre coupé illégalement...), utilise l'onglet \"Signaler\" : prends une photo, précise la catégorie et l'urgence, ta position GPS est enregistrée automatiquement. Un administrateur EcoVigil examine chaque signalement." },
  { id: "salutation", keywords: ["bonjour", "salut", "bonsoir", "bjr", "cc", "hello"],
    reply: "Bonjour ! Je peux te renseigner sur le tri des déchets, le reboisement, la biodiversité ou le climat. Pose-moi une question sur l'un de ces sujets." },
  { id: "merci", keywords: ["merci", "ok merci", "d'accord merci"],
    reply: "Avec plaisir ! N'hésite pas si tu as d'autres questions." },
  { id: "stats", keywords: ["statistique", "statistiques", "combien", "chiffre", "chiffres", "total"], dynamic: "stats" },
  { id: "impact", keywords: ["mon impact", "ma progression", "mes arbres plantés", "mes signalements"], dynamic: "impact" },
  { id: "especes", keywords: ["quelle espèce", "quelles espèces", "espèce plantée", "arbre le plus planté"], dynamic: "especes" },
  { id: "categorie", keywords: ["type de signalement", "problème le plus", "probleme le plus", "catégorie de signalement"], dynamic: "categorieTop" },
  { id: "actus", keywords: ["actualité", "actualités", "actu", "actus", "quoi de neuf"], dynamic: "actualites" },
];

const ASSISTANT_FALLBACK = "Je fonctionne en mode simplifié (sans connexion à une IA) et je ne comprends que quelques grands sujets : déchets et recyclage, reboisement, biodiversité, climat, et signalement de problèmes. Essaie de reformuler avec l'un de ces mots-clés, ou utilise directement les onglets \"Signaler\", \"Mon Arbre\" ou \"Biodiversité\" de l'app.";

function findAssistantReply(text, paceStats) {
  const lower = (text || "").toLowerCase();
  const match = ASSISTANT_KB.find(k => k.keywords.some(kw => lower.includes(kw)));
  if (!match) return ASSISTANT_FALLBACK;
  if (match.dynamic) return paceStats[match.dynamic] || ASSISTANT_FALLBACK;
  return match.reply;
}

function buildPaceStatsReplies(signalements, arbres, observations, actualites) {
  const sig = signalements || [];
  const arb = arbres || [];
  const obs = observations || [];
  const news = actualites || [];

  const resolus = sig.filter(s => s.statut === "resolu").length;
  const enAttente = sig.length - resolus;
  const co2 = arb.reduce((sum, a) => sum + co2EstimeParArbre(a), 0);
  const espacesCount = {};
  arb.forEach(a => { if (a.nom) espacesCount[a.nom] = (espacesCount[a.nom] || 0) + 1; });
  const especeTop = Object.entries(espacesCount).sort((a, b) => b[1] - a[1])[0];
  const categorieCount = {};
  sig.forEach(s => { if (s.categorie) categorieCount[s.categorie] = (categorieCount[s.categorie] || 0) + 1; });
  const categorieTop = Object.entries(categorieCount).sort((a, b) => b[1] - a[1])[0];
  const categorieTopLabel = categorieTop ? categorieMeta(categorieTop[0]).label : null;

  return {
    stats: `Sur EcoVigil en ce moment : ${sig.length} signalement${sig.length > 1 ? "s" : ""} (${resolus} résolu${resolus > 1 ? "s" : ""}, ${enAttente} en attente), ${arb.length} arbre${arb.length > 1 ? "s" : ""} planté${arb.length > 1 ? "s" : ""} (environ ${co2} kg de CO₂ absorbé, estimation), et ${obs.length} observation${obs.length > 1 ? "s" : ""} de biodiversité enregistrée${obs.length > 1 ? "s" : ""}.`,
    impact: `Ton impact sur EcoVigil : ${arb.length} arbre${arb.length > 1 ? "s" : ""} planté${arb.length > 1 ? "s" : ""} (environ ${co2} kg de CO₂ absorbé, estimation) et ${sig.length} signalement${sig.length > 1 ? "s" : ""} envoyé${sig.length > 1 ? "s" : ""}. Continue à planter des arbres et signaler des problèmes pour faire grandir cet impact.`,
    especes: especeTop ? `L'espèce d'arbre la plus plantée sur EcoVigil actuellement est "${especeTop[0]}" (${especeTop[1]} plantation${especeTop[1] > 1 ? "s" : ""} enregistrée${especeTop[1] > 1 ? "s" : ""}).` : "Aucun arbre n'a encore été enregistré sur l'app pour le moment.",
    categorieTop: categorieTopLabel ? `Le type de signalement le plus fréquent en ce moment est : "${categorieTopLabel}" (${categorieTop[1]} signalement${categorieTop[1] > 1 ? "s" : ""}).` : "Aucun signalement n'a encore été enregistré sur l'app.",
    actualites: news.length ? `Dernière actualité EcoVigil : "${news[0].titre || news[0].contenu || ""}".` : "Aucune actualité n'est publiée pour le moment — consulte l'onglet Actualités régulièrement.",
  };
}

export function AssistantIA({ onBack, signalements, arbres, observations, actualites }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Bonjour ! Je suis l'assistant environnemental d'EcoVigil (mode simplifié, sans IA). Pose-moi une question sur le tri des déchets, le reboisement, la biodiversité, le climat, ou sur les chiffres de l'app (statistiques, ton impact, les actualités)." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const endRef = useRef(null);

  const paceStats = useMemo(
    () => buildPaceStatsReplies(signalements, arbres, observations, actualites),
    [signalements, arbres, observations, actualites]
  );

  useEffect(() => { endRef.current && endRef.current.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  function send() {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, { role: "user", text: userText }]);
    setInput("");
    setBusy(true);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "assistant", text: findAssistantReply(userText, paceStats) }]);
      setBusy(false);
    }, 400);
  }

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconSparkles size={17} color="var(--c-accent)" /></div>
        <SectionTitle sub="Mode simplifié, sans IA — réponses par mots-clés.">Assistant de Décisions Environnementales</SectionTitle>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              maxWidth: "82%", padding: "10px 13px", borderRadius: 14,
              background: m.role === "user" ? "var(--c-accent-dark)" : "var(--c-surface)",
              color: m.role === "user" ? "#fff" : "var(--c-text)",
              border: m.role === "user" ? "none" : "1px solid var(--c-border)", fontSize: 13, lineHeight: 1.5 }}>
              {m.text}
            </div>
          </div>
        ))}
        {busy && (
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 13px", borderRadius: 14, background: "var(--c-surface)", border: "1px solid var(--c-border)", fontSize: 13, color: "var(--c-text-muted)" }}>
              …
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div style={{ position: "sticky", bottom: 8, background: "var(--c-surface)", borderRadius: 14, padding: 10, border: "1px solid var(--c-border)" }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
          <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="Pose ta question…" rows={1}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            style={{ flex: 1, border: "none", outline: "none", resize: "none", fontSize: 13, fontFamily: "Work Sans, sans-serif", maxHeight: 80 }} />
          <button onClick={send} disabled={busy || !input.trim()} style={{
            background: (busy || !input.trim()) ? "var(--c-text-faint)" : "var(--c-accent-dark)", border: "none", borderRadius: "50%",
            width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}>
            <IconSend size={14} color="#fff" />
          </button>
        </div>
      </div>
    </Screen>
  );
}
