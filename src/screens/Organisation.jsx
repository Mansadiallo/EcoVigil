import { useEffect, useMemo, useState } from "react";
import { VerifFileInput } from "../components/VerifFileInput.jsx";
import { PasswordInput } from "../components/PasswordInput.jsx";
import { IconAlert, IconCheck, IconClock, IconEdit, IconShield } from "../components/icons.jsx";
import { champTexte } from "../lib/categories.jsx";
import { persistSession, supabase, urlRedirectionAuth } from "../lib/supabase.js";
import { ProfilEditeur, ProfilGate } from "./Profil.jsx";
import { T, TITRE_SOUS, TITRE_SECTION } from "../lib/typo.jsx";

const VERIF_DOC_TYPE_AGREMENT = "Récépissé / agrément officiel";

const VERIF_DOC_TYPE_STATUTS = "Statuts / enregistrement légal";

const VERIF_DOC_TYPE_IDENTITE = "Pièce d'identité du responsable";

// Statuts fins du dossier d'admission (section 7 du cahier des charges).
// "statut" (en_attente/valide/suspendu/bloque/rejete) reste le seul verrou
// d'accès aux fonctionnalités ; ceci ne fait qu'enrichir le message affiché.
export const ETAPE_DOSSIER_INFO = {
  en_attente_verification: { label: "Dossier en attente de vérification", couleur: "var(--c-warning)",
    texte: "Votre dossier a été transmis avec succès et est actuellement en attente de vérification par l'équipe EcoVigil." },
  en_cours_verification: { label: "Dossier en cours de vérification", couleur: "var(--c-warning)",
    texte: "L'équipe EcoVigil examine actuellement votre dossier et les documents fournis." },
  informations_a_completer: { label: "Informations à compléter", couleur: "#E3A73B",
    texte: "Des informations manquent pour poursuivre l'examen de votre dossier. Contactez l'équipe EcoVigil pour savoir lesquelles." },
  document_non_conforme: { label: "Document non conforme", couleur: "#B5451B",
    texte: "Un ou plusieurs documents fournis ne sont pas conformes. Contactez l'équipe EcoVigil pour les corriger." },
  agrement_invalide: { label: "Agrément invalide", couleur: "#B5451B",
    texte: "L'agrément fourni n'a pas pu être validé par l'équipe EcoVigil." },
  agrement_expire: { label: "Agrément expiré", couleur: "#B5451B",
    texte: "L'agrément fourni est expiré. Contactez l'équipe EcoVigil pour régulariser votre dossier." },
  valide: { label: "Organisation vérifiée", couleur: "var(--c-accent)",
    texte: "Ce statut reflète les éléments vérifiés par l'équipe EcoVigil sur la base des documents et informations soumis. Il ne constitue pas un agrément délivré par EcoVigil." },
  refuse: { label: "Dossier refusé", couleur: "var(--c-text-muted)",
    texte: "Cette demande n'a pas été retenue par l'équipe EcoVigil. Contactez l'équipe si vous pensez qu'il s'agit d'une erreur." },
};

export function OrganisationCard({ lang, organisationStatut, organisationEtapeDossier, organisationEtapeMotif, profilInfo, onProfilChange }) {
  // Lien WhatsApp pré-rempli (option B) : ?membre_code=XXXX ouvre directement l'écran de
  // jonction par code, code déjà renseigné.
  const codeMembrePrefill = useMemo(() => {
    try { return new URLSearchParams(window.location.search).get("membre_code") || ""; } catch (e) { return ""; }
  }, []);
  const [mode, setMode] = useState(codeMembrePrefill ? "membre" : "choix"); // choix | inscription | recapitulatif | connexion | membre | profil_requis
  const [showEditProfil, setShowEditProfil] = useState(false);
  const [type, setType] = useState("ong");
  const [typeOng, setTypeOng] = useState("nationale");
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pays, setPays] = useState("");
  const [ville, setVille] = useState("");
  const [description, setDescription] = useState("");

  const [numeroAgrement, setNumeroAgrement] = useState("");
  const [dateDelivranceAgrement, setDateDelivranceAgrement] = useState("");
  const [dateExpirationAgrement, setDateExpirationAgrement] = useState("");
  const [autoriteDelivrance, setAutoriteDelivrance] = useState("");
  const [docAgrementUrl, setDocAgrementUrl] = useState(null);
  const [docStatutsUrl, setDocStatutsUrl] = useState(null);
  const [docIdentiteUrl, setDocIdentiteUrl] = useState(null);
  const [representantNom, setRepresentantNom] = useState("");
  const [representantFonction, setRepresentantFonction] = useState("");

  const [adresseOfficielle, setAdresseOfficielle] = useState("");
  const [telephoneOfficiel, setTelephoneOfficiel] = useState("");
  const [emailProfessionnel, setEmailProfessionnel] = useState("");
  const [siteWeb, setSiteWeb] = useState("");

  const [codeInscription, setCodeInscription] = useState("");
  const [defisChoisis, setDefisChoisis] = useState([]);
  const [defisDisponibles, setDefisDisponibles] = useState([]);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [done, setDone] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErreur, setLoginErreur] = useState("");
  const [loginBusy, setLoginBusy] = useState(false);
  const [oublieBusy, setOublieBusy] = useState(false);
  const [oublieMessage, setOublieMessage] = useState("");

  // Rejoindre une organisation avec un code d'invitation (option A) — reçu à la main, ou via
  // un lien WhatsApp pré-rempli du type ?membre_code=XXXX (option B, cf. codeMembrePrefill
  // ci-dessus). Utilise une session Supabase anonyme comme identité stable (auth.uid()) :
  // ni e-mail, ni téléphone, ni SMS.
  const [codeMembre, setCodeMembre] = useState(codeMembrePrefill);
  const [membreBusy, setMembreBusy] = useState(false);
  const [membreErreur, setMembreErreur] = useState("");
  const [membreRejoint, setMembreRejoint] = useState(null); // nom de l'organisation rejointe

  async function rejoindreParCode(e) {
    if (e && e.preventDefault) e.preventDefault();
    setMembreErreur("");
    const code = codeMembre.trim();
    if (!code) { setMembreErreur("Saisis le code d'invitation reçu."); return; }
    setMembreBusy(true);
    let session = (await supabase.auth.getSession()).data.session;
    if (!session) {
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) { setMembreBusy(false); setMembreErreur("Connexion impossible pour le moment."); return; }
      session = data.session;
    }
    const { data: res, error } = await supabase.rpc("org_membre_rejoindre", { p_code: code });
    setMembreBusy(false);
    if (error) {
      const msg = error.message || "";
      setMembreErreur(
        /code_invalide/.test(msg) ? "Ce code d'invitation est invalide." :
        /code_deja_utilise/.test(msg) ? "Ce code a déjà été utilisé sur un autre appareil." :
        "Impossible de valider ce code pour le moment."
      );
      return;
    }
    setMembreRejoint((res && res[0] && res[0].organisation_nom) || "l'organisation");
    // Force une nouvelle notification de session (même contenu, nouvelle référence) pour que
    // l'écran d'accueil, qui écoute les changements de session, relise immédiatement
    // l'appartenance à l'organisation — sans quoi il faudrait recharger la page.
    persistSession({ ...session });
  }
  useEffect(() => {
    if (codeMembrePrefill && codeMembrePrefill.trim()) { rejoindreParCode(); }
  }, []);

  useEffect(() => {
    supabase.from("env_defis").select("id, nom").eq("statut", "publie").order("ordre", { ascending: true })
      .then(({ data }) => setDefisDisponibles(data || []));
  }, []);

  function toggleDefi(id) {
    setDefisChoisis(prev => prev.includes(id) ? prev.filter(d => d !== id) : [...prev, id]);
  }

  // Contrôles obligatoires (section 12) : appliqués avant le récapitulatif ET avant
  // la soumission finale — un champ rempli n'est jamais considéré valide par défaut.
  function validerDossier() {
    if (!nom.trim()) return "Le nom officiel de l'organisation est requis.";
    if (type === "ong") {
      if (!numeroAgrement.trim()) return "Le numéro de l'agrément ou de l'acte légal est requis.";
      if (!dateDelivranceAgrement) return "La date de délivrance de l'agrément est requise.";
      if (!autoriteDelivrance.trim()) return "L'autorité ayant délivré l'agrément ou l'acte légal est requise.";
      if (!docAgrementUrl) return "Le document de l'acte d'agrément (ou document légal) est obligatoire.";
      if (!docStatutsUrl) return "Le document des statuts de l'organisation est obligatoire.";
      if (!representantNom.trim() || !representantFonction.trim()) return "L'identité et la fonction du représentant légal sont requises.";
    }
    if (defisChoisis.length === 0) return "Choisis au moins un domaine d'activité.";
    if (!adresseOfficielle.trim() || !telephoneOfficiel.trim() || !emailProfessionnel.trim()) return "L'adresse, le téléphone et l'e-mail professionnel officiels sont requis.";
    if (!emailProfessionnel.includes("@")) return "L'e-mail professionnel indiqué n'est pas valide.";
    if (!codeInscription.trim()) return "Le code d'inscription des bénévoles est requis (ex : sigle de l'organisation + un numéro, comme \"ECO01\").";
    if (!email.trim() || !email.includes("@")) return "Adresse e-mail de connexion invalide.";
    if (!password || password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
    if (password !== confirmPassword) return "Les deux mots de passe ne correspondent pas.";
    return null;
  }

  function allerAuRecapitulatif(e) {
    if (e && e.preventDefault) e.preventDefault();
    const err = validerDossier();
    if (err) { setErreur(err); return; }
    setErreur("");
    setMode("recapitulatif");
  }

  async function soumettre() {
    const err = validerDossier();
    if (err) { setErreur(err); setMode("inscription"); return; }
    setErreur("");
    setBusy(true);
    // Vérification préalable du code AVANT toute tentative de création de compte : GoTrue ne
    // renvoie pas le message précis d'une exception levée par le déclencheur (juste un "Database
    // error saving new user" générique), donc on préfère détecter un code déjà pris ici, avec un
    // message clair, plutôt que de laisser échouer l'inscription pour s'en apercevoir après coup.
    const { data: dispo, error: errCode } = await supabase.rpc("organisation_code_disponible", { p_code: codeInscription.trim() });
    if (errCode) { setBusy(false); setErreur("Impossible de vérifier le code pour le moment. Vérifie ta connexion et réessaie."); return; }
    if (dispo === false) { setBusy(false); setErreur("Ce code d'inscription est déjà utilisé par une autre organisation. Choisis-en un autre."); setMode("inscription"); return; }

    const documents = [];
    if (docAgrementUrl) documents.push({ type: VERIF_DOC_TYPE_AGREMENT, url: docAgrementUrl });
    if (docStatutsUrl) documents.push({ type: VERIF_DOC_TYPE_STATUTS, url: docStatutsUrl });
    if (docIdentiteUrl) documents.push({ type: VERIF_DOC_TYPE_IDENTITE, url: docIdentiteUrl });

    // Le compte Auth et le dossier complet ("organisations" + documents + historique) sont créés
    // dans LA MÊME opération côté serveur (déclencheur sur auth.users), qui revalide aussi les
    // champs obligatoires indépendamment de ce contrôle côté client (section 13). profil_id est
    // capturé maintenant, avant que ce signUp ne remplace la session profil active par la
    // nouvelle session du compte organisation.
    const sessionProfilActuelle = (await supabase.auth.getSession()).data.session;
    const { error: errSignUp } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { emailRedirectTo: urlRedirectionAuth(), data: {
        type_compte: "organisation", nom: nom.trim(), type, pays: pays || null, ville: ville || null,
        description: description.trim() || null, numero_agrement: numeroAgrement.trim() || null,
        code_inscription: codeInscription.trim().toUpperCase(), defis: defisChoisis,
        type_ong: type === "ong" ? typeOng : null,
        profil_id: (sessionProfilActuelle && sessionProfilActuelle.user && sessionProfilActuelle.user.id) || null,
        date_delivrance_agrement: dateDelivranceAgrement || null,
        date_expiration_agrement: dateExpirationAgrement || null,
        autorite_delivrance: autoriteDelivrance.trim() || null,
        representant_nom: representantNom.trim() || null,
        representant_fonction: representantFonction.trim() || null,
        adresse_officielle: adresseOfficielle.trim() || null,
        telephone_officiel: telephoneOfficiel.trim() || null,
        email_professionnel: emailProfessionnel.trim() || null,
        site_web: siteWeb.trim() || null,
        documents,
      } },
    });
    if (errSignUp) {
      setBusy(false);
      const msg = errSignUp.message || "";
      const dup = /duplicate|unique|code_deja_utilise/i.test(msg);
      const dejaInscrit = /already registered|already exists|user_already_exists/i.test(msg);
      setErreur(dup
        ? "Ce code d'inscription est déjà utilisé par une autre organisation. Choisis-en un autre."
        : dejaInscrit
        ? "Cette adresse e-mail est déjà associée à un compte. Connecte-toi plutôt, ou utilise une autre adresse."
        : (msg || "Impossible de soumettre le dossier d'inscription."));
      setMode("inscription");
      return;
    }

    // Filet de sécurité : le compte Auth vient d'être créé, mais le dossier "organisations"
    // dépend d'un déclencheur serveur qui peut échouer indépendamment (ex. contrainte non
    // prévue). On vérifie donc explicitement qu'il existe bien plutôt que d'afficher un
    // succès qui laisserait le dossier invisible côté admin sans que personne ne s'en aperçoive.
    const { data: dossierCree, error: errVerif } = await supabase.rpc("organisation_dossier_existe", { p_email: email.trim() });
    setBusy(false);
    if (!errVerif && dossierCree === false) {
      setErreur("Ton compte a été créé, mais le dossier n'a pas pu être enregistré. Contacte l'équipe EcoVigil avec ton adresse e-mail pour qu'elle régularise ton dossier — ne recrée pas de compte.");
      setMode("inscription");
      return;
    }
    setDone(true);
  }

  async function seConnecter(e) {
    if (e && e.preventDefault) e.preventDefault();
    setLoginErreur(""); setLoginBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail.trim(), password: loginPassword });
    setLoginBusy(false);
    if (error) { setLoginErreur("E-mail ou mot de passe incorrect."); return; }
  }

  async function motDePasseOublie(e) {
    if (e && e.preventDefault) e.preventDefault();
    setOublieMessage("");
    if (!loginEmail.trim() || !loginEmail.includes("@")) { setOublieMessage("Entre d'abord ton adresse e-mail ci-dessus."); return; }
    setOublieBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(), { redirectTo: urlRedirectionAuth() });
    setOublieBusy(false);
    setOublieMessage(error ? (error.message || "Impossible d'envoyer l'e-mail pour le moment.") : "Un e-mail de réinitialisation a été envoyé si ce compte existe.");
  }

  // Un compte existe déjà : afficher son statut, pas le formulaire d'admission.
  if (organisationStatut) {
    let info;
    if (organisationStatut === "suspendu") info = { label: "Compte suspendu", couleur: "#B5451B", texte: "Le compte de ton organisation a été suspendu par l'équipe EcoVigil. Contacte l'équipe pour plus d'informations." };
    else if (organisationStatut === "bloque") info = { label: "Compte bloqué", couleur: "#7A1F1F", texte: "Le compte de ton organisation a été bloqué par l'équipe EcoVigil. Contacte l'équipe pour plus d'informations." };
    else if (organisationStatut === "rejete") info = ETAPE_DOSSIER_INFO.refuse;
    else if (organisationStatut === "valide") info = ETAPE_DOSSIER_INFO.valide;
    else info = ETAPE_DOSSIER_INFO[organisationEtapeDossier] || ETAPE_DOSSIER_INFO.en_attente_verification;

    return (
      <div style={{ marginTop: 14, background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconShield size={17} color="var(--c-accent-dark)" />
          <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)" }}>Compte Organisation</div>
        </div>
        <div style={{ display: "inline-block", fontSize: T.meta, fontWeight: 700, color: "#fff", background: info.couleur, borderRadius: 999, padding: "3px 10px", marginBottom: 8 }}>{info.label}</div>
        <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", lineHeight: 1.5 }}>{info.texte}</div>
        {organisationEtapeMotif && organisationStatut === "en_attente" && (
          <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", lineHeight: 1.5, marginTop: 6, fontStyle: "italic" }}>{organisationEtapeMotif}</div>
        )}
      </div>
    );
  }

  const champStyle = { width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" };
  const labelStyle = { fontSize: T.meta, fontWeight: 600, color: "var(--c-text-secondary)", marginBottom: 4 };
  const sectionTitre = (n, titre) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 8px" }}>
      <span style={{ width: 20, height: 20, borderRadius: "50%", background: "var(--c-accent-dark)", color: "#fff", fontSize: T.meta, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{n}</span>
      <span style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-text)" }}>{titre}</span>
    </div>
  );

  return (
    <div style={{ marginTop: 14, background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <IconShield size={17} color="var(--c-accent-dark)" />
        <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)" }}>Compte Organisation</div>
      </div>

      {done ? (
        <div style={{ fontSize: T.body, color: "var(--c-accent)", display: "flex", alignItems: "flex-start", gap: 6, lineHeight: 1.5 }}>
          <IconCheck size={14} style={{ marginTop: 2, flexShrink: 0 }} />
          <span>Votre dossier a été transmis avec succès et est actuellement en attente de vérification. Confirme d'abord ton e-mail, puis attends la vérification par l'équipe EcoVigil.</span>
        </div>
      ) : mode === "choix" ? (
        <>
          <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", marginBottom: 10 }}>Pour une ONG ou une administration publique intervenant dans un ou plusieurs domaines environnementaux.</div>
          <button onClick={() => setMode(profilInfo ? "inscription" : "profil_requis")} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-accent-dark)", background: "var(--c-surface)", color: "var(--c-accent-dark)", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginRight: 8, marginBottom: 8 }}>Constituer un dossier</button>
          <button onClick={() => setMode("connexion")} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 8 }}>Déjà inscrit ? Se connecter</button>
          <div>
            <button onClick={() => setMode("membre")} style={{ padding: "9px 14px", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>Membre invité par une organisation ? Saisir mon code</button>
          </div>
        </>
      ) : mode === "connexion" ? (
        <form onSubmit={seConnecter}>
          <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="Adresse e-mail de l'organisation" style={champStyle} />
          <PasswordInput value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="Mot de passe"
            style={{ padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 6 }} />
          <button type="button" onClick={motDePasseOublie} disabled={oublieBusy} style={{ display: "block", marginLeft: "auto", background: "none", border: "none", color: "var(--c-accent-dark)", fontSize: T.small, fontWeight: 600, cursor: "pointer", padding: "2px 0 8px" }}>
            {oublieBusy ? "…" : "Mot de passe oublié ?"}
          </button>
          {oublieMessage && <div role="status" style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10 }}>{oublieMessage}</div>}
          {loginErreur && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 10 }}>{loginErreur}</div>}
          <button type="button" onClick={seConnecter} disabled={loginBusy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 8 }}>
            {loginBusy ? "…" : "Se connecter"}
          </button>
          <button type="button" onClick={() => setMode("choix")} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer" }}>Retour</button>
        </form>
      ) : mode === "membre" ? (
        <div>
          <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
            Si le compte principal de ton organisation t'a donné un code d'invitation (ou te l'a envoyé sur WhatsApp), saisis-le ici pour accéder à l'Espace Organisation.
          </div>
          {membreRejoint ? (
            <div style={{ fontSize: T.body, color: "var(--c-accent)", fontWeight: 600 }}>
              Tu as bien rejoint « {membreRejoint} ». L'Espace Organisation est accessible depuis l'accueil.
            </div>
          ) : (
            <form onSubmit={rejoindreParCode}>
              <input required value={codeMembre} onChange={e => setCodeMembre(e.target.value.toUpperCase())} placeholder="Code d'invitation (ex. A1B2C3D4)"
                style={{ ...champStyle, textTransform: "uppercase", letterSpacing: 1 }} />
              {membreErreur && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 10 }}>{membreErreur}</div>}
              <button type="button" onClick={rejoindreParCode} disabled={membreBusy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 8 }}>
                {membreBusy ? "…" : "Valider le code"}
              </button>
              <button type="button" onClick={() => setMode("choix")} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer" }}>Retour</button>
            </form>
          )}
        </div>
      ) : mode === "recapitulatif" ? (
        <div>
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>Vérifie les informations avant de soumettre ton dossier. Tu peux revenir en arrière pour corriger.</div>
          {[
            ["Type d'organisation", type === "ong" ? `ONG${typeOng ? " · " + ({ nationale: "nationale", etrangere: "étrangère", autre: "autre catégorie" })[typeOng] : ""}` : "Gouvernement"],
            ["Nom officiel", nom],
            ["Pays / Ville", [pays, ville].filter(Boolean).join(" · ") || "—"],
            ...(type === "ong" ? [
              ["N° d'agrément / acte légal", numeroAgrement],
              ["Délivré le", dateDelivranceAgrement || "—"],
              ["Expire le", dateExpirationAgrement || "non applicable"],
              ["Autorité de délivrance", autoriteDelivrance],
              ["Acte d'agrément joint", docAgrementUrl ? "✓ oui" : "—"],
              ["Statuts joints", docStatutsUrl ? "✓ oui" : "—"],
              ["Représentant légal", `${representantNom} — ${representantFonction}`],
            ] : []),
            ["Domaines d'activité", defisChoisis.map(id => champTexte((defisDisponibles.find(d => d.id === id) || {}).nom) || id).join(", ") || "—"],
            ["Adresse officielle", adresseOfficielle],
            ["Téléphone officiel", telephoneOfficiel],
            ["E-mail professionnel", emailProfessionnel],
            ["Site web", siteWeb || "—"],
            ["Code d'inscription bénévoles", codeInscription.toUpperCase()],
            ["E-mail de connexion", email],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: T.small, padding: "6px 0", borderBottom: "1px solid var(--c-border)" }}>
              <span style={{ color: "var(--c-text-muted)", flexShrink: 0 }}>{k}</span>
              <span style={{ color: "var(--c-text)", textAlign: "right" }}>{v}</span>
            </div>
          ))}

          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", lineHeight: 1.5, margin: "12px 0" }}>
            En soumettant ce dossier, tu confirmes l'exactitude des informations fournies. EcoVigil ne délivre, ne renouvelle ni ne remplace aucun agrément légal : la vérification effectuée porte uniquement sur la cohérence du dossier soumis sur la plateforme.
          </div>

          {erreur && <div role="alert" style={{ fontSize: T.body, color: "#B5451B", background: "var(--c-danger-border-soft)", borderRadius: 10, padding: "9px 12px", marginBottom: 10 }}>{erreur}</div>}

          <button type="button" onClick={soumettre} disabled={busy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 8 }}>
            {busy ? "…" : "Soumettre le dossier d'inscription"}
          </button>
          <button type="button" onClick={() => setMode("inscription")} disabled={busy} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer" }}>Modifier le dossier</button>
        </div>
      ) : mode === "profil_requis" ? (
        <ProfilGate profilInfo={profilInfo}>
          {showEditProfil ? (
            <ProfilEditeur profilInfo={profilInfo} onSaved={() => { setShowEditProfil(false); onProfilChange && onProfilChange(); }} onCancel={() => setShowEditProfil(false)} />
          ) : (
          <div>
            <div style={{ fontSize: T.body, color: "var(--c-accent)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              {profilInfo && profilInfo.photo_url ? (
                <img src={profilInfo.photo_url} alt="" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <IconCheck size={14} />
              )}
              Profil actif — {profilInfo && profilInfo.nom}
              <button type="button" onClick={() => setShowEditProfil(true)} aria-label="Modifier mon profil" style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 2, marginLeft: "auto" }}>
                <IconEdit size={13} />
              </button>
            </div>
            <button type="button" onClick={() => setMode("inscription")} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
              Continuer vers le dossier d'organisation
            </button>
          </div>
          )}
        </ProfilGate>
      ) : (
        <form onSubmit={allerAuRecapitulatif}>
          {sectionTitre(1, "Type d'organisation")}
          <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
            {[["ong", "ONG"], ["gouvernement", "Gouvernement"]].map(([id, label]) => (
              <button key={id} type="button" onClick={() => setType(id)} style={{
                flex: 1, padding: "9px 0", borderRadius: 10, fontSize: T.body, fontWeight: 600, cursor: "pointer",
                border: type === id ? "2px solid var(--c-accent)" : "1px solid var(--c-border)",
                background: type === id ? "var(--c-surface-soft)" : "var(--c-surface)", color: type === id ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{label}</button>
            ))}
          </div>
          {type === "ong" && (
            <div style={{ display: "flex", gap: 6, marginBottom: 8, marginTop: 6 }}>
              {[["nationale", "ONG nationale"], ["etrangere", "ONG étrangère"], ["autre", "Autre catégorie"]].map(([id, label]) => (
                <button key={id} type="button" onClick={() => setTypeOng(id)} style={{
                  flex: 1, padding: "6px 4px", borderRadius: 8, fontSize: T.meta, fontWeight: 600, cursor: "pointer",
                  border: typeOng === id ? "1.5px solid var(--c-accent)" : "1px solid var(--c-border)",
                  background: typeOng === id ? "var(--c-surface-soft)" : "var(--c-surface)", color: typeOng === id ? "var(--c-accent)" : "var(--c-text-secondary)" }}>{label}</button>
              ))}
            </div>
          )}

          {sectionTitre(2, "Identification officielle")}
          <input required value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom officiel de l'organisation" style={champStyle} />
          <input value={pays} onChange={e => setPays(e.target.value)} placeholder="Pays" style={champStyle} />
          <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Ville" style={champStyle} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Brève description (optionnel)"
            style={{ ...champStyle, fontFamily: "inherit", resize: "none" }} />

          {type === "ong" && (
            <>
              {sectionTitre(3, "Statut légal et agrément")}
              <input required value={numeroAgrement} onChange={e => setNumeroAgrement(e.target.value)} placeholder="Numéro de l'agrément ou de l'acte légal" style={champStyle} />
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Date de délivrance</div>
                  <input required type="date" value={dateDelivranceAgrement} onChange={e => setDateDelivranceAgrement(e.target.value)} style={champStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={labelStyle}>Date d'expiration (si applicable)</div>
                  <input type="date" value={dateExpirationAgrement} onChange={e => setDateExpirationAgrement(e.target.value)} style={champStyle} />
                </div>
              </div>
              <input required value={autoriteDelivrance} onChange={e => setAutoriteDelivrance(e.target.value)} placeholder="Autorité ayant délivré l'agrément ou l'acte légal" style={champStyle} />

              {sectionTitre(4, "Documents justificatifs")}
              <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 8 }}>Formats acceptés : PDF, JPG, PNG. 10 Mo maximum par document.</div>
              <VerifFileInput value={docAgrementUrl} onChange={setDocAgrementUrl} label="Acte d'agrément ou document légal (obligatoire)" />
              <VerifFileInput value={docStatutsUrl} onChange={setDocStatutsUrl} label="Statuts de l'organisation (obligatoire)" />
              <VerifFileInput value={docIdentiteUrl} onChange={setDocIdentiteUrl} label="Pièce d'identité du représentant légal (optionnel)" />

              {sectionTitre(5, "Représentant légal")}
              <input required value={representantNom} onChange={e => setRepresentantNom(e.target.value)} placeholder="Nom complet du représentant légal" style={champStyle} />
              <input required value={representantFonction} onChange={e => setRepresentantFonction(e.target.value)} placeholder="Fonction du représentant légal" style={champStyle} />
            </>
          )}

          {sectionTitre(6, "Domaines d'activité")}
          <div style={{ fontSize: T.small, fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }}>Domaine(s) d'activité *</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            {defisDisponibles.map(d => {
              const actif = defisChoisis.includes(d.id);
              return (
                <button key={d.id} type="button" onClick={() => toggleDefi(d.id)} style={{
                  padding: "6px 10px", borderRadius: 20, fontSize: T.small, fontWeight: 600, cursor: "pointer",
                  border: actif ? "1.5px solid var(--c-accent)" : "1px solid var(--c-border)",
                  background: actif ? "var(--c-surface-soft)" : "var(--c-surface)", color: actif ? "var(--c-accent)" : "var(--c-text-secondary)" }}>
                  {champTexte(d.nom) || d.id}
                </button>
              );
            })}
            {defisDisponibles.length === 0 && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>Aucun défi publié pour le moment.</div>}
          </div>

          {sectionTitre(7, "Coordonnées officielles")}
          <input required value={adresseOfficielle} onChange={e => setAdresseOfficielle(e.target.value)} placeholder="Adresse officielle" style={champStyle} />
          <input required value={telephoneOfficiel} onChange={e => setTelephoneOfficiel(e.target.value)} placeholder="Téléphone officiel" style={champStyle} />
          <input required type="email" value={emailProfessionnel} onChange={e => setEmailProfessionnel(e.target.value)} placeholder="E-mail professionnel" style={champStyle} />
          <input value={siteWeb} onChange={e => setSiteWeb(e.target.value)} placeholder="Site web (optionnel)" style={champStyle} />

          {sectionTitre(8, "Code d'inscription des bénévoles")}
          <input required value={codeInscription} onChange={e => setCodeInscription(e.target.value)} placeholder="Code d'inscription de l'organisation (ex : ECO01)" style={{ ...champStyle, marginBottom: 4 }} />
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 8, lineHeight: 1.5 }}>
            Créez un code unique permettant à vos bénévoles d'identifier votre organisation lors de leur inscription sur Pace Connect. Communiquez ce code uniquement aux bénévoles que vous souhaitez rattacher à votre organisation. Ce code ne constitue pas une preuve d'agrément, de reconnaissance légale ou de conformité.
          </div>

          {sectionTitre(9, "Identifiants de connexion")}
          <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", margin: "2px 0 8px" }}>Un compte réel (e-mail + mot de passe) permet à plusieurs membres de ton équipe de se connecter. Conseil : évite une adresse contenant des informations confidentielles ou sensibles.</div>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail de connexion" style={champStyle} />
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe (8 caractères minimum)"
            style={{ padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8 }} />
          <PasswordInput value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirme le mot de passe"
            style={{ padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 10 }} />

          {erreur && <div role="alert" style={{ fontSize: T.body, color: "#B5451B", background: "var(--c-danger-border-soft)", borderRadius: 10, padding: "9px 12px", marginBottom: 10 }}>{erreur}</div>}

          <button type="button" onClick={allerAuRecapitulatif} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 8 }}>
            Vérifier et continuer
          </button>
          <button type="button" onClick={() => setMode("choix")} style={{ width: "100%", padding: "8px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer" }}>Retour</button>
        </form>
      )}
    </div>
  );
}

export function BenevoleAccesBloque({ statut }) {
  const infos = {
    en_attente: {
      icon: <IconClock size={30} color="var(--c-warning)" />,
      titre: "Inscription en cours de validation",
      texte: "Ton inscription comme bénévole a bien été reçue. L'accès à EcoVigil s'ouvrira automatiquement dès qu'un administrateur du Centre d'EcoVigil aura validé ton compte.",
    },
    suspendu: {
      icon: <IconAlert size={30} color="#B5451B" />,
      titre: "Accès suspendu",
      texte: "Ton accès bénévole à EcoVigil a été suspendu par un administrateur. Contacte l'équipe EcoVigil si tu penses qu'il s'agit d'une erreur.",
    },
    rejete: {
      icon: <IconAlert size={30} color="var(--c-text-muted)" />,
      titre: "Demande non retenue",
      texte: "Ta demande d'inscription comme bénévole n'a pas été validée par l'équipe EcoVigil. Contacte l'équipe EcoVigil pour plus d'informations.",
    },
  };
  const info = infos[statut] || infos.en_attente;
  return (
    <div style={{ padding: "60px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <div style={{ background: "var(--c-surface-soft)", borderRadius: "50%", width: 64, height: 64, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {info.icon}
      </div>
      <div style={{ ...TITRE_SECTION, fontWeight: 600, color: "var(--c-text)" }}>{info.titre}</div>
      <div style={{ fontSize: T.body, color: "var(--c-text-secondary)", lineHeight: 1.6, maxWidth: 320 }}>{info.texte}</div>
    </div>
  );
}
