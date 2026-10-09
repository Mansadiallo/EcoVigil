import { useEffect, useMemo, useState } from "react";
import { ExportRow, colonnesSignalements, preparerLignesSignalements, rapportSignalements } from "../admin/AdminRapports.jsx";
import { AUDIT_LABELS } from "../admin/constants.js";
import { IconChevronLeft, IconLayers, IconPlus, IconRotateCcw, IconTrash, IconTree, IconUsers } from "../components/icons.jsx";
import { MediaThumbSmall, PhotoCaptureButton, uploadPhotoGeneric } from "../components/media.jsx";
import { Screen, SectionTitle } from "../components/ui.jsx";
import { OrgEnquetes } from "../enquetes/OrgEnquetes.jsx";
import { logActivity, logGroupeAudit } from "../lib/audit.js";
import { AFRICA_CENTER, LocationPrecision, ZoneReboisementMap } from "../lib/carteUtils.jsx";
import { categorieMeta, champTexte, uid } from "../lib/categories.jsx";
import { DEVICE_ID, supabase } from "../lib/supabase.js";
import { formatCoordonnees } from "../lib/utils.js";
import { EspaceSwitch } from "./Accueil.jsx";
import { PAYS_INDICATIFS } from "./Profil.jsx";
import { T, TITRE_SOUS } from "../lib/typo.jsx";

export function EspaceOrganisation({ organisationEmail, organisationUserId, onBack, coordFormat, peutBasculerBenevole }) {
  const [org, setOrg] = useState(null);
  const [signalements, setSignalements] = useState(null);
  const [defisNoms, setDefisNoms] = useState({});
  const [titreActu, setTitreActu] = useState("");
  const [contenuActu, setContenuActu] = useState("");
  const [urgentActu, setUrgentActu] = useState(false);
  const [busyActu, setBusyActu] = useState(false);
  const [messageActu, setMessageActu] = useState("");
  const [mesBenevoles, setMesBenevoles] = useState(null);
  const [benevolesDisponibles, setBenevolesDisponibles] = useState(null);
  const [benevolesAutresOrg, setBenevolesAutresOrg] = useState(null);
  const [busyAssign, setBusyAssign] = useState(null);
  const [mesArbres, setMesArbres] = useState(null);
  const [showFormArbre, setShowFormArbre] = useState(false);
  const [nomArbre, setNomArbre] = useState("");
  const [photoArbre, setPhotoArbre] = useState(null);
  const [busyArbre, setBusyArbre] = useState(false);
  const [erreurArbre, setErreurArbre] = useState("");
  const [gpsFixArbre, setGpsFixArbre] = useState(null);
  // Membres de l'organisation : le compte principal génère un code d'invitation (partageable
  // à la main ou via un lien WhatsApp pré-rempli). La personne invitée le saisit dans l'app,
  // ce qui la fait passer au statut 'actif' et lui donne accès à l'Espace Organisation, via
  // une session Supabase (éventuellement anonyme) — sans e-mail ni téléphone ni SMS.
  const [estProprietaire, setEstProprietaire] = useState(true);
  const [membresOrg, setMembresOrg] = useState(null);
  const [showFormMembre, setShowFormMembre] = useState(false);
  const [paysMembre, setPaysMembre] = useState("");
  const [telephoneMembre, setTelephoneMembre] = useState("");
  const [busyMembre, setBusyMembre] = useState(false);
  const [erreurMembre, setErreurMembre] = useState("");
  const [dernierMembreInvite, setDernierMembreInvite] = useState(null); // { code, telephone }
  const [busyRetraitMembreId, setBusyRetraitMembreId] = useState(null);
  // Zone à reboiser : l'organisation doit d'abord la définir (points de coordonnées formant un
  // polygone) avant de pouvoir enregistrer des arbres pour ses projets de reboisement. Persistée
  // localement par organisation (même logique que les zones dessinées sur la carte citoyenne :
  // "prêt pour la synchro serveur" plus tard, sans dépendre d'une table Supabase qui n'existe pas
  // encore pour cet usage précis).
  const [zoneReboisement, setZoneReboisement] = useState(undefined); // undefined = pas encore chargée
  const [showEditeurZone, setShowEditeurZone] = useState(false);
  const [pointsZoneTemp, setPointsZoneTemp] = useState([]);
  const [latPointTemp, setLatPointTemp] = useState("");
  const [lngPointTemp, setLngPointTemp] = useState("");
  const [gpsPointTemp, setGpsPointTemp] = useState(null);
  const [erreurZone, setErreurZone] = useState("");
  // Superficie renseignée manuellement par l'organisation (en plus des points de coordonnées) :
  // le contour donne une estimation, mais l'organisation doit déclarer la superficie réelle
  // (m² ou ha), par exemple issue d'un relevé topographique ou d'un titre foncier.
  const [superficieSaisie, setSuperficieSaisie] = useState("");
  const [uniteSuperficieSaisie, setUniteSuperficieSaisie] = useState("m2");
  // Projets & activités de l'organisation
  const [mesProjets, setMesProjets] = useState(null);
  const [showFormProjet, setShowFormProjet] = useState(false);
  const [nomProjet, setNomProjet] = useState("");
  const [descProjet, setDescProjet] = useState("");
  const [lieuProjet, setLieuProjet] = useState("");
  const [budgetProjet, setBudgetProjet] = useState("");
  const [dateDebutProjet, setDateDebutProjet] = useState("");
  const [dateFinProjet, setDateFinProjet] = useState("");
  const [busyProjet, setBusyProjet] = useState(false);
  const [erreurProjet, setErreurProjet] = useState("");
  const [projetOuvert, setProjetOuvert] = useState(null); // id du projet dont on affiche les activités
  const [activitesParProjet, setActivitesParProjet] = useState({}); // { [projet_id]: [...] }
  const [showFormActivite, setShowFormActivite] = useState(null); // id du projet pour lequel le formulaire est ouvert
  const [titreActivite, setTitreActivite] = useState("");
  const [descActivite, setDescActivite] = useState("");
  const [typeActivite, setTypeActivite] = useState("activite");
  const [dateActivite, setDateActivite] = useState("");
  const [busyActivite, setBusyActivite] = useState(false);
  // Groupes de terrain affiliés — un groupe demande l'affiliation en saisissant le code
  // d'inscription de l'organisation à sa création ; l'organisation n'a plus qu'à confirmer.
  const [demandesAffiliation, setDemandesAffiliation] = useState(null);
  const [groupesAffilies, setGroupesAffilies] = useState(null);
  const [busyAffiliationId, setBusyAffiliationId] = useState(null);
  const [erreurAffiliation, setErreurAffiliation] = useState("");
  const [groupeOuvertOrg, setGroupeOuvertOrg] = useState(null);
  const [detailGroupeOrg, setDetailGroupeOrg] = useState(null);
  const [showCreerGroupeOrg, setShowCreerGroupeOrg] = useState(false);
  const [nomGroupeOrg, setNomGroupeOrg] = useState("");
  const [descGroupeOrg, setDescGroupeOrg] = useState("");
  const [objectifGroupeOrg, setObjectifGroupeOrg] = useState("");
  const [busyCreerGroupeOrg, setBusyCreerGroupeOrg] = useState(false);
  const [erreurCreerGroupeOrg, setErreurCreerGroupeOrg] = useState("");
  const [assignationGroupe, setAssignationGroupe] = useState({}); // { [benevoleId]: groupeId }

  function creerGroupeOrg() {
    setErreurCreerGroupeOrg("");
    if (!nomGroupeOrg.trim()) { setErreurCreerGroupeOrg("Le nom du groupe est requis."); return; }
    setBusyCreerGroupeOrg(true);
    const groupeId = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : (uid() + "-" + uid());
    supabase.rpc("gt_groupe_creer_par_organisation", {
      p_id: groupeId, p_nom: nomGroupeOrg.trim(), p_description: descGroupeOrg.trim() || null, p_objectif: objectifGroupeOrg.trim() || null,
    }).then(({ error }) => {
      setBusyCreerGroupeOrg(false);
      if (error) { setErreurCreerGroupeOrg("Échec : " + (error.message || "erreur inconnue")); return; }
      setNomGroupeOrg(""); setDescGroupeOrg(""); setObjectifGroupeOrg(""); setShowCreerGroupeOrg(false);
      chargerGroupesAffilies(org);
    });
  }

  async function chargerDetailGroupeOrg(groupeId) {
    const [{ data: mi }, { data: log }] = await Promise.all([
      supabase.from("gt_missions").select("*").eq("groupe_id", groupeId).order("created_at", { ascending: false }).limit(10),
      supabase.from("gt_audit_log").select("*").eq("groupe_id", groupeId).order("created_at", { ascending: false }).limit(10),
    ]);
    setDetailGroupeOrg({ missions: mi || [], log: log || [] });
  }
  async function ouvrirGroupeOrg(groupeId) {
    if (groupeOuvertOrg === groupeId) { setGroupeOuvertOrg(null); return; }
    setGroupeOuvertOrg(groupeId);
    setDetailGroupeOrg(null);
    await chargerDetailGroupeOrg(groupeId);
  }
  // Même logique de rafraîchissement que côté groupe (toutes les 15s) : sans ça, une organisation
  // qui garde un groupe ouvert à l'écran ne verrait une mission terminée qu'en le refermant puis
  // le rouvrant.
  useEffect(() => {
    if (!groupeOuvertOrg) return;
    const t = setInterval(() => chargerDetailGroupeOrg(groupeOuvertOrg), 15000);
    return () => clearInterval(t);
  }, [groupeOuvertOrg]);

  // Un gouvernement garde ses pleins droits (accès non restreint, comme avant cette
  // fonctionnalité) ; une ONG doit d'abord s'assigner des bénévoles pour voir leurs signalements.
  const estGouvernement = org && org.type === "gouvernement";

  async function chargerBenevoles(orgData) {
    if (!orgData) return;
    // Seuls les bénévoles éligibles (ayant saisi le code de cette organisation à leur
    // inscription) apparaissent ici — jamais un bénévole indépendant. Un gouvernement garde
    // ses pleins droits et voit tous les bénévoles.
    const req = orgData.type === "gouvernement"
      ? supabase.from("benevoles").select("*").eq("is_deleted", false).order("created_at", { ascending: false })
      : supabase.from("benevoles").select("*").eq("is_deleted", false).eq("organisation_code_id", orgData.id).order("created_at", { ascending: false });
    const { data } = await req;
    const tous = data || [];
    // "Disponibles" = réellement non assignés (organisation_id vide) : on ne propose jamais
    // à une organisation d'assigner un bénévole déjà rattaché à une autre — cohérent avec la
    // garde posée côté base de données, qui refuserait de toute façon un tel transfert.
    setMesBenevoles(tous.filter(b => b.organisation_id === orgData.id));
    setBenevolesDisponibles(tous.filter(b => !b.organisation_id));
    setBenevolesAutresOrg(tous.filter(b => b.organisation_id && b.organisation_id !== orgData.id));
  }

  async function chargerArbres(orgData) {
    if (!orgData) return;
    const { data } = await supabase.from("arbres").select("*").eq("organisation_id", orgData.id).order("created_at", { ascending: false });
    setMesArbres(data || []);
  }

  async function chargerProjets(orgData) {
    if (!orgData) return;
    const { data } = await supabase.from("org_projets").select("*").eq("organisation_id", orgData.id).eq("is_archived", false).order("created_at", { ascending: false });
    setMesProjets(data || []);
  }

  async function chargerGroupesAffilies(orgData) {
    if (!orgData) return;
    const { data } = await supabase.from("gt_groupes").select("*").eq("organisation_id", orgData.id).eq("is_deleted", false).order("created_at", { ascending: false });
    const tous = data || [];
    setDemandesAffiliation(tous.filter(g => !g.organisation_confirmee));
    setGroupesAffilies(tous.filter(g => g.organisation_confirmee));
  }

  function confirmerAffiliation(groupeId) {
    setErreurAffiliation("");
    setBusyAffiliationId(groupeId);
    supabase.from("gt_groupes").update({ organisation_confirmee: true }).eq("id", groupeId).eq("organisation_id", org.id)
      .then(({ error }) => {
        setBusyAffiliationId(null);
        if (error) { setErreurAffiliation("Échec : " + (error.message || "erreur inconnue")); return; }
        logGroupeAudit(groupeId, "affiliation_confirmee", "organisations", org.id, org.nom);
        chargerGroupesAffilies(org);
      });
  }

  async function refuserAffiliation(groupeId) {
    if (!confirm("Refuser cette demande d'affiliation ?")) return;
    // On journalise avant de retirer organisation_id : une fois le lien coupé, l'organisation
    // n'a plus le droit d'écrire dans le journal de ce groupe (cohérent avec la policy RLS).
    await logGroupeAudit(groupeId, "affiliation_refusee", "organisations", org.id, org.nom);
    await supabase.from("gt_groupes").update({ organisation_id: null, organisation_confirmee: false }).eq("id", groupeId);
    chargerGroupesAffilies(org);
  }

  async function retirerAffiliation(groupeId) {
    if (!confirm("Retirer l'affiliation de ce groupe ?")) return;
    await logGroupeAudit(groupeId, "affiliation_retiree", "organisations", org.id, org.nom);
    await supabase.from("gt_groupes").update({ organisation_id: null, organisation_confirmee: false }).eq("id", groupeId);
    chargerGroupesAffilies(org);
  }

  async function chargerActivites(projetId) {
    const { data } = await supabase.from("org_activites").select("*").eq("projet_id", projetId).order("date_debut", { ascending: false });
    setActivitesParProjet(prev => ({ ...prev, [projetId]: data || [] }));
  }

  function creerProjet() {
    setErreurProjet("");
    if (!nomProjet.trim()) { setErreurProjet("Le nom du projet est requis."); return; }
    setBusyProjet(true);
    supabase.from("org_projets").insert({
      organisation_id: org.id, nom: nomProjet.trim(), description: descProjet.trim() || null,
      localisation_texte: lieuProjet.trim() || null,
      budget: budgetProjet.trim() ? Number(budgetProjet.trim()) : null,
      date_debut: dateDebutProjet || null, date_fin: dateFinProjet || null,
      responsable: organisationEmail, created_by: organisationEmail,
    }).then(({ error }) => {
      setBusyProjet(false);
      if (error) { setErreurProjet("Échec de l'enregistrement : " + (error.message || "erreur inconnue")); return; }
      setNomProjet(""); setDescProjet(""); setLieuProjet(""); setBudgetProjet(""); setDateDebutProjet(""); setDateFinProjet("");
      setShowFormProjet(false);
      chargerProjets(org);
    });
  }

  function ouvrirProjet(projetId) {
    if (projetOuvert === projetId) { setProjetOuvert(null); return; }
    setProjetOuvert(projetId);
    if (!activitesParProjet[projetId]) chargerActivites(projetId);
  }

  function creerActivite(projetId) {
    if (!titreActivite.trim() || !dateActivite) return;
    setBusyActivite(true);
    supabase.from("org_activites").insert({
      organisation_id: org.id, projet_id: projetId, titre: titreActivite.trim(),
      description: descActivite.trim() || null, type: typeActivite,
      date_debut: new Date(dateActivite).toISOString(), created_by: organisationEmail,
    }).then(({ error }) => {
      setBusyActivite(false);
      if (error) { alert("Échec de l'enregistrement : " + (error.message || "erreur inconnue")); return; }
      setTitreActivite(""); setDescActivite(""); setTypeActivite("activite"); setDateActivite("");
      setShowFormActivite(null);
      chargerActivites(projetId);
    });
  }

  async function changerStatutProjet(p, statut) {
    const { error } = await supabase.from("org_projets").update({ statut }).eq("id", p.id);
    if (error) { alert("Action refusée par le serveur."); return; }
    chargerProjets(org);
  }

  // ===== Zone à reboiser (superficie définie par des points de coordonnées) =====
  // Partagée entre tous les membres actifs de l'organisation (table org_zone_reboisement) :
  // une fois définie par le créateur du compte, les autres membres n'ont plus à la redéfinir.
  async function chargerZoneReboisement(orgData) {
    const { data, error } = await supabase.from("org_zone_reboisement").select("*").eq("organisation_id", orgData.id).maybeSingle();
    if (error) { setZoneReboisement(null); return; }
    setZoneReboisement(data ? { points: data.points, superficie_m2: data.superficie_m2, superficie_estimee_m2: data.superficie_estimee_m2, unite_saisie: data.unite_saisie, defini_par: data.defini_par, date: data.updated_at } : null);
  }
  function superficieDesPoints(points) {
    if (points.length < 3) return 0;
    try { return L.GeometryUtil.geodesicArea(points); } catch (e) { return 0; }
  }
  const superficieTempM2 = useMemo(() => superficieDesPoints(pointsZoneTemp), [pointsZoneTemp]);
  function formatSuperficie(m2) {
    return m2 >= 10000 ? `${(m2 / 10000).toFixed(2)} ha` : `${Math.round(m2)} m²`;
  }
  function ajouterPointManuel() {
    setErreurZone("");
    const lat = Number(latPointTemp), lng = Number(lngPointTemp);
    if (!latPointTemp.trim() || !lngPointTemp.trim() || Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setErreurZone("Coordonnées invalides."); return;
    }
    setPointsZoneTemp(prev => [...prev, { lat, lng }]);
    setLatPointTemp(""); setLngPointTemp("");
  }
  function ajouterPointDepuisGps() {
    if (!gpsPointTemp) { setErreurZone("En attente d'un signal GPS."); return; }
    setErreurZone("");
    setPointsZoneTemp(prev => [...prev, { lat: gpsPointTemp.lat, lng: gpsPointTemp.lng }]);
  }
  function retirerPoint(index) {
    setPointsZoneTemp(prev => prev.filter((_, i) => i !== index));
  }
  function superficieSaisieEnM2() {
    const val = Number(String(superficieSaisie).replace(",", "."));
    if (!superficieSaisie.trim() || Number.isNaN(val) || val <= 0) return null;
    return uniteSuperficieSaisie === "ha" ? val * 10000 : val;
  }
  function ouvrirEditeurZone() {
    setPointsZoneTemp(zoneReboisement ? zoneReboisement.points : []);
    setErreurZone("");
    if (zoneReboisement && zoneReboisement.superficie_m2) {
      const unite = zoneReboisement.unite_saisie || "m2";
      const valeur = unite === "ha" ? zoneReboisement.superficie_m2 / 10000 : zoneReboisement.superficie_m2;
      setUniteSuperficieSaisie(unite);
      setSuperficieSaisie(String(Number(valeur.toFixed(2))));
    } else {
      setUniteSuperficieSaisie("m2");
      setSuperficieSaisie("");
    }
    setShowEditeurZone(true);
  }
  async function enregistrerZoneReboisement() {
    setErreurZone("");
    if (pointsZoneTemp.length < 4) { setErreurZone("Il faut au moins 4 points pour délimiter une surface."); return; }
    const superficieM2 = superficieSaisieEnM2();
    if (superficieM2 === null) { setErreurZone("Merci de renseigner la superficie à reboiser (m² ou ha)."); return; }
    const { error } = await supabase.from("org_zone_reboisement").upsert({
      organisation_id: org.id, points: pointsZoneTemp, superficie_m2: superficieM2,
      superficie_estimee_m2: superficieTempM2, unite_saisie: uniteSuperficieSaisie,
      defini_par: organisationEmail, updated_at: new Date().toISOString(),
    }, { onConflict: "organisation_id" });
    if (error) { setErreurZone("Impossible d'enregistrer la surface pour le moment : " + (error.message || "erreur inconnue")); return; }
    setZoneReboisement({ points: pointsZoneTemp, superficie_m2: superficieM2, superficie_estimee_m2: superficieTempM2, unite_saisie: uniteSuperficieSaisie, defini_par: organisationEmail, date: new Date().toISOString() });
    setShowEditeurZone(false);
    logActivity("zone_reboisement_definie", "organisations", org.id, `${pointsZoneTemp.length} points, ${formatSuperficie(superficieM2)}`);
  }

  async function supprimerZoneReboisement() {
    if (!confirm("Supprimer définitivement la surface à reboiser ? Elle ne réapparaîtra pas tant qu'un membre ne la redéfinira pas, et il faudra la redéfinir avant de pouvoir enregistrer de nouveaux arbres.")) return;
    setErreurZone("");
    const { error } = await supabase.from("org_zone_reboisement").delete().eq("organisation_id", org.id);
    if (error) { setErreurZone("Impossible de supprimer la surface pour le moment : " + (error.message || "erreur inconnue")); return; }
    setZoneReboisement(null);
    setShowEditeurZone(false);
    logActivity("zone_reboisement_supprimee", "organisations", org.id, organisationEmail);
  }

  async function chargerMembres(orgData) {
    if (!orgData) return;
    const { data } = await supabase.from("org_membres").select("*").eq("organisation_id", orgData.id).neq("statut", "retire").order("created_at", { ascending: false });
    setMembresOrg(data || []);
  }

  async function inviterMembre() {
    setErreurMembre(""); setDernierMembreInvite(null);
    const indicatif = (PAYS_INDICATIFS.find(p => p.pays === paysMembre) || {}).indicatif || "";
    let telephone = telephoneMembre.trim().replace(/\s+/g, "");
    if (telephone && !telephone.startsWith("+")) telephone = indicatif ? `${indicatif}${telephone}` : telephone;
    // Le téléphone est optionnel : il ne sert qu'à construire le lien WhatsApp ci-dessous, pas
    // à authentifier le membre — c'est le code d'invitation qui joue ce rôle.
    setBusyMembre(true);
    const { data, error } = await supabase.rpc("org_membre_inviter", { p_libelle: telephone || null });
    setBusyMembre(false);
    if (error) {
      const msg = error.message || "";
      setErreurMembre(
        /organisation_non_validee/.test(msg) ? "Seule une organisation validée peut ajouter des membres." :
        "Impossible d'ajouter ce membre pour le moment."
      );
      return;
    }
    const code = data && data[0] && data[0].code;
    setPaysMembre(""); setTelephoneMembre("");
    setDernierMembreInvite({ code, telephone });
    logActivity("membre_organisation_invite", "organisations", org.id, code);
    chargerMembres(org);
  }

  function lienInvitationMembre(code) {
    return `${window.location.origin}${window.location.pathname}?membre_code=${encodeURIComponent(code)}`;
  }
  function ouvrirWhatsappInvitation(code, telephone) {
    const texte = `Tu es invité(e) à rejoindre notre organisation sur EcoVigil. Ouvre ce lien et connecte-toi avec ton code d'invitation : ${lienInvitationMembre(code)} (code : ${code})`;
    const numero = (telephone || "").replace(/[^0-9]/g, "");
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(texte)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  async function retirerMembre(m) {
    setBusyRetraitMembreId(m.id);
    const { error } = await supabase.rpc("org_membre_retirer", { p_membre_id: m.id });
    setBusyRetraitMembreId(null);
    if (!error) {
      logActivity("membre_organisation_retire", "organisations", org.id, m.telephone || m.email || m.code || m.id);
      chargerMembres(org);
    }
  }

  async function charger() {
    // Le compte principal se connecte toujours par e-mail ; sans e-mail de session (cas d'un
    // membre confirmé par code d'invitation, identifié par user_id — session possiblement
    // anonyme), on saute directement à la recherche via org_membres.
    let orgData = null;
    if (organisationEmail) {
      const res = await supabase.from("organisations").select("*").eq("email", organisationEmail).eq("is_deleted", false).order("created_at", { ascending: false }).limit(1).maybeSingle();
      orgData = res.data;
    }
    let proprietaire = true;
    if (!orgData) {
      // Pas le compte principal : vérifie s'il s'agit d'un membre confirmé (statut 'actif'),
      // identifié par e-mail (tout premiers membres) ou par user_id (membres par code).
      let membreQuery = supabase.from("org_membres").select("organisation_id").eq("statut", "actif").limit(1);
      membreQuery = organisationEmail ? membreQuery.eq("email", organisationEmail) : membreQuery.eq("user_id", organisationUserId);
      const { data: membreData } = organisationEmail || organisationUserId ? await membreQuery.maybeSingle() : { data: null };
      if (membreData) {
        const { data: orgViaMembre } = await supabase.from("organisations").select("*").eq("id", membreData.organisation_id).eq("is_deleted", false).maybeSingle();
        orgData = orgViaMembre;
        proprietaire = false;
      }
    }
    if (!orgData) return;
    setEstProprietaire(proprietaire);
    setOrg(orgData);
    chargerBenevoles(orgData);
    chargerArbres(orgData);
    chargerProjets(orgData);
    chargerGroupesAffilies(orgData);
    chargerZoneReboisement(orgData);
    chargerMembres(orgData);
    const [{ data: problemes }, { data: defis }] = await Promise.all([
      supabase.from("env_problemes").select("code, defi_id"),
      supabase.from("env_defis").select("id, nom").in("id", orgData.defis && orgData.defis.length ? orgData.defis : ["00000000-0000-0000-0000-000000000000"]),
    ]);
    const idxNoms = {};
    (defis || []).forEach(d => { idxNoms[d.id] = champTexte(d.nom) || d.id; });
    setDefisNoms(idxNoms);
    const codesDomaine = (problemes || []).filter(p => (orgData.defis || []).includes(p.defi_id)).map(p => p.code);
    if (codesDomaine.length === 0) { setSignalements([]); return; }
    let requete = supabase.from("signalements").select("*").in("categorie", codesDomaine).eq("is_deleted", false).order("created_at", { ascending: false }).limit(300);
    // Un citoyen bénévole indépendant (non assigné à une organisation) reste hors de la vue
    // "Espace organisation" d'une ONG — ses signalements restent les siens. Le gouvernement,
    // lui, garde ses pleins droits et voit tout, comme avant cette fonctionnalité.
    if (orgData.type !== "gouvernement") {
      const { data: mesB } = await supabase.from("benevoles").select("id").eq("organisation_id", orgData.id).eq("is_deleted", false);
      const ids = (mesB || []).map(b => b.id);
      if (ids.length === 0) { setSignalements([]); return; }
      requete = requete.in("benevole_id", ids);
    }
    const { data: sigs } = await requete;
    setSignalements(sigs || []);
  }
  useEffect(() => { charger(); }, [organisationEmail, organisationUserId]);

  async function assignerBenevole(b) {
    const groupeId = assignationGroupe[b.id];
    if (!groupeId) { alert("Choisis d'abord un groupe de terrain pour ce bénévole."); return; }
    setBusyAssign(b.id);
    const { error } = await supabase.rpc("benevole_assigner_groupe", { p_benevole_id: b.id, p_groupe_id: groupeId });
    setBusyAssign(null);
    if (!error) {
      setAssignationGroupe(prev => { const next = { ...prev }; delete next[b.id]; return next; });
      charger();
      chargerGroupesAffilies(org);
    } else {
      alert("Action refusée par le serveur (ce bénévole est peut-être déjà assigné ailleurs, ou le groupe choisi n'existe plus).");
    }
  }
  async function retirerBenevole(b) {
    setBusyAssign(b.id);
    // Retire aussi le bénévole des groupes de cette organisation : l'appartenance au groupe
    // découlait de l'affiliation, elle ne doit pas y survivre.
    const { error } = await supabase.rpc("benevole_retirer_organisation", { p_benevole_id: b.id });
    setBusyAssign(null);
    if (!error) { charger(); chargerGroupesAffilies(org); } else { alert("Action refusée par le serveur."); }
  }

  async function resoudre(s) {
    const { error } = await supabase.from("signalements").update({ statut: "resolu" }).eq("id", s.id);
    if (!error) {
      charger();
      if (s.device_id) {
        supabase.from("notifications").insert({
          destinataire: s.device_id,
          message: `Ton signalement a été résolu par ${org.nom || "une organisation partenaire"}.`,
          lien: "carte",
        }).catch(() => {});
      }
    } else alert("Action refusée par le serveur.");
  }
  async function valider(s) {
    const { error } = await supabase.from("signalements").update({ valide: true }).eq("id", s.id);
    if (!error) {
      charger();
      if (s.device_id) {
        supabase.from("notifications").insert({
          destinataire: s.device_id,
          message: "Ton signalement a été validé et pris en compte par l'équipe.",
          lien: "carte",
        }).catch(() => {});
      }
    } else alert("Action refusée par le serveur.");
  }

  async function publierActualite(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!titreActu.trim() || !contenuActu.trim()) return;
    setBusyActu(true); setMessageActu("");
    const { error } = await supabase.from("actualites").insert({
      titre: titreActu.trim(), contenu: contenuActu.trim(), urgent: urgentActu,
      auteur_organisation_id: org.id, auteur_nom: org.nom,
    }).returning(false);
    setBusyActu(false);
    if (error) { setMessageActu("Échec : " + (error.message || "erreur inconnue")); return; }
    setTitreActu(""); setContenuActu(""); setUrgentActu(false);
    setMessageActu("Actualité publiée.");
  }

  async function toggleSuppressionArbreOrg(a) {
    if (a.is_deleted) {
      const { error } = await supabase.from("arbres").update({ is_deleted: false, deleted_at: null, deleted_by: null }).eq("id", a.id);
      if (error) { alert("Restauration refusée par le serveur."); return; }
    } else {
      if (!confirm(`Retirer "${a.nom || "cet arbre"}" de vos plantations (ex. faux arbre planté par erreur) ? Il pourra être restauré ensuite.`)) return;
      const { error } = await supabase.from("arbres").update({ is_deleted: true, deleted_at: new Date().toISOString(), deleted_by: organisationEmail }).eq("id", a.id);
      if (error) { alert("Suppression refusée par le serveur."); return; }
    }
    chargerArbres(org);
  }
  function planterArbreOrganisation() {
    setErreurArbre("");
    if (!nomArbre.trim()) { setErreurArbre("Le nom/l'essence de l'arbre est requis."); return; }
    const finalize = async (lat, lng) => {
      setBusyArbre(true);
      try {
        const photo_url = await uploadPhotoGeneric(photoArbre, "arbres");
        const { error } = await supabase.from("arbres").insert({
          nom: nomArbre.trim(), photo_url, lat, lng,
          organisation_id: org.id, device_id: DEVICE_ID,
          valide: false, publie: false, is_deleted: false,
        });
        if (error) throw error;
        setNomArbre(""); setPhotoArbre(null); setShowFormArbre(false); setGpsFixArbre(null);
        chargerArbres(org);
      } catch (err) {
        setErreurArbre("Échec de l'enregistrement : " + (err.message || "erreur inconnue"));
      } finally {
        setBusyArbre(false);
      }
    };
    if (gpsFixArbre && gpsFixArbre.lat != null && gpsFixArbre.lng != null) {
      finalize(gpsFixArbre.lat, gpsFixArbre.lng);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => finalize(pos.coords.latitude, pos.coords.longitude),
        () => finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]),
        { timeout: 6000, enableHighAccuracy: true }
      );
    } else {
      finalize(AFRICA_CENTER[0], AFRICA_CENTER[1]);
    }
  }

  if (!org) return <Screen><div style={{ textAlign: "center", padding: 40, color: "var(--c-text-muted)" }}>Chargement…</div></Screen>;

  const rowsExport = signalements || [];

  return (
    <Screen>
      {peutBasculerBenevole && <EspaceSwitch actif="organisation" onBenevole={onBack} onOrganisation={() => {}} />}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <button onClick={onBack} style={{ padding: 8, borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer" }}><IconChevronLeft size={16} /></button>
        <SectionTitle sub={org.type === "ong" ? "Espace ONG" : "Espace Gouvernement"}>{org.nom}</SectionTitle>
      </div>

      <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 14 }}>
        Domaine(s) : {(org.defis || []).map(id => defisNoms[id] || id).join(", ") || "aucun"}
      </div>

      {estProprietaire && (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <IconUsers size={15} color="var(--c-accent-dark)" />
              <div style={{ fontSize: T.body, fontWeight: 600 }}>Membres de l'organisation</div>
            </div>
            {!showFormMembre && (
              <button onClick={() => { setShowFormMembre(true); setErreurMembre(""); }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
                <IconPlus size={13} /> Ajouter un membre
              </button>
            )}
          </div>
          <div style={{ fontSize: T.meta, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
            Génère un code d'invitation pour un membre : il le saisit dans l'app (« Membre invité par une organisation ? Saisir mon code ») pour accéder à cet Espace Organisation — aucun e-mail ni SMS requis. Le numéro de téléphone est optionnel, il sert juste à préremplir un message WhatsApp.
          </div>

          {showFormMembre && (
            <div style={{ marginBottom: 10 }}>
              {!dernierMembreInvite ? (
                <>
                  <select value={paysMembre} onChange={e => setPaysMembre(e.target.value)}
                    style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 6, boxSizing: "border-box", background: "var(--c-surface)", color: paysMembre ? "var(--c-text)" : "var(--c-text-muted)" }}>
                    <option value="">Pays (optionnel, pour l'indicatif)</option>
                    {Object.entries(PAYS_INDICATIFS.reduce((acc, p) => { (acc[p.region] = acc[p.region] || []).push(p); return acc; }, {})).map(([region, list]) => (
                      <optgroup key={region} label={region}>
                        {list.map(p => <option key={p.pays} value={p.pays}>{p.pays}{p.indicatif ? ` (${p.indicatif})` : ""}</option>)}
                      </optgroup>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                    <input value={telephoneMembre} onChange={e => setTelephoneMembre(e.target.value)} inputMode="tel"
                      placeholder={(PAYS_INDICATIFS.find(p => p.pays === paysMembre) || {}).indicatif ? `Téléphone du membre (${(PAYS_INDICATIFS.find(p => p.pays === paysMembre) || {}).indicatif}) — optionnel` : "Téléphone du membre — optionnel"}
                      style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, boxSizing: "border-box" }} />
                    <button onClick={inviterMembre} disabled={busyMembre} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer", whiteSpace: "nowrap" }}>
                      {busyMembre ? "…" : "Générer le code"}
                    </button>
                  </div>
                  <button onClick={() => { setShowFormMembre(false); setErreurMembre(""); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer", padding: 0 }}>
                    Annuler
                  </button>
                  {erreurMembre && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginTop: 6 }}>{erreurMembre}</div>}
                </>
              ) : (
                <div style={{ background: "var(--c-bg)", borderRadius: 10, padding: 12 }}>
                  <div style={{ fontSize: T.meta, color: "var(--c-text-secondary)", marginBottom: 6 }}>Code d'invitation généré :</div>
                  <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: 2, marginBottom: 10, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>{dernierMembreInvite.code}</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                    <button onClick={() => { navigator.clipboard && navigator.clipboard.writeText(dernierMembreInvite.code); }} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
                      Copier le code
                    </button>
                    {dernierMembreInvite.telephone && (
                      <button onClick={() => ouvrirWhatsappInvitation(dernierMembreInvite.code, dernierMembreInvite.telephone)} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: "#25D366", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
                        Envoyer sur WhatsApp
                      </button>
                    )}
                  </div>
                  <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 10 }}>
                    Transmets ce code au membre par le canal de ton choix s'il ne le reçoit pas directement via WhatsApp.
                  </div>
                  <button onClick={() => { setShowFormMembre(false); setDernierMembreInvite(null); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer", padding: 0 }}>
                    Fermer
                  </button>
                </div>
              )}
            </div>
          )}

          {membresOrg === null ? (
            <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Chargement…</div>
          ) : membresOrg.length === 0 ? (
            <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Aucun membre ajouté pour le moment.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {membresOrg.map(m => (
                <div key={m.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-bg)", borderRadius: 10, padding: "8px 10px" }}>
                  <div style={{ fontSize: T.small }}>
                    {m.telephone || m.email || <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>{m.code}</span>}
                    <span style={{ marginLeft: 8, fontSize: T.meta, fontWeight: 700, padding: "2px 7px", borderRadius: 999, color: "#fff", background: m.statut === "actif" ? "var(--c-accent)" : "var(--c-warning)" }}>
                      {m.statut === "actif" ? "Actif" : "En attente"}
                    </span>
                  </div>
                  <button onClick={() => retirerMembre(m)} disabled={busyRetraitMembreId === m.id} aria-label="Retirer" style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 4 }}>
                    <IconTrash size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <IconTree size={16} /> Reboisement — Mon Arbre
      </div>
      <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10 }}>
        Enregistre les arbres plantés dans le cadre de vos projets de reboisement. Chaque arbre est
        associé à {org.nom} et passe en attente de validation par l'administration EcoVigil, comme pour
        les plantations citoyennes.
      </div>

      {/* Étape préalable obligatoire : la surface à reboiser doit être définie (au moins 4 points
          de coordonnées formant un polygone) avant de pouvoir enregistrer des arbres. */}
      <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <IconLayers size={15} color="var(--c-accent-dark)" />
          <div style={{ fontSize: T.body, fontWeight: 600 }}>Surface à reboiser</div>
        </div>

        {zoneReboisement === undefined ? (
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Chargement…</div>
        ) : !showEditeurZone && zoneReboisement ? (
          <div>
            <div style={{ fontSize: T.body, marginBottom: 4 }}>
              Superficie déclarée : <b>{formatSuperficie(zoneReboisement.superficie_m2)}</b> ({zoneReboisement.points.length} points)
            </div>
            {typeof zoneReboisement.superficie_estimee_m2 === "number" && (
              <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 2 }}>
                Estimation d'après le contour : {formatSuperficie(zoneReboisement.superficie_estimee_m2)}
              </div>
            )}
            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 10 }}>
              Définie le {new Date(zoneReboisement.date).toLocaleDateString("fr-FR")}
            </div>
            <ZoneReboisementMap points={zoneReboisement.points} superficieAffichee={formatSuperficie(zoneReboisement.superficie_m2)} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={ouvrirEditeurZone} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
                Redéfinir la surface
              </button>
              <button onClick={supprimerZoneReboisement} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
                Supprimer définitivement
              </button>
            </div>
          </div>
        ) : !showEditeurZone && !zoneReboisement ? (
          <div>
            <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
              Avant d'enregistrer des arbres, définissez la surface à reboiser en plaçant au moins 4 points de coordonnées délimitant son contour, puis renseignez la superficie réelle du terrain (m² ou ha).
            </div>
            <button onClick={ouvrirEditeurZone} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "9px 14px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
              <IconPlus size={15} /> Définir la surface à reboiser
            </button>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10, lineHeight: 1.5 }}>
              Ajoutez au moins 4 points de coordonnées pour délimiter le contour de la surface.
            </div>

            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
              <input value={latPointTemp} onChange={e => setLatPointTemp(e.target.value)} placeholder="Latitude" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, boxSizing: "border-box" }} />
              <input value={lngPointTemp} onChange={e => setLngPointTemp(e.target.value)} placeholder="Longitude" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, boxSizing: "border-box" }} />
              <button onClick={ajouterPointManuel} style={{ padding: "8px 12px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer", whiteSpace: "nowrap" }}>
                Ajouter
              </button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsPointTemp} compact />
              <button onClick={ajouterPointDepuisGps} disabled={!gpsPointTemp} style={{ marginTop: 6, padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: gpsPointTemp ? "var(--c-text)" : "var(--c-text-faint)", fontWeight: 600, fontSize: T.small, cursor: gpsPointTemp ? "pointer" : "default" }}>
                Ajouter ma position actuelle comme point
              </button>
            </div>

            {erreurZone && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 8 }}>{erreurZone}</div>}

            {pointsZoneTemp.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
                {pointsZoneTemp.map((p, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--c-bg)", borderRadius: 8, padding: "6px 10px", fontSize: T.small }}>
                    <span style={{ fontVariantNumeric: "tabular-nums" }}>Point {i + 1} — {formatCoordonnees(p.lat, p.lng, coordFormat)}</span>
                    <button onClick={() => retirerPoint(i)} aria-label="Retirer" style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", padding: 2 }}><IconTrash size={13} /></button>
                  </div>
                ))}
              </div>
            )}

            {pointsZoneTemp.length >= 3 && (
              <ZoneReboisementMap
                points={pointsZoneTemp}
                superficieAffichee={formatSuperficie(superficieSaisieEnM2() ?? superficieTempM2)}
              />
            )}

            <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 8 }}>
              Estimation d'après le contour {pointsZoneTemp.length < 4 ? "(ajoutez au moins 4 points)" : ""} : {formatSuperficie(superficieTempM2)}
            </div>

            <div style={{ fontSize: T.body, fontWeight: 600, marginBottom: 6 }}>
              Superficie à reboiser (obligatoire)
            </div>
            <div style={{ fontSize: T.meta, color: "var(--c-text-secondary)", marginBottom: 8, lineHeight: 1.5 }}>
              Renseignez la superficie réelle du terrain (ex. relevé topographique ou titre foncier) ; l'estimation ci-dessus n'est qu'indicative.
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
              <input value={superficieSaisie} onChange={e => setSuperficieSaisie(e.target.value)} placeholder="Superficie" inputMode="decimal"
                style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, boxSizing: "border-box" }} />
              <select value={uniteSuperficieSaisie} onChange={e => setUniteSuperficieSaisie(e.target.value)}
                style={{ padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, background: "var(--c-surface)", color: "var(--c-text)" }}>
                <option value="m2">m²</option>
                <option value="ha">ha</option>
              </select>
            </div>

            <button onClick={enregistrerZoneReboisement} disabled={pointsZoneTemp.length < 4 || !superficieSaisie.trim()} style={{
              padding: "9px 14px", borderRadius: 10, border: "none",
              background: (pointsZoneTemp.length < 4 || !superficieSaisie.trim()) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body,
              cursor: (pointsZoneTemp.length < 4 || !superficieSaisie.trim()) ? "default" : "pointer", marginRight: 8 }}>
              Enregistrer la surface
            </button>
            <button onClick={() => setShowEditeurZone(false)} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
              Annuler
            </button>
          </div>
        )}
      </div>

      {!showFormArbre && zoneReboisement && (
        <button onClick={() => setShowFormArbre(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 14 }}>
          <IconPlus size={16} /> Enregistrer un arbre planté
        </button>
      )}

      {showFormArbre && (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
          <PhotoCaptureButton photo={photoArbre} onChange={setPhotoArbre} label="Ajouter une photo (optionnel)" previewMaxHeight={130} />
          <input value={nomArbre} onChange={e => setNomArbre(e.target.value)} placeholder="Essence / nom de l'arbre (ex : Manguier, Teck…)"
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 10, boxSizing: "border-box" }} />
          {erreurArbre && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 10 }}>{erreurArbre}</div>}
          <LocationPrecision coordFormat={coordFormat} onUpdate={setGpsFixArbre} compact />
          <button onClick={planterArbreOrganisation} disabled={busyArbre || !nomArbre.trim()} style={{
            padding: "9px 14px", borderRadius: 10, border: "none",
            background: (!nomArbre.trim()) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body,
            cursor: (!nomArbre.trim()) ? "default" : "pointer", marginRight: 8 }}>
            {busyArbre ? "…" : "Enregistrer"}
          </button>
          <button onClick={() => { setShowFormArbre(false); setErreurArbre(""); setNomArbre(""); setPhotoArbre(null); setGpsFixArbre(null); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}

      {mesArbres === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, marginBottom: 20 }}>Chargement…</div>
      ) : mesArbres.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, padding: 16, marginBottom: 20 }}>Aucun arbre enregistré pour vos projets de reboisement pour le moment.</div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 8 }}>
            {mesArbres.length} arbre(s) — {mesArbres.filter(a => a.valide).length} validé(s), {mesArbres.filter(a => !a.valide).length} en attente
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {mesArbres.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--c-surface)", borderRadius: 10, padding: "8px 10px", border: "1px solid var(--c-border)", opacity: a.is_deleted ? 0.55 : 1 }}>
                {a.photo_url ? <MediaThumbSmall src={a.photo_url} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} /> : <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--c-surface-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><IconTree size={16} color="var(--c-text-muted)" /></div>}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: T.body, fontWeight: 600 }}>{a.nom}</div>
                  <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{new Date(a.created_at).toLocaleDateString("fr-FR")}</div>
                </div>
                <span style={{ fontSize: T.meta, fontWeight: 700, color: a.is_deleted ? "#B5451B" : (a.valide ? "#fff" : "var(--c-text-muted)"), background: a.is_deleted ? "var(--c-danger-bg-soft, #fbe4de)" : (a.valide ? "var(--c-accent)" : "var(--c-surface-soft)"), borderRadius: 999, padding: "3px 8px", flexShrink: 0 }}>
                  {a.is_deleted ? "Supprimé" : (a.valide ? "Validé" : "En attente")}
                </span>
                <button onClick={() => toggleSuppressionArbreOrg(a)} aria-label={a.is_deleted ? "Restaurer" : "Supprimer"} title={a.is_deleted ? "Restaurer" : "Retirer (faux arbre)"} style={{ background: "none", border: `1px solid ${a.is_deleted ? "var(--c-border)" : "var(--c-danger-border-soft)"}`, borderRadius: 8, color: a.is_deleted ? "var(--c-accent-dark)" : "#B5451B", cursor: "pointer", padding: 6, flexShrink: 0 }}>
                  {a.is_deleted ? <IconRotateCcw size={14} /> : <IconTrash size={14} />}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
        <IconLayers size={16} /> Projets & activités
      </div>
      <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10 }}>
        Structurez le travail de {org.nom} en projets (ex. reboisement d'un site, campagne de sensibilisation)
        et consignez les activités menées sous chacun — utile pour vos rapports internes et vos partenaires.
      </div>

      {!showFormProjet && (
        <button onClick={() => setShowFormProjet(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "10px 14px", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 14 }}>
          <IconPlus size={16} /> Nouveau projet
        </button>
      )}

      {showFormProjet && (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 14 }}>
          <input value={nomProjet} onChange={e => setNomProjet(e.target.value)} placeholder="Nom du projet"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
          <textarea value={descProjet} onChange={e => setDescProjet(e.target.value)} rows={2} placeholder="Description (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box", resize: "none" }} />
          <input value={lieuProjet} onChange={e => setLieuProjet(e.target.value)} placeholder="Lieu (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <input value={dateDebutProjet} onChange={e => setDateDebutProjet(e.target.value)} type="date" placeholder="Début"
              style={{ flex: 1, padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, boxSizing: "border-box" }} />
            <input value={dateFinProjet} onChange={e => setDateFinProjet(e.target.value)} type="date" placeholder="Fin"
              style={{ flex: 1, padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, boxSizing: "border-box" }} />
          </div>
          <input value={budgetProjet} onChange={e => setBudgetProjet(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="Budget estimé (optionnel)" inputMode="decimal"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
          {erreurProjet && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 8 }}>{erreurProjet}</div>}
          <button onClick={creerProjet} disabled={busyProjet || !nomProjet.trim()} style={{
            padding: "9px 14px", borderRadius: 10, border: "none",
            background: !nomProjet.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body,
            cursor: !nomProjet.trim() ? "default" : "pointer", marginRight: 8 }}>
            {busyProjet ? "…" : "Créer le projet"}
          </button>
          <button onClick={() => { setShowFormProjet(false); setErreurProjet(""); }} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      )}

      {mesProjets === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, marginBottom: 20 }}>Chargement…</div>
      ) : mesProjets.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, padding: 16, marginBottom: 20 }}>Aucun projet créé pour le moment.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {mesProjets.map(p => {
            const statutLabel = { planifie: "Planifié", en_cours: "En cours", termine: "Terminé", suspendu: "Suspendu" }[p.statut] || p.statut;
            const statutColor = p.statut === "en_cours" ? "var(--c-accent)" : p.statut === "termine" ? "var(--c-text-muted)" : p.statut === "suspendu" ? "#B5451B" : "var(--c-text-secondary)";
            const activites = activitesParProjet[p.id];
            return (
              <div key={p.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10 }}>
                <div onClick={() => ouvrirProjet(p.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: T.body, fontWeight: 600 }}>{p.nom}</div>
                    {p.description && <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 3 }}>{p.description}</div>}
                    <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 4 }}>
                      {[p.localisation_texte, p.date_debut && new Date(p.date_debut).toLocaleDateString("fr-FR")].filter(Boolean).join(" · ")}
                    </div>
                  </div>
                  <span style={{ fontSize: T.meta, fontWeight: 700, color: statutColor === "var(--c-accent)" ? "#fff" : statutColor, background: statutColor === "var(--c-accent)" ? "var(--c-accent)" : "var(--c-surface-soft)", borderRadius: 999, padding: "3px 8px", flexShrink: 0, marginLeft: 8 }}>
                    {statutLabel}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
                  {["planifie", "en_cours", "termine", "suspendu"].filter(s => s !== p.statut).map(s => (
                    <button key={s} onClick={() => changerStatutProjet(p, s)} style={{ fontSize: T.meta, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", cursor: "pointer" }}>
                      → {{ planifie: "Planifié", en_cours: "En cours", termine: "Terminé", suspendu: "Suspendu" }[s]}
                    </button>
                  ))}
                  <button onClick={() => ouvrirProjet(p.id)} style={{ fontSize: T.meta, padding: "4px 8px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", cursor: "pointer" }}>
                    {projetOuvert === p.id ? "Masquer les activités" : "Voir les activités"}
                  </button>
                </div>

                {projetOuvert === p.id && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-border)" }}>
                    {activites === undefined ? (
                      <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Chargement…</div>
                    ) : activites.length === 0 ? (
                      <div style={{ fontSize: T.small, color: "var(--c-text-muted)", marginBottom: 8 }}>Aucune activité consignée.</div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 8 }}>
                        {activites.map(a => (
                          <div key={a.id} style={{ background: "var(--c-bg)", borderRadius: 8, padding: "6px 8px" }}>
                            <div style={{ fontSize: T.small, fontWeight: 600 }}>{a.titre}</div>
                            <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{new Date(a.date_debut).toLocaleDateString("fr-FR")}{a.type ? ` · ${a.type}` : ""}</div>
                            {a.description && <div style={{ fontSize: T.meta, color: "var(--c-text-secondary)", marginTop: 2 }}>{a.description}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    {showFormActivite === p.id ? (
                      <div style={{ background: "var(--c-bg)", borderRadius: 10, padding: 10 }}>
                        <input value={titreActivite} onChange={e => setTitreActivite(e.target.value)} placeholder="Titre de l'activité"
                          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 6, boxSizing: "border-box" }} />
                        <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
                          <select value={typeActivite} onChange={e => setTypeActivite(e.target.value)} style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field }}>
                            <option value="activite">Activité</option>
                            <option value="formation">Formation</option>
                            <option value="sensibilisation">Sensibilisation</option>
                            <option value="plantation">Plantation</option>
                            <option value="reunion">Réunion</option>
                          </select>
                          <input value={dateActivite} onChange={e => setDateActivite(e.target.value)} type="date"
                            style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field }} />
                        </div>
                        <textarea value={descActivite} onChange={e => setDescActivite(e.target.value)} rows={2} placeholder="Détails (optionnel)"
                          style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 6, boxSizing: "border-box", resize: "none" }} />
                        <button onClick={() => creerActivite(p.id)} disabled={busyActivite || !titreActivite.trim() || !dateActivite} style={{ padding: "7px 12px", borderRadius: 8, border: "none", background: (!titreActivite.trim() || !dateActivite) ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer", marginRight: 6 }}>
                          {busyActivite ? "…" : "Ajouter"}
                        </button>
                        <button onClick={() => setShowFormActivite(null)} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", fontSize: T.small, cursor: "pointer" }}>Annuler</button>
                      </div>
                    ) : (
                      <button onClick={() => setShowFormActivite(p.id)} style={{ fontSize: T.meta, padding: "6px 10px", borderRadius: 8, border: "1px dashed var(--c-border)", background: "none", color: "var(--c-text-muted)", cursor: "pointer" }}>
                        + Consigner une activité
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}><IconUsers size={16} /> Groupes de terrain</span>
        <button onClick={() => setShowCreerGroupeOrg(v => !v)} style={{ fontSize: T.small, padding: "6px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: showCreerGroupeOrg ? "var(--c-surface-soft)" : "var(--c-accent-dark)", color: showCreerGroupeOrg ? "var(--c-text-secondary)" : "#fff", fontWeight: 600, cursor: "pointer" }}>
          {showCreerGroupeOrg ? "Annuler" : "+ Créer un groupe"}
        </button>
      </div>
      {showCreerGroupeOrg && (
        <div style={{ background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", marginBottom: 14 }}>
          <input value={nomGroupeOrg} onChange={e => setNomGroupeOrg(e.target.value)} placeholder="Nom du groupe (ex : Équipe reboisement Nord)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 6, boxSizing: "border-box" }} />
          <input value={objectifGroupeOrg} onChange={e => setObjectifGroupeOrg(e.target.value)} placeholder="Objectif (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 6, boxSizing: "border-box" }} />
          <textarea value={descGroupeOrg} onChange={e => setDescGroupeOrg(e.target.value)} rows={2} placeholder="Description (optionnel)"
            style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box", resize: "none" }} />
          {erreurCreerGroupeOrg && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 8 }}>{erreurCreerGroupeOrg}</div>}
          <button onClick={creerGroupeOrg} disabled={busyCreerGroupeOrg || !nomGroupeOrg.trim()} style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: !nomGroupeOrg.trim() ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
            {busyCreerGroupeOrg ? "…" : "Créer le groupe"}
          </button>
        </div>
      )}
      <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10 }}>
        Les groupes que tu crées sont automatiquement affiliés. Un bénévole de {org.nom} qui rejoint
        un groupe existant peut aussi t'être proposé via un groupe qu'il crée lui-même et affilie par code.
      </div>
      {erreurAffiliation && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 10 }}>{erreurAffiliation}</div>}

      <div style={{ fontSize: T.meta, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>Demandes en attente ({(demandesAffiliation || []).length})</div>
      {demandesAffiliation === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, marginBottom: 16 }}>Chargement…</div>
      ) : demandesAffiliation.length === 0 ? (
        <div style={{ fontSize: T.small, color: "var(--c-text-muted)", padding: "4px 0 12px" }}>Aucune demande en attente.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {demandesAffiliation.map(g => (
            <div key={g.id} style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 12, padding: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
              <div>
                <div style={{ fontSize: T.body, fontWeight: 600 }}>{g.nom}</div>
                {g.objectif && <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 3 }}>{g.objectif}</div>}
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <button onClick={() => confirmerAffiliation(g.id)} disabled={busyAffiliationId === g.id} style={{ padding: "7px 12px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
                  {busyAffiliationId === g.id ? "…" : "Affilier"}
                </button>
                <button onClick={() => refuserAffiliation(g.id)} style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 4 }}><IconTrash size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontSize: T.meta, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>Groupes affiliés ({(groupesAffilies || []).length})</div>
      {groupesAffilies === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, marginBottom: 20 }}>Chargement…</div>
      ) : groupesAffilies.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, padding: 12, marginBottom: 20 }}>Aucun groupe affilié pour le moment.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {groupesAffilies.map(g => (
            <div key={g.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", cursor: "pointer" }} onClick={() => ouvrirGroupeOrg(g.id)}>
                <div>
                  <div style={{ fontSize: T.body, fontWeight: 600 }}>{g.nom}</div>
                  {g.objectif && <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 3 }}>{g.objectif}</div>}
                  {g.objectifs_atteints && <div style={{ fontSize: T.meta, color: "var(--c-accent-dark)", fontWeight: 600, marginTop: 4 }}>✓ Objectifs atteints</div>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); retirerAffiliation(g.id); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", cursor: "pointer", padding: 4, flexShrink: 0 }}><IconTrash size={13} /></button>
              </div>
              {groupeOuvertOrg === g.id && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-border)" }}>
                  {detailGroupeOrg === null ? (
                    <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Chargement…</div>
                  ) : (
                    <>
                      <div style={{ fontSize: T.meta, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 4 }}>Missions récentes</div>
                      {detailGroupeOrg.missions.length === 0 ? (
                        <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 8 }}>Aucune mission enregistrée.</div>
                      ) : detailGroupeOrg.missions.map(m => (
                        <div key={m.id} style={{ fontSize: T.meta, color: "var(--c-text-secondary)", marginBottom: 3, display: "flex", justifyContent: "space-between" }}>
                          <span>{m.titre}</span>
                          <span style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{{ a_faire: "À faire", en_cours: "En cours", termine: "Terminé" }[m.statut] || m.statut}</span>
                        </div>
                      ))}
                      <div style={{ fontSize: T.meta, fontWeight: 700, color: "var(--c-text-secondary)", margin: "8px 0 4px" }}>Journal d'activité</div>
                      {detailGroupeOrg.log.length === 0 ? (
                        <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>Aucune action enregistrée.</div>
                      ) : detailGroupeOrg.log.map(a => (
                        <div key={a.id} style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 2 }}>
                          {new Date(a.created_at).toLocaleDateString("fr-FR")} — {AUDIT_LABELS[a.action] || a.action}
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Signalements de votre domaine</div>
      {signalements === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement…</div>
      ) : signalements.length === 0 ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body, padding: 20 }}>Aucun signalement dans votre domaine pour le moment.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {signalements.map(s => {
            const cat = categorieMeta(s.categorie);
            return (
              <div key={s.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div style={{ fontSize: T.body, fontWeight: 600 }}>{cat.label}</div>
                  <span style={{ fontSize: T.meta, fontWeight: 600, color: s.statut === "resolu" ? "var(--c-accent)" : "#B5451B" }}>{s.statut === "resolu" ? "Résolu" : "En attente"}</span>
                </div>
                <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", marginTop: 4 }}>{s.description}</div>
                {s.benevole_nom && (
                  <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 4 }}>
                    Signalé par <strong>{s.benevole_nom}</strong>
                    {(s.benevole_ville || s.benevole_pays) && <> — {[s.benevole_ville, s.benevole_pays].filter(Boolean).join(", ")}</>}
                    {s.benevole_quartier && <> ({s.benevole_quartier})</>}
                    {s.benevole_contact && <> · {s.benevole_contact}</>}
                  </div>
                )}
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  {!s.valide && <button onClick={() => valider(s)} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer" }}>Valider</button>}
                  {s.statut !== "resolu" && <button onClick={() => resoudre(s)} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", cursor: "pointer" }}>Marquer résolu</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 6 }}>Mes bénévoles{estGouvernement ? " (tous — droits gouvernementaux)" : ""}</div>
      {!estGouvernement && org.code_inscription && (
        <div style={{ fontSize: T.small, color: "var(--c-text-secondary)", background: "var(--c-surface-soft)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 10px", marginBottom: 8 }}>
          Votre code d'inscription : <strong>{org.code_inscription}</strong> — communiquez-le à vos bénévoles pour qu'ils le saisissent à leur inscription.
        </div>
      )}
      <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 10 }}>
        {estGouvernement
          ? "En tant qu'organisation gouvernementale, vous voyez tous les signalements sans restriction."
          : "Seuls les bénévoles ayant saisi votre code d'inscription apparaissent ici. Un bénévole indépendant (sans code, ou avec le code d'une autre organisation) reste invisible dans votre espace."}
      </div>
      {mesBenevoles === null ? (
        <div style={{ textAlign: "center", color: "var(--c-text-muted)", fontSize: T.body }}>Chargement…</div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          {mesBenevoles.length > 0 && (
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: T.meta, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>Assignés ({mesBenevoles.length})</div>
              {mesBenevoles.map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 10px", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: T.small, fontWeight: 600 }}>{b.nom}</div>
                    <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{[b.ville, b.pays].filter(Boolean).join(", ")}{b.zone ? ` — ${b.zone}` : ""}</div>
                  </div>
                  <button onClick={() => retirerBenevole(b)} disabled={busyAssign === b.id} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-bg)", cursor: "pointer" }}>
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}
          <div style={{ fontSize: T.meta, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>{estGouvernement ? "Non assignés" : "Éligibles par votre code, à assigner"} ({(benevolesDisponibles || []).length})</div>
          {(benevolesDisponibles || []).length === 0 ? (
            <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>{estGouvernement ? "Aucun bénévole non assigné pour le moment." : "Aucun bénévole n'a encore utilisé votre code."}</div>
          ) : (groupesAffilies || []).length === 0 ? (
            <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Crée d'abord un groupe de terrain ci-dessus pour pouvoir y assigner des bénévoles.</div>
          ) : (benevolesDisponibles || []).map(b => (
            <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 10, padding: "8px 10px", marginBottom: 6, gap: 8 }}>
              <div>
                <div style={{ fontSize: T.small, fontWeight: 600 }}>{b.nom}</div>
                <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{[b.ville, b.pays].filter(Boolean).join(", ")}{b.zone ? ` — ${b.zone}` : ""}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                <select value={assignationGroupe[b.id] || ""} onChange={e => setAssignationGroupe(prev => ({ ...prev, [b.id]: e.target.value }))}
                  style={{ fontSize: T.small, padding: "5px 6px", borderRadius: 8, border: "1px solid var(--c-border)", maxWidth: 120 }}>
                  <option value="">Groupe…</option>
                  {groupesAffilies.map(g => <option key={g.id} value={g.id}>{g.nom}</option>)}
                </select>
                <button onClick={() => assignerBenevole(b)} disabled={busyAssign === b.id || !assignationGroupe[b.id]} style={{ fontSize: T.meta, padding: "5px 10px", borderRadius: 8, border: "none", background: !assignationGroupe[b.id] ? "var(--c-text-faint)" : "var(--c-accent-dark)", color: "#fff", cursor: "pointer" }}>
                  {busyAssign === b.id ? "…" : "Assigner"}
                </button>
              </div>
            </div>
          ))}
          {estGouvernement && benevolesAutresOrg && benevolesAutresOrg.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: T.meta, fontWeight: 700, color: "var(--c-text-secondary)", marginBottom: 6 }}>Déjà assignés à une autre organisation ({benevolesAutresOrg.length})</div>
              <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginBottom: 6 }}>Visibles pour information — un bénévole déjà rattaché à une ONG ne peut pas être réassigné.</div>
              {benevolesAutresOrg.map(b => (
                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--c-surface-soft)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 10px", marginBottom: 6, opacity: 0.8 }}>
                  <div>
                    <div style={{ fontSize: T.small, fontWeight: 600 }}>{b.nom}</div>
                    <div style={{ fontSize: T.meta, color: "var(--c-text-muted)" }}>{[b.ville, b.pays].filter(Boolean).join(", ")}{b.zone ? ` — ${b.zone}` : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Rapport de votre organisation</div>
      <ExportRow choixFormat label="Signalements de votre domaine" count={rowsExport.length} columns={colonnesSignalements(false)} rapport={rapportSignalements(org.nom)} filenamePrefix={`pace-${org.type}-${(org.nom || "org").replace(/\s+/g, "-")}`} title={`Rapport ${org.nom}`} getRows={() => preparerLignesSignalements(rowsExport)} />

      <div style={{ margin: "20px 0" }}>
        <OrgEnquetes organisationId={org.id} email={organisationEmail} />
      </div>

      <div style={{ ...TITRE_SOUS, fontWeight: 600, color: "var(--c-accent-dark)", margin: "20px 0 10px" }}>Publier une actualité officielle</div>
      <form onSubmit={publierActualite} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 14 }}>
        <input required value={titreActu} onChange={e => setTitreActu(e.target.value)} placeholder="Titre"
          style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
        <textarea required value={contenuActu} onChange={e => setContenuActu(e.target.value)} rows={3} placeholder="Contenu"
          style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box", resize: "none" }} />
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: T.small, color: "var(--c-text-secondary)", marginBottom: 10 }}>
          <input type="checkbox" checked={urgentActu} onChange={e => setUrgentActu(e.target.checked)} /> Marquer comme urgent
        </label>
        {messageActu && <div style={{ fontSize: T.small, color: messageActu.startsWith("Échec") ? "#B5451B" : "var(--c-accent)", marginBottom: 8 }}>{messageActu}</div>}
        <button type="button" onClick={publierActualite} disabled={busyActu} style={{ width: "100%", padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer" }}>
          {busyActu ? "…" : "Publier"}
        </button>
      </form>
    </Screen>
  );
}
