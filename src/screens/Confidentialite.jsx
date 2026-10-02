import { useState } from "react";
import { IconLogOut } from "../components/icons.jsx";
import { Screen, SectionTitle } from "../components/ui.jsx";
import { envoyerDemandeSuppression } from "../lib/audit.js";
import { supabase } from "../lib/supabase.js";

export function Confidentialite({ onBack }) {
  async function handleLogout() {
    await supabase.auth.signOut();
  }
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: "var(--c-text-secondary)", lineHeight: 1.6 }}>{children}</div>
    </div>
  );
  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <SectionTitle sub="Dernière mise à jour : 27 septembre 2026">À propos & Informations légales</SectionTitle>

      <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer", marginBottom: 18 }}>
        <IconLogOut size={15} /> Se déconnecter de mon compte
      </button>

      <Section title="À propos d'EcoVigil">
        EcoVigil est une application citoyenne pour l'environnement en Afrique — observer, signaler et protéger, au service de la Plateforme Africaine d'Actions et de Contrôle Environnemental.<br/><br/>
        Conçu par Mansa Diallo.
      </Section>

      <Section title="Responsable du traitement">
        EcoVigil — Plateforme Africaine d'Actions et de Contrôle Environnemental — Conakry, Guinée.<br/>Contact : wassolonmansa97@gmail.com
      </Section>

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 4, marginTop: 4 }}>Politique de confidentialité</div>

      <Section title="Données collectées">
        Selon ta façon d'utiliser EcoVigil :<br/><br/>
        <b>En tant que citoyen</b> (identifiant anonyme propre à ton appareil, sans lien avec ton identité civile) : signalements (catégorie, urgence, description, photo, position GPS) ; arbres plantés et observations de biodiversité (espèce, photo, position) ; publications communautaires.<br/><br/>
        <b>En tant que bénévole ou organisation</b> (compte identifié — nom, adresse e-mail, mot de passe, et pour une organisation ses informations d'inscription) : les mêmes contributions que ci-dessus, ainsi que les dossiers d'enquête environnementale que tu crées ou modifies (identification, localisation précise, description du constat, niveau de gravité, impacts évalués, personnes ou structures mentionnées) et les preuves associées (photo, vidéo, document, témoignage écrit, relevé GPS), horodatées et géolocalisées.<br/><br/>
        Dans tous les cas : les brouillons non encore envoyés (enquêtes, signalements) peuvent être conservés temporairement sur ton appareil le temps de retrouver une connexion, avant d'être transmis à nos serveurs.
      </Section>

      <Section title="Pourquoi">
        Faire fonctionner la carte communautaire, calculer tes statistiques et badges, permettre l'instruction et le suivi des dossiers d'enquête, assurer la modération, prévenir les abus. Aucune donnée n'est utilisée à des fins publicitaires ni vendue à un tiers.
      </Section>

      <Section title="Ce qui est public">
        Les signalements validés, les arbres, observations et publications sont visibles par tous les utilisateurs de l'app. Les dossiers d'enquête, une fois terminés et vérifiés par l'équipe EcoVigil, apparaissent sur la carte avec leur catégorie et leur niveau de gravité — sans jamais révéler l'identité de l'enquêteur, les preuves détaillées ou les personnes mentionnées dans le dossier. Les inscriptions bénévoles et les dossiers en cours restent réservés à l'organisation concernée et à l'équipe d'administration.
      </Section>

      <Section title="Prestataires techniques">
        Supabase (hébergement UE), OpenStreetMap/Esri (fonds de carte), Open-Meteo (météo locale), GitHub Pages (hébergement web).
      </Section>

      <Section title="Sécurité">
        Connexions chiffrées (HTTPS), accès aux données restreint par appareil, par rôle et par organisation, mots de passe chiffrés, limites automatiques contre les abus. Toute suppression d'un dossier d'enquête est tracée (auteur, date), et sa restauration réservée à l'équipe EcoVigil.
      </Section>

      <Section title="Tes droits">
        Pour toute demande d'accès ou de rectification concernant tes données ou une contribution, écris-nous à wassolonmansa97@gmail.com en précisant la date, le lieu et le contenu concerné.
      </Section>

      <Section title="Supprimer mes données">
        Tu peux demander la suppression de toutes les données associées à ton appareil (signalements, arbres, observations, publications). Cette demande est traitée sous 30 jours maximum. Pour un compte bénévole ou organisation, écris-nous à l'adresse ci-dessus.
      </Section>
      <SuppressionDonneesCitoyen />

      <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 4 }}>
        Document complet disponible sur demande auprès du responsable du traitement.
      </div>
    </Screen>
  );
}

function SuppressionDonneesCitoyen() {
  const [step, setStep] = useState("idle"); // idle | confirm | sent
  async function envoyerDemande() {
    await envoyerDemandeSuppression();
    setStep("sent");
  }
  if (step === "sent") {
    return (
      <div style={{ background: "var(--c-surface-soft)", borderRadius: 12, padding: 14, fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 18 }}>
        {navigator.onLine
          ? "Ta demande a été enregistrée. Tes données seront supprimées sous 30 jours."
          : "Ta demande a été mise en attente sur l'appareil (pas de connexion) et sera envoyée automatiquement dès le retour du réseau. Le délai de 30 jours démarrera à ce moment-là."}
      </div>
    );
  }
  if (step === "confirm") {
    return (
      <div style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 12, padding: 14, marginBottom: 18 }}>
        <div style={{ fontSize: 12.5, color: "var(--c-warning-text)", lineHeight: 1.5, marginBottom: 10 }}>
          Toutes les données liées à cet appareil seront définitivement supprimées sous 30 jours. Confirmer ?
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setStep("idle")} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Annuler</button>
          <button onClick={envoyerDemande} style={{ flex: 1, padding: "9px 0", borderRadius: 8, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Confirmer</button>
        </div>
      </div>
    );
  }
  return (
    <button onClick={() => setStep("confirm")} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "1px solid #B5451B", background: "none", color: "#B5451B", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 18 }}>
      Demander la suppression de mes données
    </button>
  );
}
