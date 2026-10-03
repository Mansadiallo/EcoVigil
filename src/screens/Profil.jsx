import React, { useEffect, useRef, useState } from "react";
import { LOGO_DATA_URL } from "../imagesData.js";
import { PasswordInput } from "../components/PasswordInput.jsx";
import { IconAlert, IconArrowLeft, IconCamera, IconCheck, IconClock, IconEdit, IconInfo, IconLock, IconLogOut, IconMailPlus, IconMapPin, IconSprout, IconUserCircle, IconUsers } from "../components/icons.jsx";
import { compressImage, uploadPhotoGeneric } from "../components/media.jsx";
import { SectionTitle } from "../components/ui.jsx";
import { inscrireBenevole } from "../lib/audit.js";
import { uid } from "../lib/categories.jsx";
import { t } from "../lib/i18n.js";
import { supabase, urlRedirectionAuth } from "../lib/supabase.js";

export const PAYS_INDICATIFS = [
  // Afrique
  { region: "Afrique", pays: "Afrique du Sud", indicatif: "+27" },
  { region: "Afrique", pays: "Algérie", indicatif: "+213" },
  { region: "Afrique", pays: "Angola", indicatif: "+244" },
  { region: "Afrique", pays: "Bénin", indicatif: "+229" },
  { region: "Afrique", pays: "Botswana", indicatif: "+267" },
  { region: "Afrique", pays: "Burkina Faso", indicatif: "+226" },
  { region: "Afrique", pays: "Burundi", indicatif: "+257" },
  { region: "Afrique", pays: "Cameroun", indicatif: "+237" },
  { region: "Afrique", pays: "Cap-Vert", indicatif: "+238" },
  { region: "Afrique", pays: "Comores", indicatif: "+269" },
  { region: "Afrique", pays: "Congo-Brazzaville", indicatif: "+242" },
  { region: "Afrique", pays: "Côte d'Ivoire", indicatif: "+225" },
  { region: "Afrique", pays: "Djibouti", indicatif: "+253" },
  { region: "Afrique", pays: "Égypte", indicatif: "+20" },
  { region: "Afrique", pays: "Érythrée", indicatif: "+291" },
  { region: "Afrique", pays: "Eswatini", indicatif: "+268" },
  { region: "Afrique", pays: "Éthiopie", indicatif: "+251" },
  { region: "Afrique", pays: "Gabon", indicatif: "+241" },
  { region: "Afrique", pays: "Gambie", indicatif: "+220" },
  { region: "Afrique", pays: "Ghana", indicatif: "+233" },
  { region: "Afrique", pays: "Guinée", indicatif: "+224" },
  { region: "Afrique", pays: "Guinée-Bissau", indicatif: "+245" },
  { region: "Afrique", pays: "Guinée équatoriale", indicatif: "+240" },
  { region: "Afrique", pays: "Kenya", indicatif: "+254" },
  { region: "Afrique", pays: "Lesotho", indicatif: "+266" },
  { region: "Afrique", pays: "Liberia", indicatif: "+231" },
  { region: "Afrique", pays: "Libye", indicatif: "+218" },
  { region: "Afrique", pays: "Madagascar", indicatif: "+261" },
  { region: "Afrique", pays: "Malawi", indicatif: "+265" },
  { region: "Afrique", pays: "Mali", indicatif: "+223" },
  { region: "Afrique", pays: "Maroc", indicatif: "+212" },
  { region: "Afrique", pays: "Maurice", indicatif: "+230" },
  { region: "Afrique", pays: "Mauritanie", indicatif: "+222" },
  { region: "Afrique", pays: "Mozambique", indicatif: "+258" },
  { region: "Afrique", pays: "Namibie", indicatif: "+264" },
  { region: "Afrique", pays: "Niger", indicatif: "+227" },
  { region: "Afrique", pays: "Nigeria", indicatif: "+234" },
  { region: "Afrique", pays: "Ouganda", indicatif: "+256" },
  { region: "Afrique", pays: "République centrafricaine", indicatif: "+236" },
  { region: "Afrique", pays: "République démocratique du Congo", indicatif: "+243" },
  { region: "Afrique", pays: "Rwanda", indicatif: "+250" },
  { region: "Afrique", pays: "Sao Tomé-et-Principe", indicatif: "+239" },
  { region: "Afrique", pays: "Sénégal", indicatif: "+221" },
  { region: "Afrique", pays: "Seychelles", indicatif: "+248" },
  { region: "Afrique", pays: "Sierra Leone", indicatif: "+232" },
  { region: "Afrique", pays: "Somalie", indicatif: "+252" },
  { region: "Afrique", pays: "Soudan", indicatif: "+249" },
  { region: "Afrique", pays: "Soudan du Sud", indicatif: "+211" },
  { region: "Afrique", pays: "Tanzanie", indicatif: "+255" },
  { region: "Afrique", pays: "Tchad", indicatif: "+235" },
  { region: "Afrique", pays: "Togo", indicatif: "+228" },
  { region: "Afrique", pays: "Tunisie", indicatif: "+216" },
  { region: "Afrique", pays: "Zambie", indicatif: "+260" },
  { region: "Afrique", pays: "Zimbabwe", indicatif: "+263" },
  // Europe
  { region: "Europe", pays: "Allemagne", indicatif: "+49" },
  { region: "Europe", pays: "Autriche", indicatif: "+43" },
  { region: "Europe", pays: "Belgique", indicatif: "+32" },
  { region: "Europe", pays: "Danemark", indicatif: "+45" },
  { region: "Europe", pays: "Espagne", indicatif: "+34" },
  { region: "Europe", pays: "Finlande", indicatif: "+358" },
  { region: "Europe", pays: "France", indicatif: "+33" },
  { region: "Europe", pays: "Grèce", indicatif: "+30" },
  { region: "Europe", pays: "Irlande", indicatif: "+353" },
  { region: "Europe", pays: "Italie", indicatif: "+39" },
  { region: "Europe", pays: "Luxembourg", indicatif: "+352" },
  { region: "Europe", pays: "Norvège", indicatif: "+47" },
  { region: "Europe", pays: "Pays-Bas", indicatif: "+31" },
  { region: "Europe", pays: "Pologne", indicatif: "+48" },
  { region: "Europe", pays: "Portugal", indicatif: "+351" },
  { region: "Europe", pays: "Roumanie", indicatif: "+40" },
  { region: "Europe", pays: "Royaume-Uni", indicatif: "+44" },
  { region: "Europe", pays: "Russie", indicatif: "+7" },
  { region: "Europe", pays: "Suède", indicatif: "+46" },
  { region: "Europe", pays: "Suisse", indicatif: "+41" },
  { region: "Europe", pays: "Turquie", indicatif: "+90" },
  { region: "Europe", pays: "Ukraine", indicatif: "+380" },
  // Amérique du Nord
  { region: "Amérique du Nord", pays: "Canada", indicatif: "+1" },
  { region: "Amérique du Nord", pays: "États-Unis", indicatif: "+1" },
  { region: "Amérique du Nord", pays: "Mexique", indicatif: "+52" },
  // Amérique centrale et Caraïbes
  { region: "Amérique centrale et Caraïbes", pays: "Cuba", indicatif: "+53" },
  { region: "Amérique centrale et Caraïbes", pays: "Guatemala", indicatif: "+502" },
  { region: "Amérique centrale et Caraïbes", pays: "Haïti", indicatif: "+509" },
  { region: "Amérique centrale et Caraïbes", pays: "Jamaïque", indicatif: "+1" },
  { region: "Amérique centrale et Caraïbes", pays: "Panama", indicatif: "+507" },
  { region: "Amérique centrale et Caraïbes", pays: "République dominicaine", indicatif: "+1" },
  // Amérique du Sud
  { region: "Amérique du Sud", pays: "Argentine", indicatif: "+54" },
  { region: "Amérique du Sud", pays: "Bolivie", indicatif: "+591" },
  { region: "Amérique du Sud", pays: "Brésil", indicatif: "+55" },
  { region: "Amérique du Sud", pays: "Chili", indicatif: "+56" },
  { region: "Amérique du Sud", pays: "Colombie", indicatif: "+57" },
  { region: "Amérique du Sud", pays: "Équateur", indicatif: "+593" },
  { region: "Amérique du Sud", pays: "Paraguay", indicatif: "+595" },
  { region: "Amérique du Sud", pays: "Pérou", indicatif: "+51" },
  { region: "Amérique du Sud", pays: "Uruguay", indicatif: "+598" },
  { region: "Amérique du Sud", pays: "Venezuela", indicatif: "+58" },
  // Moyen-Orient
  { region: "Moyen-Orient", pays: "Arabie saoudite", indicatif: "+966" },
  { region: "Moyen-Orient", pays: "Bahreïn", indicatif: "+973" },
  { region: "Moyen-Orient", pays: "Émirats arabes unis", indicatif: "+971" },
  { region: "Moyen-Orient", pays: "Irak", indicatif: "+964" },
  { region: "Moyen-Orient", pays: "Iran", indicatif: "+98" },
  { region: "Moyen-Orient", pays: "Israël", indicatif: "+972" },
  { region: "Moyen-Orient", pays: "Jordanie", indicatif: "+962" },
  { region: "Moyen-Orient", pays: "Koweït", indicatif: "+965" },
  { region: "Moyen-Orient", pays: "Liban", indicatif: "+961" },
  { region: "Moyen-Orient", pays: "Oman", indicatif: "+968" },
  { region: "Moyen-Orient", pays: "Palestine", indicatif: "+970" },
  { region: "Moyen-Orient", pays: "Qatar", indicatif: "+974" },
  { region: "Moyen-Orient", pays: "Syrie", indicatif: "+963" },
  { region: "Moyen-Orient", pays: "Yémen", indicatif: "+967" },
  // Asie
  { region: "Asie", pays: "Bangladesh", indicatif: "+880" },
  { region: "Asie", pays: "Chine", indicatif: "+86" },
  { region: "Asie", pays: "Corée du Sud", indicatif: "+82" },
  { region: "Asie", pays: "Inde", indicatif: "+91" },
  { region: "Asie", pays: "Indonésie", indicatif: "+62" },
  { region: "Asie", pays: "Japon", indicatif: "+81" },
  { region: "Asie", pays: "Malaisie", indicatif: "+60" },
  { region: "Asie", pays: "Népal", indicatif: "+977" },
  { region: "Asie", pays: "Pakistan", indicatif: "+92" },
  { region: "Asie", pays: "Philippines", indicatif: "+63" },
  { region: "Asie", pays: "Singapour", indicatif: "+65" },
  { region: "Asie", pays: "Sri Lanka", indicatif: "+94" },
  { region: "Asie", pays: "Thaïlande", indicatif: "+66" },
  { region: "Asie", pays: "Vietnam", indicatif: "+84" },
  // Océanie
  { region: "Océanie", pays: "Australie", indicatif: "+61" },
  { region: "Océanie", pays: "Nouvelle-Zélande", indicatif: "+64" },
  // Autre
  { region: "Autre", pays: "Autre", indicatif: "" },
];

const BENEVOLE_STATUT_INFO = {
  en_attente: { label: "Inscription envoyée", texte: "Ton inscription a été reçue et est en attente de validation par l'équipe EcoVigil.", couleur: "var(--c-warning)" },
  valide: { label: "Bénévole validé", texte: "Ton inscription est validée. Tu as accès à toutes les fonctionnalités d'EcoVigil.", couleur: "var(--c-accent)" },
  suspendu: { label: "Compte suspendu", texte: "Ton statut de bénévole a été suspendu par l'équipe EcoVigil. Contacte l'équipe pour plus d'informations.", couleur: "#B5451B" },
  rejete: { label: "Inscription refusée", texte: "Ta demande n'a pas été retenue par l'équipe EcoVigil. Contacte l'équipe si tu penses qu'il s'agit d'une erreur.", couleur: "var(--c-text-muted)" },
};

// Préalable requis avant de devenir bénévole ou de créer un compte organisation : un profil
// de base (nom, e-mail/mot de passe, pays, ville). Tant qu'aucun profil actif n'est détecté
// (profilInfo), affiche le formulaire de création/connexion à la place du contenu ; une fois
// le profil actif, affiche simplement ses enfants (children).
// Modification d'un profil déjà créé (nom, pays, ville, photo). Distinct de ProfilGate, qui
// ne gère que la création/connexion initiale.
// Onglet "Profil" dédié — inspiré des grandes plateformes (photo circulaire en tête façon
// WhatsApp, nom en évidence, liste de réglages en dessous). Tant qu'aucun profil n'est créé,
// affiche directement ProfilGate : c'est le point d'entrée pour créer son compte avant
// d'accéder au reste d'EcoVigil.
export function ProfilTab({ profilInfo, onProfilChange, lang }) {
  const [showEdit, setShowEdit] = useState(false);

  if (profilInfo === undefined) {
    return <div style={{ padding: 24, textAlign: "center", color: "var(--c-text-muted)", fontSize: 13 }}>Chargement…</div>;
  }

  if (!profilInfo) {
    return (
      <div>
        <SectionTitle sub="Crée ton compte pour accéder à EcoVigil">Mon profil</SectionTitle>
        <ProfilGate profilInfo={profilInfo}><div /></ProfilGate>
      </div>
    );
  }

  if (showEdit) {
    return (
      <div>
        <SectionTitle sub="Modifie tes informations">Mon profil</SectionTitle>
        <ProfilEditeur profilInfo={profilInfo} onSaved={() => { setShowEdit(false); onProfilChange && onProfilChange(); }} onCancel={() => setShowEdit(false)} />
      </div>
    );
  }

  async function seDeconnecter() {
    if (!confirm("Se déconnecter de ce profil ?")) return;
    await supabase.auth.signOut();
    onProfilChange && onProfilChange();
  }

  const ligne = { display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "14px 4px", border: "none", background: "none", borderBottom: "1px solid var(--c-border)", cursor: "pointer", textAlign: "left", fontSize: 13.5 };

  return (
    <div>
      {/* En-tête façon WhatsApp : avatar circulaire, badge appareil photo, nom en évidence. */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "18px 0 24px" }}>
        <div style={{ position: "relative", marginBottom: 12 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: profilInfo.photo_url ? `url(${profilInfo.photo_url}) center/cover` : "var(--c-surface)", border: "1px solid var(--c-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!profilInfo.photo_url && <IconUserCircle size={48} color="var(--c-text-faint)" />}
          </div>
          <button onClick={() => setShowEdit(true)} aria-label="Changer la photo de profil" style={{
            position: "absolute", bottom: 0, right: 0, width: 30, height: 30, borderRadius: "50%", background: "var(--c-accent-dark)",
            border: "2px solid var(--c-bg)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
            <IconCamera size={14} />
          </button>
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 19, fontWeight: 700, color: "var(--c-text)" }}>{profilInfo.nom}</div>
        <div style={{ fontSize: 12, color: "var(--c-text-muted)", marginTop: 2 }}>{[profilInfo.ville, profilInfo.pays].filter(Boolean).join(" · ") || profilInfo.email}</div>
      </div>

      {/* Liste de réglages, façon menu WhatsApp/Facebook. */}
      <div style={{ background: "var(--c-surface)", borderRadius: 14, border: "1px solid var(--c-border)", padding: "0 14px", marginBottom: 16 }}>
        <button onClick={() => setShowEdit(true)} style={ligne}>
          <IconEdit size={17} color="var(--c-text-secondary)" />
          <span style={{ flex: 1 }}>Modifier mes informations</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 4px", fontSize: 13.5, color: "var(--c-text-secondary)" }}>
          <IconMailPlus size={17} color="var(--c-text-secondary)" />
          <span style={{ flex: 1 }}>{profilInfo.email}</span>
        </div>
        <button onClick={seDeconnecter} style={{ ...ligne, borderBottom: "none", color: "#B5451B" }}>
          <IconLogOut size={17} color="#B5451B" />
          <span style={{ flex: 1 }}>Se déconnecter</span>
        </button>
      </div>
    </div>
  );
}

// Mur d'accès obligatoire, façon Facebook/WhatsApp : aucun contenu d'EcoVigil (pas même
// l'accueil) n'est accessible tant qu'un profil n'a pas été créé ou qu'on ne s'est pas
// reconnecté. Remplace tout l'habillage habituel (barre de navigation incluse).
export function MurProfilObligatoire({ profilInfo, lang }) {
  return (
    <div style={{ padding: "12px 4px 32px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--c-surface)", margin: "0 auto 14px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", border: "1px solid var(--c-border)" }}>
          <img src={LOGO_DATA_URL} alt={t(lang, "logo_pace_alt")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontWeight: 700, fontSize: 19 }}>Bienvenue sur EcoVigil</div>
      </div>
      <ProfilGate profilInfo={profilInfo}><div /></ProfilGate>
    </div>
  );
}

export function ProfilEditeur({ profilInfo, onSaved, onCancel }) {
  const [nom, setNom] = useState((profilInfo && profilInfo.nom) || "");
  const [pays, setPays] = useState((profilInfo && profilInfo.pays) || "");
  const [ville, setVille] = useState((profilInfo && profilInfo.ville) || "");
  const [photo, setPhoto] = useState((profilInfo && profilInfo.photo_url) || null);
  const [photoModifiee, setPhotoModifiee] = useState(false);
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const fileRef = useRef(null);

  const champ = { width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" };

  async function choisirPhoto(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => { setPhoto(await compressImage(reader.result, 512, 0.75)); setPhotoModifiee(true); };
    reader.readAsDataURL(f);
  }

  async function enregistrer(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErreur("");
    if (!nom.trim()) { setErreur("Le nom est requis."); return; }
    setBusy(true);
    // Ré-uploade seulement si la photo a changé (une chaîne data: en attente, sinon l'URL déjà
    // en ligne reste inchangée).
    const photoUrl = photoModifiee && photo ? await uploadPhotoGeneric(photo, "profils") : (photo || null);
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData && sessionData.session && sessionData.session.user && sessionData.session.user.id;
    const { error } = await supabase.from("profils_comptes").update({ nom: nom.trim(), pays: pays || null, ville: ville || null, photo_url: photoUrl }).eq("id", userId);
    setBusy(false);
    if (error) { setErreur("Impossible d'enregistrer les modifications pour le moment."); return; }
    onSaved();
  }

  return (
    <div style={{ background: "var(--c-bg)", borderRadius: 12, padding: 14 }}>
      <form onSubmit={enregistrer}>
        <input ref={fileRef} type="file" accept="image/*" onChange={choisirPhoto} style={{ display: "none" }} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={{
            width: 72, height: 72, borderRadius: "50%", border: "1px dashed var(--c-border)", background: photo ? `url(${photo}) center/cover` : "var(--c-surface)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, overflow: "hidden" }} aria-label="Changer la photo de profil">
            {!photo && <IconCamera size={20} color="var(--c-text-muted)" />}
          </button>
        </div>
        <input required value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom complet" style={champ} />
        <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Ville (optionnel)" style={champ} />
        <select value={pays} onChange={e => setPays(e.target.value)}
          style={{ ...champ, background: "var(--c-surface)", color: pays ? "var(--c-text)" : "var(--c-text-muted)" }}>
          <option value="">Pays (optionnel)</option>
          {Object.entries(PAYS_INDICATIFS.reduce((acc, p) => { (acc[p.region] = acc[p.region] || []).push(p); return acc; }, {})).map(([region, list]) => (
            <optgroup key={region} label={region}>
              {list.map(p => <option key={p.pays} value={p.pays}>{p.pays}</option>)}
            </optgroup>
          ))}
        </select>
        {erreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
        <button type="button" onClick={enregistrer} disabled={busy} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", marginBottom: 6 }}>
          {busy ? "…" : "Enregistrer"}
        </button>
        <button type="button" onClick={onCancel} style={{ width: "100%", padding: "6px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer" }}>
          Annuler
        </button>
      </form>
    </div>
  );
}

const ETAPES_PROFIL = [
  { titre: "Qui es-tu ?", icone: IconUserCircle },
  { titre: "Ton compte", icone: IconLock },
  { titre: "Dernière touche", icone: IconMapPin },
];

export function ProfilGate({ profilInfo, children }) {
  const [modeProfil, setModeProfil] = useState("signup"); // signup | login
  const [etape, setEtape] = useState(0);
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pays, setPays] = useState("");
  const [ville, setVille] = useState("");
  const [photo, setPhoto] = useState(null); // dataUrl compressée, en attente d'upload
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [messageConfirmation, setMessageConfirmation] = useState(null); // { compteExistant: bool, texte } | null
  const [modeOubli, setModeOubli] = useState(false); // formulaire "Mot de passe oublié" affiché à la place de la connexion
  const [oubliEnvoye, setOubliEnvoye] = useState(false);
  const fileRef = useRef(null);
  const nomRef = useRef(null);
  const emailRef = useRef(null);
  const emailLoginRef = useRef(null);

  const emailValide = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const etape0Ok = nom.trim().length > 0;
  const etape1Ok = emailValide && password.length >= 6;

  // Focus automatique sur le champ principal de l'étape affichée, pour ne jamais faire chercher
  // le curseur : ça fait gagner un tap et rend l'enchaînement des étapes plus naturel.
  useEffect(() => {
    if (profilInfo || messageConfirmation) return;
    const t = setTimeout(() => {
      if (modeProfil === "login") { emailLoginRef.current && emailLoginRef.current.focus(); return; }
      if (etape === 0) nomRef.current && nomRef.current.focus();
      if (etape === 1) emailRef.current && emailRef.current.focus();
    }, 260); // laisse l'animation d'entrée se terminer avant de faire apparaître le clavier mobile
    return () => clearTimeout(t);
  }, [etape, modeProfil, profilInfo, messageConfirmation]);

  if (profilInfo === undefined) {
    return <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div>;
  }
  if (profilInfo) {
    return children;
  }

  const champ = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13.5, marginBottom: 8, boxSizing: "border-box", transition: "border-color .15s ease" };
  const champErreur = { ...champ, borderColor: "#C0522A" };

  async function choisirPhoto(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => setPhoto(await compressImage(reader.result, 512, 0.75));
    reader.readAsDataURL(f);
  }

  function allerEtape(suivante) {
    setErreur("");
    setEtape(suivante);
  }

  function suivant(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (etape === 0) {
      if (!etape0Ok) { setErreur("Merci d'indiquer ton nom."); return; }
      allerEtape(1);
    } else if (etape === 1) {
      if (!emailValide) { setErreur("Cette adresse e-mail ne semble pas valide."); return; }
      if (password.length < 6) { setErreur("6 caractères minimum pour le mot de passe."); return; }
      allerEtape(2);
    }
  }

  function precedent() {
    setErreur("");
    setEtape(e => Math.max(0, e - 1));
  }

  async function creerProfil(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (etape < 2) { suivant(e); return; }
    setErreur("");
    setBusy(true);
    // La photo est envoyée dans le stockage AVANT la création du compte (l'upload ne nécessite
    // pas d'être connecté), pour que son URL puisse être incluse dans les métadonnées et reprise
    // par le déclencheur qui crée la ligne "profils_comptes" en une seule opération atomique.
    const photoUrl = photo ? await uploadPhotoGeneric(photo, "profils") : null;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(), password,
      options: { emailRedirectTo: urlRedirectionAuth(), data: { type_compte: "profil", nom: nom.trim(), pays: pays || null, ville: ville || null, photo_url: photoUrl } },
    });
    setBusy(false);
    if (error) { setErreur(error.message || "Impossible de créer le profil pour le moment."); return; }
    if (!data || !data.session) {
      // GoTrue répond sans erreur même si le compte existe déjà (pour ne pas permettre de deviner
      // les e-mails inscrits) : dans ce cas "identities" est vide et AUCUN e-mail n'est envoyé.
      // Sans ce contrôle, on affichait à tort "vérifie ta boîte mail" alors que rien ne partait.
      const compteExisteDeja = data && data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;
      setMessageConfirmation(compteExisteDeja
        ? { compteExistant: true, texte: "Un profil existe déjà avec cette adresse e-mail." }
        : { compteExistant: false, texte: "Vérifie ta boîte mail (et tes courriers indésirables) pour confirmer ton adresse, puis reviens ici." });
    }
    // Si une session est renvoyée directement, l'écran bascule seul (citoyenSession changé).
  }

  async function connecterProfil(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErreur("");
    if (!email.trim() || !password) { setErreur("Merci de renseigner l'e-mail et le mot de passe."); return; }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) { setErreur("E-mail ou mot de passe incorrect."); return; }
  }

  // Mot de passe oublié : envoie le lien de récupération (traité au retour par App.jsx, qui ouvre
  // l'écran "Nouveau mot de passe"). Message volontairement identique que l'adresse soit connue
  // ou non, pour ne pas révéler quels e-mails ont un profil.
  async function envoyerLienOubli(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErreur("");
    if (!emailValide) { setErreur("Cette adresse e-mail ne semble pas valide."); return; }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: urlRedirectionAuth() });
    setBusy(false);
    if (error) { setErreur(error.message || "Impossible d'envoyer l'e-mail pour le moment. Réessaie dans quelques instants."); return; }
    setOubliEnvoye(true);
  }

  const boutonPrincipal = { width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", marginBottom: 6, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "opacity .15s ease" };
  const boutonLien = { width: "100%", padding: "6px 0", borderRadius: 10, border: "none", background: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer" };

  // --- Écran de confirmation (après inscription) ---
  if (messageConfirmation) {
    const OkIcon = messageConfirmation.compteExistant ? IconInfo : IconCheck;
    return (
      <div className="pace-fade-in" style={{ background: "var(--c-bg)", borderRadius: 12, padding: 18, textAlign: "center" }}>
        <div className="pace-scale-in" style={{
          width: 52, height: 52, borderRadius: "50%", margin: "0 auto 12px", display: "flex", alignItems: "center", justifyContent: "center",
          background: messageConfirmation.compteExistant ? "var(--c-surface-soft)" : "var(--c-accent-dark)" }}>
          <OkIcon size={24} color={messageConfirmation.compteExistant ? "var(--c-accent-dark)" : "#fff"} />
        </div>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }}>
          {messageConfirmation.compteExistant ? "Déjà inscrit·e" : "Presque prêt·e"}
        </div>
        <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>{messageConfirmation.texte}</div>
        <button type="button" onClick={() => { setMessageConfirmation(null); setModeProfil("login"); setPassword(""); allerEtape(0); }} style={boutonPrincipal}>
          {messageConfirmation.compteExistant ? "Se connecter" : "J'ai confirmé, me connecter"}
        </button>
        {!messageConfirmation.compteExistant && (
          <button type="button" onClick={() => setMessageConfirmation(null)} style={boutonLien}>Corriger l'adresse e-mail</button>
        )}
      </div>
    );
  }

  return (
    <div className="pace-fade-in" style={{ background: "var(--c-bg)", borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 12, lineHeight: 1.5 }}>
        Un profil de base est nécessaire avant de continuer — il te servira aussi bien pour devenir bénévole que pour créer un compte organisation.
      </div>

      {modeProfil === "signup" ? (
        <>
          {/* Barre de progression + en-tête d'étape : rendent visible où on en est et ce qu'il reste. */}
          <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
            {ETAPES_PROFIL.map((_, i) => (
              <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= etape ? "var(--c-accent-dark)" : "var(--c-border)", transition: "background-color .3s ease" }} />
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              {etape > 0 && (
                <button type="button" onClick={precedent} aria-label="Étape précédente" style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-muted)", display: "flex", padding: 2 }}>
                  <IconArrowLeft size={16} />
                </button>
              )}
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", background: "var(--c-surface-soft)", color: "var(--c-accent-dark)" }}>
                {React.createElement(ETAPES_PROFIL[etape].icone, { size: 14 })}
              </span>
              <span style={{ fontFamily: "Fraunces, serif", fontSize: 14.5, fontWeight: 600, color: "var(--c-text)" }}>{ETAPES_PROFIL[etape].titre}</span>
            </div>
            <span style={{ fontSize: 10.5, color: "var(--c-text-faint)" }}>{etape + 1}/{ETAPES_PROFIL.length}</span>
          </div>

          <form onSubmit={creerProfil}>
            <div key={etape} className="pace-fade-in">
              {etape === 0 && (
                <>
                  <input ref={fileRef} type="file" accept="image/*" onChange={choisirPhoto} style={{ display: "none" }} />
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                    <button type="button" onClick={() => fileRef.current && fileRef.current.click()} style={{
                      width: 76, height: 76, borderRadius: "50%", border: "1px dashed var(--c-border)", background: photo ? `url(${photo}) center/cover` : "var(--c-surface)",
                      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: 0, overflow: "hidden" }} aria-label="Choisir une photo de profil">
                      {!photo && <IconCamera size={21} color="var(--c-text-muted)" />}
                    </button>
                  </div>
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", textAlign: "center", marginBottom: 12 }}>Photo de profil (optionnel)</div>
                  <input ref={nomRef} required value={nom} onChange={e => setNom(e.target.value)} placeholder="Nom complet" style={champ} />
                </>
              )}
              {etape === 1 && (
                <>
                  <input ref={emailRef} required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail"
                    style={email && !emailValide ? champErreur : champ} />
                  <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginTop: -4, marginBottom: 8, lineHeight: 1.4 }}>
                    Conseil : évite une adresse e-mail contenant des informations confidentielles ou sensibles (nom d'employeur, etc.).
                  </div>
                  <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe (6 caractères min.)" style={champ} />
                  {password.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10.5, color: password.length >= 6 ? "var(--c-accent-dark)" : "var(--c-text-muted)", marginTop: -3, marginBottom: 8 }}>
                      {password.length >= 6 ? <IconCheck size={11} /> : null}
                      {password.length >= 6 ? "Longueur suffisante" : `Encore ${6 - password.length} caractère${6 - password.length > 1 ? "s" : ""}`}
                    </div>
                  )}
                </>
              )}
              {etape === 2 && (
                <>
                  <input value={ville} onChange={e => setVille(e.target.value)} placeholder="Ville (optionnel)" style={champ} />
                  <select value={pays} onChange={e => setPays(e.target.value)}
                    style={{ ...champ, background: "var(--c-surface)", color: pays ? "var(--c-text)" : "var(--c-text-muted)" }}>
                    <option value="">Pays (optionnel)</option>
                    {Object.entries(PAYS_INDICATIFS.reduce((acc, p) => { (acc[p.region] = acc[p.region] || []).push(p); return acc; }, {})).map(([region, list]) => (
                      <optgroup key={region} label={region}>
                        {list.map(p => <option key={p.pays} value={p.pays}>{p.pays}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </>
              )}
            </div>

            {erreur && (
              <div role="alert" className="pace-fade-in" style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>
                <IconAlert size={13} color="#B5451B" />
                <span>{erreur}</span>
              </div>
            )}

            {etape < 2 ? (
              <button type="button" onClick={suivant} disabled={etape === 0 ? !etape0Ok : !etape1Ok} style={{ ...boutonPrincipal, opacity: (etape === 0 ? !etape0Ok : !etape1Ok) ? 0.55 : 1 }}>
                Continuer
              </button>
            ) : (
              <button type="button" onClick={creerProfil} disabled={busy} style={{ ...boutonPrincipal, opacity: busy ? 0.75 : 1 }}>
                {busy ? <IconClock size={14} /> : <IconSprout size={14} />}
                {busy ? "Création…" : "Créer mon profil"}
              </button>
            )}
            {etape === 0 && (
              <button type="button" onClick={() => { setModeProfil("login"); setErreur(""); allerEtape(0); }} style={boutonLien}>
                Déjà un profil ? Se connecter
              </button>
            )}
          </form>
        </>
      ) : modeOubli ? (
        <form onSubmit={envoyerLienOubli} className="pace-fade-in">
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 14.5, fontWeight: 600, color: "var(--c-text)", marginBottom: 6 }}>Mot de passe oublié</div>
          {oubliEnvoye ? (
            <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.6, marginBottom: 12 }}>
              Si un profil existe avec cette adresse, un e-mail vient d'être envoyé. Ouvre le lien reçu (pense à vérifier les courriers indésirables) pour choisir un nouveau mot de passe.
            </div>
          ) : (
            <>
              <div style={{ fontSize: 12, color: "var(--c-text-secondary)", lineHeight: 1.5, marginBottom: 10 }}>
                Saisis l'adresse e-mail de ton profil : nous t'enverrons un lien pour choisir un nouveau mot de passe.
              </div>
              <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail" style={champ} />
              {erreur && (
                <div role="alert" className="pace-fade-in" style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>
                  <IconAlert size={13} color="#B5451B" />
                  <span>{erreur}</span>
                </div>
              )}
              <button type="button" onClick={envoyerLienOubli} disabled={busy} style={{ ...boutonPrincipal, opacity: busy ? 0.75 : 1 }}>
                {busy ? "Envoi…" : "Envoyer le lien"}
              </button>
            </>
          )}
          <button type="button" onClick={() => { setModeOubli(false); setOubliEnvoye(false); setErreur(""); }} style={boutonLien}>
            ← Retour à la connexion
          </button>
        </form>
      ) : (
        <form onSubmit={connecterProfil} className="pace-fade-in">
          <input ref={emailLoginRef} required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Adresse e-mail" style={champ} />
          <PasswordInput value={password} onChange={e => setPassword(e.target.value)} placeholder="Mot de passe" style={champ} />
          <button type="button" onClick={() => { setModeOubli(true); setOubliEnvoye(false); setErreur(""); }} style={{ background: "none", border: "none", padding: "0 0 10px", color: "var(--c-accent-dark)", fontSize: 11.5, cursor: "pointer", display: "block", marginLeft: "auto" }}>
            Mot de passe oublié ?
          </button>
          {erreur && (
            <div role="alert" className="pace-fade-in" style={{ display: "flex", alignItems: "flex-start", gap: 6, fontSize: 11.5, color: "#B5451B", marginBottom: 8 }}>
              <IconAlert size={13} color="#B5451B" />
              <span>{erreur}</span>
            </div>
          )}
          <button type="button" onClick={connecterProfil} disabled={busy} style={{ ...boutonPrincipal, opacity: busy ? 0.75 : 1 }}>
            {busy ? "Connexion…" : "Se connecter"}
          </button>
          <button type="button" onClick={() => { setModeProfil("signup"); setErreur(""); allerEtape(0); }} style={boutonLien}>
            Pas encore de profil ? En créer un
          </button>
        </form>
      )}
    </div>
  );
}

export function VolunteerCard({ lang, benevoleStatut, onInscrit, profilInfo, onProfilChange }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [contact, setContact] = useState("");
  const [pays, setPays] = useState("");
  const [ville, setVille] = useState("");
  const [zone, setZone] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");
  const [code, setCode] = useState("");
  const [showEditProfil, setShowEditProfil] = useState(false);

  const indicatif = (PAYS_INDICATIFS.find(p => p.pays === pays) || {}).indicatif || "";

  async function submit(e) {
    if (e && e.preventDefault) e.preventDefault();
    setErreur("");
    setBusy(true);
    // Associe automatiquement l'indicatif téléphonique du pays choisi devant le numéro,
    // sauf si le champ contient une adresse e-mail ou un indicatif déjà saisi manuellement.
    let contactFinal = contact.trim();
    if (indicatif && contactFinal && !contactFinal.includes("@") && !contactFinal.startsWith("+")) {
      contactFinal = `${indicatif} ${contactFinal}`;
    }
    // Un id est généré côté client (repris tel quel par la colonne "id" par défaut de type uuid)
    // pour pouvoir le mettre en cache sans avoir besoin de relire la ligne après insertion —
    // la table "benevoles" n'étant pas lisible publiquement, un select-after-insert échouerait.
    const benevoleId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (uid() + "-" + uid() + "-" + uid());
    // L'insertion passe par une fonction serveur (RPC) plutôt qu'un insert direct : c'est elle
    // qui vérifie le code d'organisation (si saisi) et résout l'organisation correspondante —
    // jamais le client, pour qu'il soit impossible de s'auto-assigner à une organisation en
    // devinant/forgeant un id sans connaître son vrai code. Le nom vient du profil (auth.uid()),
    // plus besoin de le ressaisir ici.
    const { queued, error } = await inscrireBenevole({
      benevoleId, contactFinal, pays: pays || null, ville: ville || null, zone: zone || null, code: code.trim() || null,
    });
    if (error) {
      setBusy(false);
      if (error.message && error.message.includes("code_invalide")) {
        setErreur("Le code saisi est incorrect ou n'est pas lié à une organisation.");
      } else if (error.message && error.message.includes("profil_requis")) {
        setErreur("Un profil actif est requis pour t'inscrire comme bénévole.");
      } else {
        setErreur(t(lang, "inscription_echec") + (error.message ? "\n(" + error.message + ")" : ""));
      }
      return;
    }
    // Mis en cache localement : permet d'accompagner automatiquement chaque signalement fait
    // depuis cet appareil des renseignements du bénévole (et son id, pour qu'une organisation
    // puisse l'assigner à elle-même), sans avoir à les redemander ni à relire la table
    // "benevoles" (qui n'est pas lisible publiquement).
    try { localStorage.setItem("pace-benevole-info", JSON.stringify({ id: benevoleId, nom: profilInfo && profilInfo.nom, contact: contactFinal, pays: pays || null, ville: ville || null, quartier: zone || null })); } catch (e) {}
    setBusy(false);
    setDone(true); setContact(""); setPays(""); setVille(""); setZone(""); setCode("");
    if (onInscrit) onInscrit();
    if (queued) setErreur(""); // pas d'erreur : simplement mis en attente, le statut "en_attente" s'affiche déjà
  }

  // Cet appareil a déjà une inscription (peu importe son statut) : on ne montre jamais le
  // formulaire à nouveau, pour éviter les doublons dans le Centre d'EcoVigil. L'app
  // se "souvient" via device_id (persisté en localStorage), donc pas besoin de compte.
  if (benevoleStatut) {
    const info = BENEVOLE_STATUT_INFO[benevoleStatut] || { label: benevoleStatut, texte: "", couleur: "var(--c-text-muted)" };
    return (
      <div style={{ marginTop: 22, background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconUsers size={17} color="var(--c-accent-dark)" />
          <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)" }}>{t(lang, "devenir_benevole")}</div>
        </div>
        <div style={{ display: "inline-block", fontSize: 10.5, fontWeight: 700, color: "#fff", background: info.couleur, borderRadius: 999, padding: "3px 10px", marginBottom: 8 }}>{info.label}</div>
        <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", lineHeight: 1.5 }}>{info.texte}</div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 22, background: "var(--c-surface)", borderRadius: 14, padding: 16, border: "1px solid var(--c-border)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <IconUsers size={17} color="var(--c-accent-dark)" />
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)" }}>{t(lang, "devenir_benevole")}</div>
      </div>
      {done ? (
        <div style={{ fontSize: 12.5, color: "var(--c-accent)", display: "flex", alignItems: "center", gap: 6 }}><IconCheck size={14} /> {t(lang, "inscription_recue")}</div>
      ) : !open ? (
        <>
          <div style={{ fontSize: 12.5, color: "var(--c-text-secondary)", marginBottom: 10 }}>{t(lang, "rejoindre_equipe")}</div>
          <button onClick={() => setOpen(true)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-accent-dark)", background: "var(--c-surface)", color: "var(--c-accent-dark)", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>{t(lang, "sinscrire")}</button>
        </>
      ) : (
        <ProfilGate profilInfo={profilInfo}>
          {showEditProfil ? (
            <ProfilEditeur profilInfo={profilInfo} onSaved={() => { setShowEditProfil(false); onProfilChange && onProfilChange(); }} onCancel={() => setShowEditProfil(false)} />
          ) : (
          <form onSubmit={submit}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--c-text-secondary)", marginBottom: 8 }}>
              {profilInfo && profilInfo.photo_url && (
                <img src={profilInfo.photo_url} alt="" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover" }} />
              )}
              <span>Inscription au nom de {profilInfo && profilInfo.nom} (profil connecté).</span>
              <button type="button" onClick={() => setShowEditProfil(true)} aria-label="Modifier mon profil" style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 2, marginLeft: "auto" }}>
                <IconEdit size={13} />
              </button>
            </div>
            <input required value={contact} onChange={e => setContact(e.target.value)} placeholder={indicatif ? `${t(lang, "telephone_email")} (${indicatif})` : t(lang, "telephone_email")}
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
            <select required value={pays} onChange={e => setPays(e.target.value)}
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 4, boxSizing: "border-box", background: "var(--c-surface)", color: pays ? "var(--c-text)" : "var(--c-text-muted)" }}>
              <option value="" disabled>{t(lang, "pays_label")}</option>
              {Object.entries(PAYS_INDICATIFS.reduce((acc, p) => { (acc[p.region] = acc[p.region] || []).push(p); return acc; }, {})).map(([region, list]) => (
                <optgroup key={region} label={region}>
                  {list.map(p => <option key={p.pays} value={p.pays}>{p.pays}{p.indicatif ? ` (${p.indicatif})` : ""}</option>)}
                </optgroup>
              ))}
            </select>
            {indicatif && (
              <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8 }}>{t(lang, "indicatif_associe")}{indicatif}</div>
            )}
            <input required value={ville} onChange={e => setVille(e.target.value)} placeholder={t(lang, "ville_label")}
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
            <input value={zone} onChange={e => setZone(e.target.value)} placeholder={t(lang, "quartier_zone")}
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 8, boxSizing: "border-box" }} />
            <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code d'une organisation (optionnel)"
              style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 4, boxSizing: "border-box" }} />
            <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 10 }}>
              Si une ONG ou une administration t'a communiqué un code, saisis-le ici pour qu'elle puisse t'assigner ses signalements. Laisse vide si tu ne participes à aucune organisation.
            </div>

            {erreur && <div role="alert" style={{ fontSize: 12.5, color: "#B5451B", background: "var(--c-danger-border-soft)", borderRadius: 10, padding: "9px 12px", marginBottom: 10 }}>{erreur}</div>}

            <button type="button" onClick={submit} disabled={busy} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
              {busy ? t(lang, "envoi_en_cours") : t(lang, "confirmer_inscription")}
            </button>
          </form>
          )}
        </ProfilGate>
      )}
    </div>
  );
}
