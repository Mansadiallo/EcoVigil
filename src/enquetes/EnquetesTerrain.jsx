import { useEffect, useRef, useState } from "react";
import { miniBtnStyle } from "../admin/formulaires.jsx";
import { IconCheck, IconSearch } from "../components/icons.jsx";
import { AudioRecorder } from "../components/media.jsx";
import { Screen, SectionTitle } from "../components/ui.jsx";
import { uid } from "../lib/categories.jsx";
import { exportExcel } from "../lib/exports.js";
import { dequeuePendingAction, enqueuePendingEnquete, getOfflineEnquete, loadOfflineEnquetes, loadPendingQueue, putOfflineEnquete, removeOfflineEnquete, syncOneDossierEnquete } from "../lib/offline.js";
import { DEVICE_ID, supabase } from "../lib/supabase.js";

// Module dédié aux bénévoles : formulaires "terrain" que les organisations auxquelles ils sont
// affiliés leur ont confiés (créés depuis OrgEnquetes, mode_collecte "terrain"). Distinct du
// module citoyen supprimé — jamais auto-déclaratif, et rempli à répétition (un bénévole interroge
// de nombreux citoyens successivement, une ligne de participation par interview).
export function EnquetesTerrain({ onBack }) {
  const [terrainListe, setTerrainListe] = useState(null);
  const [terrainSelection, setTerrainSelection] = useState(null);
  const [terrainQuestions, setTerrainQuestions] = useState(null);
  const [terrainReponses, setTerrainReponses] = useState({});
  const [terrainInstances, setTerrainInstances] = useState({});
  const [terrainCompte, setTerrainCompte] = useState(0);
  const [terrainMerci, setTerrainMerci] = useState(false);
  const [terrainBusy, setTerrainBusy] = useState(false);
  const [terrainErreur, setTerrainErreur] = useState("");
  const suggestionsRef = useRef({});

  // Clé composite question+occurrence : une question simple n'a qu'une occurrence (0) ; une
  // question d'un groupe répétable (ex. "Point de pollution") en a une par répétition ajoutée
  // par le répondant — comme les "repeat groups" de KoboToolbox.
  function cle(qId, instance) { return `${qId}::${instance}`; }

  useEffect(() => {
    (async () => {
      const { data: mesAffiliations } = await supabase.from("benevoles").select("organisation_id").eq("device_id", DEVICE_ID).eq("is_deleted", false).not("organisation_id", "is", null);
      const orgIds = [...new Set((mesAffiliations || []).map(b => b.organisation_id))];
      if (orgIds.length === 0) { setTerrainListe([]); return; }
      const { data } = await supabase.from("enquetes").select("*").eq("mode_collecte", "terrain").eq("statut", "ouverte").in("organisation_id", orgIds).order("created_at", { ascending: false });
      setTerrainListe(data || []);
    })();
  }, []);

  async function ouvrirTerrain(enq) {
    setTerrainSelection(enq);
    setTerrainReponses({});
    setTerrainInstances({});
    setTerrainErreur("");
    setTerrainMerci(false);
    setTerrainCompte(0);
    setTerrainQuestions(null);
    const { data } = await supabase.from("enquete_questions").select("*").eq("enquete_id", enq.id).order("ordre", { ascending: true });
    // Une question "texte" peut porter une réponse suggérée par l'organisation (stockée dans
    // options[0]) : on pré-remplit le champ avec, mais le bénévole reste libre de la corriger
    // si le citoyen interrogé répond différemment. La suggestion ne préremplit que la première
    // occurrence d'un groupe répétable ; les occurrences ajoutées ensuite démarrent vides.
    const suggestions = {};
    (data || []).forEach(q => {
      if (q.type_reponse === "texte" && Array.isArray(q.options) && q.options[0]) suggestions[cle(q.id, 0)] = q.options[0];
    });
    suggestionsRef.current = suggestions;
    setTerrainReponses(suggestions);
    setTerrainQuestions(data || []);
  }
  function setReponseTerrain(qId, instance, val) { setTerrainReponses(prev => ({ ...prev, [cle(qId, instance)]: val })); }
  function toggleChoixMultipleTerrain(qId, instance, opt) {
    setTerrainReponses(prev => {
      const k = cle(qId, instance);
      const cur = Array.isArray(prev[k]) ? prev[k] : [];
      return { ...prev, [k]: cur.includes(opt) ? cur.filter(o => o !== opt) : [...cur, opt] };
    });
  }
  function ajouterOccurrence(groupe) { setTerrainInstances(prev => ({ ...prev, [groupe]: (prev[groupe] || 1) + 1 })); }
  function retirerDerniereOccurrence(groupe) {
    const count = terrainInstances[groupe] || 1;
    if (count <= 1) return;
    const dernier = count - 1;
    const qIds = (terrainQuestions || []).filter(q => q.groupe_repetable === groupe).map(q => q.id);
    setTerrainReponses(prev => { const next = { ...prev }; qIds.forEach(qid => { delete next[cle(qid, dernier)]; }); return next; });
    setTerrainInstances(prev => ({ ...prev, [groupe]: dernier }));
  }
  // Une question conditionnelle ne s'affiche (et ne compte dans les réponses envoyées) que si la
  // réponse attendue a été donnée à la question dont elle dépend — comme la logique conditionnelle
  // de KoboToolbox. Quand la source de la condition appartient au même groupe répétable, on compare
  // à la réponse de la même occurrence ; sinon (question simple hors groupe) on prend l'occurrence 0.
  function questionVisible(q, instance, valeurs) {
    if (!q.condition_question_id) return true;
    const source = (terrainQuestions || []).find(x => x.id === q.condition_question_id);
    const instanceSource = (source && source.groupe_repetable === q.groupe_repetable) ? instance : 0;
    const rep = valeurs[cle(q.condition_question_id, instanceSource)];
    if (rep === undefined) return false;
    return Array.isArray(rep) ? rep.includes(q.condition_valeur) : String(rep) === q.condition_valeur;
  }
  // Contraintes de validation d'une question (plage numérique ou longueur de texte). Une réponse
  // vide n'est pas vérifiée ici : les contraintes ne s'appliquent qu'à ce qui a été saisi.
  function erreurValidation(q, v) {
    const val = q.validation;
    if (!val || v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return null;
    if (val.kind === "nombre") {
      const n = Number(v);
      if (isNaN(n)) return "Saisis un nombre.";
      if (val.min != null && n < val.min) return `Valeur minimale : ${val.min}.`;
      if (val.max != null && n > val.max) return `Valeur maximale : ${val.max}.`;
    } else if (val.kind === "texte") {
      const len = String(v).trim().length;
      if (val.min_len != null && len < val.min_len) return `Au moins ${val.min_len} caractères (${len} saisis).`;
      if (val.max_len != null && len > val.max_len) return `Au plus ${val.max_len} caractères (${len} saisis).`;
    }
    return null;
  }
  async function envoyerInterviewTerrain() {
    if (!terrainSelection) return;
    const violations = [];
    (terrainQuestions || []).forEach(q => {
      if (!q.validation) return;
      const nb = q.groupe_repetable ? (terrainInstances[q.groupe_repetable] || 1) : 1;
      for (let inst = 0; inst < nb; inst++) {
        if (!questionVisible(q, inst, terrainReponses)) continue;
        const err = erreurValidation(q, terrainReponses[cle(q.id, inst)]);
        if (err) violations.push(`« ${q.texte} »${nb > 1 ? " (#" + (inst + 1) + ")" : ""} : ${err}`);
      }
    });
    if (violations.length > 0) { setTerrainErreur("Réponses à corriger avant l'envoi — " + violations.join(" ; ")); return; }
    setTerrainBusy(true);
    setTerrainErreur("");
    // Le bénévole réalise de nombreuses interviews depuis le même appareil : la contrainte
    // d'unicité (une participation par appareil et par enquête) est faite pour le mode citoyen
    // auto-déclaratif, pas pour ça. On donne donc à chaque interview un identifiant synthétique
    // propre, tout en traçant le véritable appareil du bénévole via benevole_device_id — c'est ce
    // qui permet à l'organisation de voir la contribution de chacun de ses bénévoles.
    const idInterview = `${DEVICE_ID}-terrain-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const { data: part, error: errPart } = await supabase.from("enquete_participations")
      .insert({ enquete_id: terrainSelection.id, device_id: idInterview, benevole_device_id: DEVICE_ID }).select().single();
    if (errPart || !part) {
      setTerrainBusy(false);
      setTerrainErreur("Impossible d'enregistrer cette interview. Réessaie.");
      return;
    }
    const questionsById = {}; (terrainQuestions || []).forEach(q => { questionsById[q.id] = q; });
    const lignes = Object.entries(terrainReponses)
      .filter(([, v]) => v !== undefined && v !== "" && !(Array.isArray(v) && v.length === 0))
      .map(([k, valeur]) => { const [qId, inst] = k.split("::"); return { qId, instance: Number(inst), valeur }; })
      .filter(({ qId, instance }) => { const q = questionsById[qId]; return !q || questionVisible(q, instance, terrainReponses); })
      .map(({ qId, instance, valeur }) => ({ participation_id: part.id, question_id: qId, instance, valeur: Array.isArray(valeur) ? valeur.join(", ") : String(valeur) }));
    if (lignes.length) await supabase.from("enquete_reponses").insert(lignes);
    setTerrainBusy(false);
    setTerrainCompte(c => c + 1);
    setTerrainMerci(true);
    setTerrainReponses(suggestionsRef.current);
    setTerrainInstances({});
  }

  const champBtn = (actif) => ({
    padding: "8px 12px", borderRadius: 10, border: `1px solid ${actif ? "var(--c-accent-dark)" : "var(--c-border)"}`,
    background: actif ? "var(--c-accent-dark)" : "var(--c-surface)", color: actif ? "#fff" : "var(--c-text)",
    fontSize: 12.5, cursor: "pointer", marginRight: 6, marginBottom: 6,
  });

  function renderChamp(q, instance, valeurs, onSet, onToggle) {
    const v = valeurs[cle(q.id, instance)];
    return (
      <div key={cle(q.id, instance)} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>{q.texte}</div>
        {q.type_reponse === "texte" && (
          <div>
            {instance === 0 && Array.isArray(q.options) && q.options[0] && (
              <div style={{ fontSize: 10.5, color: "var(--c-accent-dark)", marginBottom: 4 }}>Réponse suggérée — modifie-la si le citoyen répond autre chose</div>
            )}
            {q.validation && q.validation.kind === "nombre"
              ? <input type="number" inputMode="decimal" value={v ?? ""} onChange={e => onSet(q.id, instance, e.target.value)}
                  style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif" }} />
              : <textarea value={v || ""} onChange={e => onSet(q.id, instance, e.target.value)} rows={3}
                  style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box", fontFamily: "Work Sans, sans-serif", resize: "none" }} />}
            {q.validation && (
              <div style={{ fontSize: 10.5, marginTop: 4, color: erreurValidation(q, v) ? "#B5451B" : "var(--c-text-muted)" }}>
                {erreurValidation(q, v) || (q.validation.kind === "nombre"
                  ? `Nombre${q.validation.min != null ? " ≥ " + q.validation.min : ""}${q.validation.max != null ? " ≤ " + q.validation.max : ""}`
                  : `${q.validation.min_len != null ? "Min " + q.validation.min_len : ""}${q.validation.min_len != null && q.validation.max_len != null ? " · " : ""}${q.validation.max_len != null ? "Max " + q.validation.max_len : ""} caractères`)}
              </div>
            )}
          </div>
        )}
        {q.type_reponse === "oui_non" && (
          <div>{["Oui", "Non"].map(opt => (
            <button key={opt} type="button" onClick={() => onSet(q.id, instance, opt)} style={champBtn(v === opt)}>{opt}</button>
          ))}</div>
        )}
        {q.type_reponse === "echelle" && (
          <div>{[1, 2, 3, 4, 5].map(n => (
            <button key={n} type="button" onClick={() => onSet(q.id, instance, n)} style={champBtn(v === n)}>{n}</button>
          ))}</div>
        )}
        {q.type_reponse === "choix_unique" && (
          <div>{(q.options || []).map(opt => (
            <button key={opt} type="button" onClick={() => onSet(q.id, instance, opt)} style={champBtn(v === opt)}>{opt}</button>
          ))}</div>
        )}
        {q.type_reponse === "choix_multiple" && (
          <div>{(q.options || []).map(opt => (
            <button key={opt} type="button" onClick={() => onToggle(q.id, instance, opt)} style={champBtn(Array.isArray(v) && v.includes(opt))}>{opt}</button>
          ))}</div>
        )}
      </div>
    );
  }
  // Regroupe les questions consécutives partageant le même groupe_repetable en un seul bloc
  // répétable ; une question sans groupe reste un bloc "simple" à occurrence unique.
  function partitionnerGroupes(liste) {
    const blocs = []; let i = 0;
    while (i < liste.length) {
      const q = liste[i];
      if (!q.groupe_repetable) { blocs.push({ type: "simple", q }); i++; continue; }
      const nom = q.groupe_repetable, questions = [];
      while (i < liste.length && liste[i].groupe_repetable === nom) { questions.push(liste[i]); i++; }
      blocs.push({ type: "groupe", nom, questions });
    }
    return blocs;
  }
  function ChampsQuestions({ liste, valeurs, onSet, onToggle, instances, onAjouter, onRetirer }) {
    return partitionnerGroupes(liste).map(bloc => {
      if (bloc.type === "simple") {
        return questionVisible(bloc.q, 0, valeurs) ? renderChamp(bloc.q, 0, valeurs, onSet, onToggle) : null;
      }
      const count = instances[bloc.nom] || 1;
      return (
        <div key={bloc.nom} style={{ marginBottom: 16, padding: 12, border: "1px dashed var(--c-border)", borderRadius: 10 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--c-accent-dark)", marginBottom: 10 }}>{bloc.nom}</div>
          {Array.from({ length: count }).map((_, inst) => (
            <div key={inst} style={{ marginBottom: inst < count - 1 ? 14 : 0, paddingBottom: inst < count - 1 ? 14 : 0, borderBottom: inst < count - 1 ? "1px solid var(--c-border)" : "none" }}>
              {count > 1 && <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 6 }}>{bloc.nom} #{inst + 1}</div>}
              {bloc.questions.filter(q => questionVisible(q, inst, valeurs)).map(q => renderChamp(q, inst, valeurs, onSet, onToggle))}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button type="button" onClick={() => onAjouter(bloc.nom)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--c-accent-dark)", background: "none", color: "var(--c-accent-dark)", fontSize: 12, cursor: "pointer" }}>+ Ajouter « {bloc.nom} »</button>
            {count > 1 && <button type="button" onClick={() => onRetirer(bloc.nom)} style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", color: "var(--c-text-muted)", fontSize: 12, cursor: "pointer" }}>− Retirer la dernière occurrence</button>}
          </div>
        </div>
      );
    });
  }

  if (terrainSelection) {
    return (
      <Screen>
        <button onClick={() => setTerrainSelection(null)} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Enquêtes terrain</button>
        <SectionTitle sub="Interview de terrain — à remplir avec le citoyen que tu interroges.">{terrainSelection.titre}</SectionTitle>
        {terrainCompte > 0 && (
          <div style={{ fontSize: 11.5, color: "var(--c-accent-dark)", fontWeight: 600, marginBottom: 12 }}>{terrainCompte} interview{terrainCompte > 1 ? "s" : ""} réalisée{terrainCompte > 1 ? "s" : ""} pour l'instant</div>
        )}
        {terrainMerci ? (
          <div className="pace-fade-in" style={{ textAlign: "center", padding: 20 }}>
            <IconCheck size={20} color="var(--c-accent-dark)" />
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--c-accent-dark)", margin: "8px 0 16px" }}>Interview enregistrée !</div>
            <button onClick={() => setTerrainMerci(false)} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>
              Interroger un(e) autre citoyen(ne)
            </button>
          </div>
        ) : terrainQuestions === null ? (
          <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement du questionnaire…</div>
        ) : (
          <div>
            <ChampsQuestions liste={terrainQuestions} valeurs={terrainReponses} onSet={setReponseTerrain} onToggle={toggleChoixMultipleTerrain} instances={terrainInstances} onAjouter={ajouterOccurrence} onRetirer={retirerDerniereOccurrence} />
            {terrainErreur && <div role="alert" style={{ fontSize: 11.5, color: "#B5451B", marginBottom: 10 }}>{terrainErreur}</div>}
            <button onClick={envoyerInterviewTerrain} disabled={terrainBusy} style={{ width: "100%", padding: "11px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 13.5, cursor: "pointer", opacity: terrainBusy ? 0.7 : 1 }}>
              {terrainBusy ? "Envoi…" : "Enregistrer cette interview"}
            </button>
          </div>
        )}
      </Screen>
    );
  }

  return (
    <Screen>
      <button onClick={onBack} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 12.5, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Retour</button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 8 }}><IconSearch size={17} color="var(--c-accent)" /></div>
        <SectionTitle sub="Formulaires confiés par les organisations auxquelles tu es affilié comme bénévole.">Enquêtes terrain</SectionTitle>
      </div>

      <EnquetesStandard email="" organisationId={null} source="benevole" deviceId={DEVICE_ID} />

      {terrainListe === null ? (
        <div style={{ fontSize: 12, color: "var(--c-text-muted)", textAlign: "center", padding: 20 }}>Chargement…</div>
      ) : terrainListe.length === 0 ? (
        <div style={{ fontSize: 12.5, color: "var(--c-text-muted)", textAlign: "center", padding: 20 }}>Aucune enquête terrain à réaliser pour le moment.</div>
      ) : (
        terrainListe.map(e => (
          <button key={e.id} onClick={() => ouvrirTerrain(e)} style={{
            display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4, padding: 12, borderRadius: 12,
            border: "1px solid var(--c-accent-dark)", background: "var(--c-surface-soft)", cursor: "pointer", textAlign: "left", width: "100%", marginBottom: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)" }}>{e.titre}</div>
            <div style={{ fontSize: 10.5, color: "var(--c-accent-dark)" }}>À réaliser sur le terrain, auprès des citoyens</div>
          </button>
        ))
      )}
    </Screen>
  );
}

// ===== Enquête environnementale standard (dossiers) — s'ajoute au constructeur libre, ne le remplace pas =====
const ENQ_TYPE_ENQUETE = [["observation","Observation environnementale"],["communautaire","Enquête communautaire"],["controle","Contrôle environnemental"],["suivi_signalement","Suivi d'un signalement"],["evaluation_site","Évaluation d'un site"],["suivi_enquete","Suivi d'une enquête précédente"],["autre","Autre"]];

const ENQ_CATEGORIES = [
  ["dechets", "Déchets et pollution", [["dechets_menagers","Déchets ménagers"],["plastiques","Plastiques"],["dechets_electroniques","Déchets électroniques"],["dechets_medicaux","Déchets médicaux"],["dechets_dangereux","Déchets dangereux"],["decharge_sauvage","Décharge sauvage"],["brulage_dechets","Brûlage de déchets"],["deversement_dechets","Déversement de déchets"]]],
  ["eau", "Eau", [["pollution_riviere","Pollution de rivière"],["pollution_lac","Pollution de lac"],["pollution_source","Pollution de source"],["pollution_puits","Pollution de puits"],["pollution_eaux_souterraines","Pollution des eaux souterraines"],["deversement_eau","Déversement dans l'eau"],["assechement","Assèchement d'un point d'eau"],["eutrophisation","Eutrophisation"],["mortalite_poissons","Mortalité de poissons"],["degradation_zones_humides","Dégradation des zones humides"]]],
  ["forets", "Forêts et végétation", [["deforestation","Déforestation"],["coupe_abusive","Coupe abusive de bois"],["defrichement","Défrichement"],["feu_brousse","Feu de brousse"],["destruction_mangrove","Destruction de mangrove"],["destruction_vegetation","Destruction de végétation"]]],
  ["sols", "Sols et terres", [["erosion","Érosion"],["pollution_sols","Pollution des sols"],["degradation_terres","Dégradation des terres"],["extraction_sable","Extraction de sable"],["carriere","Carrière"],["desertification","Désertification"]]],
  ["mines", "Mines et ressources naturelles", [["exploitation_miniere","Exploitation minière"],["orpaillage","Orpaillage"],["exploitation_carriere","Exploitation de carrière"],["pollution_miniere","Pollution minière"],["degradation_site_minier","Dégradation d'un site minier"],["substances_dangereuses","Utilisation de substances dangereuses"]]],
  ["biodiversite", "Biodiversité", [["destruction_habitat","Destruction d'habitat"],["braconnage","Braconnage"],["capture_especes","Capture d'espèces"],["mortalite_animale","Mortalité animale"],["menace_espece","Menace sur une espèce"],["destruction_zone_reproduction","Destruction de zone de reproduction"]]],
  ["air", "Air", [["pollution_atmospherique","Pollution atmosphérique"],["fumees","Fumées"],["poussieres","Poussières"],["emissions_industrielles","Émissions industrielles"],["odeurs_polluantes","Odeurs polluantes"],["brulage_ciel_ouvert","Brûlage à ciel ouvert"]]],
  ["risques", "Risques industriels et chimiques", [["fuite_chimique","Fuite chimique"],["deversement_hydrocarbures","Déversement d'hydrocarbures"],["fuite_carburant","Fuite de carburant"],["accident_industriel","Accident industriel"],["stockage_dangereux","Stockage dangereux"],["incendie_impact","Incendie à impact environnemental"]]],
  ["littoral", "Littoral et milieux marins", [["pollution_marine","Pollution marine"],["dechets_littoral","Déchets sur le littoral"],["erosion_cotiere","Érosion côtière"],["degradation_mangrove_littoral","Dégradation de mangrove"],["destruction_habitat_marin","Destruction d'habitat marin"]]],
  ["climat", "Climat et phénomènes extrêmes", [["secheresse","Sécheresse"],["inondation","Inondation"],["evenement_climatique","Événement climatique extrême"],["degradation_climatique","Dégradation liée au changement climatique"]]],
  ["urbanisation", "Urbanisation", [["occupation_zone_sensible","Occupation d'une zone sensible"],["construction_zone_naturelle","Construction dans une zone naturelle"],["destruction_espace_vert","Destruction d'espace vert"],["artificialisation_sols","Artificialisation des sols"]]],
  ["autre_groupe", "Autre problème environnemental", [["autre","Autre (préciser)"]]],
];

const ENQ_CAT_FLAT = ENQ_CATEGORIES.flatMap(([gk, gl, subs]) => subs.map(([sk, sl]) => [sk, sl, gk, gl]));

const ENQ_ACTIONS = ["Aucune","Sensibilisation","Signalement","Intervention","Mise en sécurité","Autre"];

export const ENQ_NIVEAUX = [
  ["mineur","Mineur","Impact limité et réversible rapidement, sans risque pour la population."],
  ["modere","Modéré","Impact localisé et réversible, risque limité."],
  ["majeur","Majeur","Impact significatif, zone étendue ou risque notable pour les ressources naturelles."],
  ["grave","Grave","Impact important, dégradation durable ou risque réel pour la population."],
  ["tres_grave","Très grave","Impact sévère et étendu, ou risque important et immédiat."],
  ["critique","Critique","Danger immédiat pour la population, les écosystèmes ou les ressources naturelles ; intervention urgente."],
  ["a_determiner","À déterminer",""],
];

const ENQ_GRAVITE_PREUVE_OBLIGATOIRE = ["grave","tres_grave","critique"];

// Couleurs pour la cartographie EcoVigil (marqueurs des dossiers d'enquête validés), du moins
// grave au plus grave — cohérent avec les teintes déjà utilisées ailleurs pour l'urgence.
export const ENQ_NIVEAU_COULEUR = { mineur: "#4CAF50", modere: "#8A9A1B", majeur: "#D4A017", grave: "#E3A73B", tres_grave: "#B5451B", critique: "#7A1F1F", a_determiner: "#6B7A8F" };

export function nomTypeEnqueteCarte(id) { return (ENQ_CAT_FLAT.find(t => t[0] === id) || [])[1] || "—"; }

const ENQ_IMPACT_DOMAINES = ["Eau","Sols","Air","Végétation","Faune","Biodiversité","Habitats naturels","Population","Activités économiques locales"];

const ENQ_IMPACT_NIVEAUX = [["aucun","Aucun"],["faible","Faible"],["moyen","Moyen"],["eleve","Élevé"],["critique","Critique"]];

const ENQ_IMPACT_JUSTIF_REQUISE = ["eleve","critique"];

const ENQ_NATURES = [["observe","Observé"],["declare","Déclaré par un tiers"],["suppose","Supposé"],["a_verifier","À vérifier"]];

const ENQ_STATUTS = { brouillon: "Brouillon", en_cours: "En cours", terminee: "Terminée", verifiee: "Vérifiée", a_revoir: "À revoir", rejetee: "Rejetée" };

const ENQ_ETAPES = ["Identification", "Localisation", "Constat", "Impacts & acteurs", "Preuves", "Niveau & actions", "Aperçu"];

const ENQ_PREUVES = [["photo","Photo"],["audio","Enregistrement audio"],["video","Vidéo"],["document","Document"],["temoignage","Témoignage"],["releve_gps","Relevé GPS"],["mesure","Mesure"],["materiel","Matériel utilisé"],["autre","Autre"]];

// Statuts du cycle de vie d'une transcription manuelle d'enregistrement audio (voir
// TranscriptionAudio) — mêmes noms que côté base (contrainte CHECK sur la table
// enquete_preuve_transcriptions), pour éviter toute divergence entre client et serveur.
const TRANSCRIPTION_STATUTS = { brouillon: "Brouillon", soumise: "Soumise", a_revoir: "À revoir", verifiee: "Vérifiée", validee: "Validée", rejetee: "Rejetée" };

// Carte cliquable : toucher la carte place ou corrige la position du constat
function PositionPicker({ lat, lng, onPick }) {
  const el = useRef(null), map = useRef(null), mk = useRef(null), cb = useRef(onPick); cb.current = onPick;
  useEffect(() => {
    if (!el.current || !window.L) return;
    const ok = lat !== "" && lng !== "" && !isNaN(Number(lat)) && !isNaN(Number(lng));
    map.current = L.map(el.current, { maxZoom: 19 }).setView(ok ? [Number(lat), Number(lng)] : [9.5, -12], ok ? 16 : 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© OpenStreetMap" }).addTo(map.current);
    map.current.on("click", ev => cb.current(ev.latlng.lat.toFixed(6), ev.latlng.lng.toFixed(6)));
    setTimeout(() => map.current && map.current.invalidateSize(), 200);
    return () => { map.current && map.current.remove(); map.current = null; mk.current = null; };
  }, []);
  useEffect(() => {
    if (!map.current || lat === "" || lng === "" || isNaN(Number(lat)) || isNaN(Number(lng))) return;
    const pt = [Number(lat), Number(lng)];
    if (mk.current) mk.current.setLatLng(pt); else mk.current = L.circleMarker(pt, { radius: 9, color: "#fff", weight: 2, fillColor: "#B5451B", fillOpacity: 1 }).addTo(map.current);
    map.current.setView(pt, Math.max(map.current.getZoom(), 15));
  }, [lat, lng]);
  return <div ref={el} style={{ width: "100%", height: 240, borderRadius: 10, border: "1px solid var(--c-border)", marginBottom: 6 }} />;
}

// Indicateur de connexion et de synchronisation pour les enquêtes hors-ligne (🟢/🔴/🟠/🔵),
// alimenté par les mêmes événements que la file d'attente générique de l'application.
// Dossier créé par "+ Enquête environnementale standard" puis fermé sans rien saisir : jamais
// synchronisé, sans titre, sans preuve ni transcription. Il ne contient rien à envoyer et ne doit
// pas apparaître comme "en attente de synchronisation".
function estBrouillonVide(r) {
  return !r.remoteId && !((r.cols && r.cols.titre) || "").trim() && !(r.preuvesLocales || []).length && !Object.keys(r.transcriptionsLocales || {}).length;
}

// Un dossier local est "en attente" s'il n'est pas entièrement synchronisé, ou s'il est synchronisé
// mais garde des preuves/transcriptions non envoyées (sinon la copie locale est supprimée à la fin
// de la synchronisation). Les copies "synced" laissées par la simple consultation d'un dossier du
// serveur ne comptent pas.
function estEnAttente(r) {
  return r.statutSync !== "synced" || (r.preuvesLocales || []).length > 0 || Object.keys(r.transcriptionsLocales || {}).length > 0;
}

// Retire un dossier local ET ses éventuelles entrées dans la file de synchronisation (sans quoi un
// échec en file continuerait d'être signalé alors que le dossier n'existe plus).
function retirerLocal(localId) {
  removeOfflineEnquete(localId);
  loadPendingQueue().filter(it => it.type === "enquete" && it.payload && it.payload.localId === localId).forEach(it => dequeuePendingAction(it.id));
}

function IndicateurConnexionEnquetes({ email, deviceId }) {
  const [, force] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const maj = () => force(t => t + 1);
    const onSync = (ev) => setSyncing(!!(ev && ev.detail && ev.detail.syncing));
    const onOff = () => setOnline(navigator.onLine);
    window.addEventListener("pace-enquetes-offline-updated", maj);
    window.addEventListener("pace-queue-updated", maj);
    window.addEventListener("pace-queue-syncing", onSync);
    window.addEventListener("online", onOff); window.addEventListener("offline", onOff);
    const t = setInterval(maj, 5000);
    return () => { window.removeEventListener("pace-enquetes-offline-updated", maj); window.removeEventListener("pace-queue-updated", maj); window.removeEventListener("pace-queue-syncing", onSync); window.removeEventListener("online", onOff); window.removeEventListener("offline", onOff); clearInterval(t); };
  }, []);
  const mine = Object.values(loadOfflineEnquetes()).filter(r => r && (deviceId ? r.deviceId === deviceId : r.creePar === email) && estEnAttente(r));
  const enAttente = mine.filter(r => r.statutSync !== "conflit").length;
  const conflits = mine.filter(r => r.statutSync === "conflit").length;
  const echecs = loadPendingQueue().filter(it => it.type === "enquete" && it._failed).length;
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", fontSize: 11.5, marginBottom: 10, color: "var(--c-text-muted)" }}>
      <span>{online ? "🟢 En ligne" : "🔴 Hors connexion"}</span>
      {syncing && <span>🟠 Synchronisation en cours…</span>}
      {enAttente > 0 && <span>🔵 {enAttente} enquête(s) en attente de synchronisation</span>}
      {conflits > 0 && <span style={{ color: "#B5451B" }}>⚠️ {conflits} conflit(s) à résoudre</span>}
      {echecs > 0 && <span style={{ color: "#B5451B" }}>🔴 {echecs} échec(s) — nouvelle tentative automatique</span>}
    </div>
  );
}

// Lecture de l'audio (natif : pause/reprise via les contrôles du navigateur) + saisie,
// modification et suivi du cycle de vie d'une transcription manuelle. Les actions de
// vérification/validation sont proposées côté client selon le statut et le rôle (estAdmin),
// mais l'autorisation réelle est toujours vérifiée côté serveur (voir la migration RLS) :
// un refus serveur remonte simplement comme message d'erreur, jamais de contournement ici.
function TranscriptionAudio({ preuve, transcription, brouillonLocal, estAdmin, onCommencer, onSauver, onSoumettre, onExaminer, onRouvrir }) {
  const valeurInitiale = (brouillonLocal ? brouillonLocal.texte : (transcription ? transcription.texte : "")) || "";
  const [texte, setTexte] = useState(valeurInitiale);
  const idRef = useRef(transcription && transcription.id);
  useEffect(() => {
    // Le champ n'est réinitialisé que lorsque la transcription change réellement (nouvelle
    // transcription, ou statut mis à jour côté serveur après une action) — jamais à chaque
    // frappe, pour ne pas effacer une saisie en cours.
    const idCourant = transcription && transcription.id;
    if (idCourant !== idRef.current) { idRef.current = idCourant; setTexte(valeurInitiale); }
  }, [transcription && transcription.id, transcription && transcription.statut]); // eslint-disable-line

  const dejaCommencee = !!transcription || !!brouillonLocal;
  const modifiable = !transcription || transcription.statut === "brouillon" || transcription.statut === "a_revoir";
  const statutAffiche = transcription ? transcription.statut : "brouillon";

  return (
    <div style={{ padding: "10px 0", borderTop: "1px solid var(--c-border)" }}>
      <audio src={preuve.url} controls style={{ width: "100%", marginBottom: 8 }} />
      {!dejaCommencee && (
        <button type="button" onClick={onCommencer} style={{ ...miniBtnStyle, borderColor: "var(--c-accent-dark)", color: "var(--c-accent-dark)" }}>Commencer la transcription</button>
      )}
      {dejaCommencee && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, fontSize: 11.5, flexWrap: "wrap" }}>
            <span style={{ padding: "2px 8px", borderRadius: 10, background: "rgba(0,0,0,0.06)", fontWeight: 600 }}>{TRANSCRIPTION_STATUTS[statutAffiche] || statutAffiche}</span>
            {transcription && <span style={{ color: "var(--c-text-muted)" }}>{transcription.cree_par}</span>}
            {brouillonLocal && <span style={{ color: "var(--c-text-muted)" }}> · 🔵 {transcription ? "modification" : "brouillon"} en attente de synchronisation</span>}
          </div>
          {transcription && transcription.commentaire_revision && <div style={{ fontSize: 12, color: "#B5451B", marginBottom: 6 }}>Commentaire : {transcription.commentaire_revision}</div>}
          <textarea value={texte} onChange={e => setTexte(e.target.value)} disabled={!modifiable} rows={4} placeholder="Saisir ici la transcription manuelle de l'enregistrement…"
            style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 13, resize: "vertical", marginBottom: 6, background: modifiable ? undefined : "rgba(0,0,0,0.04)" }} />
          {modifiable && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" onClick={() => onSauver(texte)} style={miniBtnStyle}>Enregistrer le brouillon</button>
              <button type="button" onClick={() => onSoumettre(texte)} disabled={!texte.trim() || !transcription}
                title={!transcription ? "En attente de synchronisation avant de pouvoir soumettre" : undefined}
                style={{ ...miniBtnStyle, borderColor: "var(--c-accent-dark)", color: "var(--c-accent-dark)" }}>Soumettre à vérification</button>
            </div>
          )}
          {estAdmin && transcription && transcription.statut === "soumise" && (
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <button type="button" onClick={() => onExaminer("verifiee")} style={{ ...miniBtnStyle, borderColor: "#2F6B3A", color: "#2F6B3A" }}>Vérifier</button>
              <button type="button" onClick={() => onExaminer("a_revoir")} style={miniBtnStyle}>Renvoyer pour correction</button>
              <button type="button" onClick={() => onExaminer("rejetee")} style={{ ...miniBtnStyle, borderColor: "#B5451B", color: "#B5451B" }}>Rejeter</button>
            </div>
          )}
          {estAdmin && transcription && transcription.statut === "verifiee" && (
            <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
              <button type="button" onClick={() => onExaminer("validee")} style={{ ...miniBtnStyle, borderColor: "#2F6B3A", color: "#2F6B3A" }}>Valider</button>
              <button type="button" onClick={() => onExaminer("a_revoir")} style={miniBtnStyle}>Renvoyer pour correction</button>
              <button type="button" onClick={() => onExaminer("rejetee")} style={{ ...miniBtnStyle, borderColor: "#B5451B", color: "#B5451B" }}>Rejeter</button>
            </div>
          )}
          {estAdmin && transcription && transcription.statut === "rejetee" && (
            <button type="button" onClick={onRouvrir} style={{ ...miniBtnStyle, marginTop: 6 }}>Rouvrir (revenir en brouillon)</button>
          )}
          {transcription && transcription.statut === "validee" && (
            <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginTop: 4 }}>
              Vérifiée par {transcription.verifie_par} · Validée par {transcription.valide_par} le {transcription.valide_at ? new Date(transcription.valide_at).toLocaleString("fr-FR") : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function EnquetesStandard({ email, organisationId, source, deviceId }) {
  const [liste, setListe] = useState(null);
  const [dossier, setDossier] = useState(null);
  const [ouvert, setOuvert] = useState(false);
  const [d, setD] = useState({});
  const [f, setF] = useState({ titre: "", type_enquete: "", categorie: "", profil_enqueteur: "", lat: "", lng: "", precision_gps_m: "", niveau_constat: "a_determiner", statut: "brouillon", signalement_id: "" });
  const [etape, setEtape] = useState(0);
  const [localId, setLocalId] = useState(null);
  const [conflit, setConflit] = useState(null); // instantané distant quand une modification concurrente est détectée
  const [preuvesLocales, setPreuvesLocales] = useState([]); // preuves ajoutées hors connexion, pas encore sur le serveur
  const [preuves, setPreuves] = useState([]);
  const [transcriptions, setTranscriptions] = useState({}); // par preuve_id, transcriptions connues du serveur
  const [transcriptionsLocales, setTranscriptionsLocales] = useState({}); // par preuve_id, brouillon en attente de synchronisation (même principe que preuvesLocales)
  const [np, setNp] = useState({ type: "photo", description: "", nature: "observe", fichier: null });
  const [sync, setSync] = useState("");
  const [erreur, setErreur] = useState("");
  const [busy, setBusy] = useState(false);
  const [filtreListeGroupe, setFiltreListeGroupe] = useState("");
  const [filtreListeGravite, setFiltreListeGravite] = useState("");
  const [filtreListeStatut, setFiltreListeStatut] = useState("");
  const [signalementLie, setSignalementLie] = useState(null);
  const [rechSignalement, setRechSignalement] = useState("");
  const [resultatsSignalement, setResultatsSignalement] = useState(null);
  const [rechBusy, setRechBusy] = useState(false);
  const latest = useRef({}); latest.current = { d, f, localId };

  const champStyle = { width: "100%", padding: 12, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 14, marginBottom: 10, boxSizing: "border-box", background: "var(--c-surface)", color: "var(--c-text)", fontFamily: "Work Sans, sans-serif" };
  const label = { fontSize: 12, fontWeight: 600, marginBottom: 4, display: "block" };
  const btn = (bg) => ({ flex: 1, padding: "12px 0", borderRadius: 10, border: bg ? "none" : "1px solid var(--c-border)", background: bg || "none", color: bg ? "#fff" : "var(--c-text)", fontWeight: 600, fontSize: 13.5, cursor: "pointer" });

  async function charger() {
    if (deviceId) { const r = await supabase.rpc("benevole_dossiers_assignes", { p_device: deviceId }); setListe(r.data || []); return; }
    const { data } = await supabase.from("enquete_dossiers").select("id, numero, titre, statut, categorie, niveau_constat, donnees, created_at").eq("is_deleted", false).order("created_at", { ascending: false }).limit(50);
    setListe(data || []);
  }
  useEffect(() => { charger(); }, []);

  // Temps réel de la liste des dossiers (équipe EcoVigil et organisations ; les droits restent
  // ceux de la RLS, qui limite les événements reçus). Le bénévole (deviceId) passe par une
  // fonction RPC et n'est pas concerné. Rechargement regroupé, et à chaque (re)connexion pour
  // rattraper les événements manqués.
  useEffect(() => {
    if (deviceId) return;
    let timer = null;
    const canal = supabase.channel(`dossiers-liste-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "enquete_dossiers" }, () => { clearTimeout(timer); timer = setTimeout(charger, 400); })
      .subscribe(status => { if (status === "SUBSCRIBED") charger(); });
    return () => { clearTimeout(timer); supabase.removeChannel(canal); };
  }, []);

  const [commentaireRevision, setCommentaireRevision] = useState("");
  // Examen d'un dossier par l'équipe EcoVigil (inspiré des statuts de validation de KoboToolbox) :
  // Vérifié, À revoir (renvoyé à l'enquêteur avec un commentaire) ou Rejeté. Fait directement en
  // ligne, hors file d'attente : c'est une décision immédiate du réviseur.
  async function examiner(nouveauStatut) {
    if (!dossier || !dossier.id) return;
    setErreur("");
    if (nouveauStatut !== "verifiee" && !commentaireRevision.trim()) { setErreur("Un commentaire est requis pour renvoyer un dossier à revoir ou le rejeter."); return; }
    const { data, error } = await supabase.from("enquete_dossiers").update({ statut: nouveauStatut, revision_commentaire: commentaireRevision.trim() || null }).eq("id", dossier.id).select().single();
    if (error) { setErreur("Examen impossible : " + error.message); return; }
    const rec = getOfflineEnquete(localId);
    if (rec) putOfflineEnquete({ ...rec, baseUpdatedAt: data.updated_at, cols: { ...rec.cols, statut: data.statut } });
    setDossier(data); setF(x => ({ ...x, statut: data.statut })); setCommentaireRevision(""); setSync("Examen enregistré ✓"); charger();
  }
  const [corbeille, setCorbeille] = useState(null);
  const [showCorbeille, setShowCorbeille] = useState(false);
  async function chargerCorbeille() {
    const { data } = await supabase.from("enquete_dossiers").select("id, numero, titre, statut, deleted_at, deleted_by").eq("is_deleted", true).order("deleted_at", { ascending: false }).limit(50);
    setCorbeille(data || []);
  }
  async function supprimerDossier() {
    if (!dossier || !dossier.id) return;
    if (!window.confirm("Supprimer ce dossier d'enquête ? " + (source === "admin" ? "" : "Il pourra être restauré par le Centre d'EcoVigil si besoin."))) return;
    const { error } = await supabase.from("enquete_dossiers").update({ is_deleted: true }).eq("id", dossier.id);
    if (error) { setErreur("Suppression impossible : " + error.message); return; }
    if (localId) retirerLocal(localId);
    setOuvert(false); charger();
  }
  async function restaurerDossier(id) {
    const { error } = await supabase.from("enquete_dossiers").update({ is_deleted: false }).eq("id", id);
    if (!error) chargerCorbeille();
  }
  async function supprimerDefinitivement(id) {
    if (!window.confirm("Supprimer définitivement ce dossier ? Cette action est irréversible.")) return;
    const { error } = await supabase.from("enquete_dossiers").delete().eq("id", id);
    if (!error) chargerCorbeille();
  }

  // Sauvegarde : toujours écrite d'abord dans la file d'attente locale (persiste hors connexion,
  // survit à la fermeture de l'app), puis synchronisée immédiatement si une connexion est
  // disponible — sinon elle attendra le retour du réseau (voir flushPendingQueue dans App).
  function sauverLocal() {
    const { d: dd, f: ff, localId: lid } = latest.current;
    if (!lid || !ff.titre.trim()) return;
    const num = (v) => (v === "" || v == null || isNaN(Number(v)) ? null : Number(v));
    const existant = getOfflineEnquete(lid);
    if (!existant) return; // dossier déjà entièrement synchronisé et retiré de la file locale
    const rec = { ...existant, cols: { titre: ff.titre.trim(), type_enquete: ff.type_enquete || null, categorie: ff.categorie || null, profil_enqueteur: ff.profil_enqueteur || null,
      lat: num(ff.lat), lng: num(ff.lng), precision_gps_m: num(ff.precision_gps_m), niveau_constat: ff.niveau_constat, statut: ff.statut, signalement_id: ff.signalement_id || null }, donnees: dd,
      statutSync: existant.statutSync === "conflit" ? "conflit" : "attente", updatedLocalAt: Date.now() };
    putOfflineEnquete(rec);
    declencherSync(lid);
  }
  async function declencherSync(lid) {
    if (!navigator.onLine) { enqueuePendingEnquete(lid); setSync("Hors ligne — dossier conservé sur l'appareil"); return; }
    try {
      const res = await syncOneDossierEnquete(lid);
      if (res && res.conflict) { const r = getOfflineEnquete(lid); setConflit(r ? r.conflitDistant : null); setSync("Conflit détecté — résolution nécessaire"); return; }
      if (res && res.remoteId) setDossier(d0 => ({ ...(d0 || {}), id: res.remoteId, numero: res.numero || (d0 && d0.numero), created_at: (d0 && d0.created_at) || new Date().toISOString() }));
      setSync("Enregistré ✓");
    } catch (e) {
      enqueuePendingEnquete(lid);
      setSync("Synchronisation impossible pour l'instant — nouvelle tentative automatique dès que possible");
    }
  }
  // Dossier en lecture seule pour cet utilisateur : vérifié ou rejeté (sauf pour l'équipe EcoVigil),
  // ou terminé pour un bénévole. On ne lance alors aucune sauvegarde automatique : le serveur la
  // refuserait et le dossier resterait indéfiniment "en attente de synchronisation".
  function estVerrouille() {
    const ferme = f.statut === "verifiee" || f.statut === "rejetee";
    return ferme ? source !== "admin" : !!(deviceId && f.statut === "terminee");
  }
  useEffect(() => { if (!ouvert || !localId || estVerrouille()) return; const t = setTimeout(sauverLocal, 1500); return () => clearTimeout(t); }, [d, f, ouvert, localId]);
  useEffect(() => {
    const onConflit = (ev) => { if (ev && ev.detail && ev.detail.localId === localId) { const r = getOfflineEnquete(localId); if (r) setConflit(r.conflitDistant); } };
    window.addEventListener("pace-enquete-conflit", onConflit);
    return () => window.removeEventListener("pace-enquete-conflit", onConflit);
  }, [localId]);

  // Purge, au chargement, des brouillons vides laissés par une ouverture/fermeture sans saisie.
  const [, setTickLocal] = useState(0);
  useEffect(() => {
    Object.values(loadOfflineEnquetes())
      .filter(r => r && (deviceId ? r.deviceId === deviceId : r.creePar === email) && estBrouillonVide(r))
      .forEach(r => retirerLocal(r.localId));
    setTickLocal(t => t + 1);
  }, []);

  // Fermeture du formulaire : un dossier encore vide n'est pas conservé comme "en attente".
  function fermer() {
    const r = localId ? getOfflineEnquete(localId) : null;
    if (r && estBrouillonVide(r) && !latest.current.f.titre.trim()) retirerLocal(localId);
    setOuvert(false); charger();
  }
  // Suppression d'une enquête locale en attente : un dossier jamais envoyé est perdu ; pour un
  // dossier déjà sur le serveur, seules les modifications locales non envoyées sont abandonnées.
  function supprimerLocal(r) {
    const nom = r.cols.titre || "Sans titre";
    const msg = r.remoteId
      ? `Abandonner les modifications, preuves ou transcriptions non envoyées de « ${nom} » ? Le dossier déjà enregistré sur le serveur n'est pas touché.`
      : `Supprimer l'enquête « ${nom} » ? Elle n'a jamais été envoyée au serveur : elle sera définitivement perdue.`;
    if (!window.confirm(msg)) return;
    retirerLocal(r.localId);
    setTickLocal(t => t + 1);
  }

  function nouveau() {
    const lid = uid() + uid();
    putOfflineEnquete({ localId: lid, remoteId: null, cols: { titre: "", type_enquete: "", categorie: "", profil_enqueteur: "", lat: "", lng: "", precision_gps_m: "", niveau_constat: "a_determiner", statut: "brouillon", signalement_id: "" },
      donnees: { date_heure: new Date().toISOString().slice(0, 16) }, preuvesLocales: [], transcriptionsLocales: {}, baseUpdatedAt: null, statutSync: "attente", creePar: email, source, organisationId: organisationId || null, deviceId: deviceId || null, updatedLocalAt: Date.now() });
    setLocalId(lid); setDossier(null); setPreuves([]); setPreuvesLocales([]); setTranscriptions({}); setTranscriptionsLocales({}); setConflit(null); setEtape(0); setErreur(""); setSync("");
    setD({ date_heure: new Date().toISOString().slice(0, 16) });
    setF({ titre: "", type_enquete: "", categorie: "", profil_enqueteur: "", lat: "", lng: "", precision_gps_m: "", niveau_constat: "a_determiner", statut: "brouillon", signalement_id: "" });
    setSignalementLie(null); setResultatsSignalement(null); setRechSignalement("");
    setOuvert(true);
  }
  async function ouvrir(id) {
    const data = deviceId ? (liste || []).find(x => x.id === id) : (await supabase.from("enquete_dossiers").select("*").eq("id", id).single()).data;
    if (!data) return;
    const { data: pr } = deviceId ? await supabase.rpc("benevole_dossier_preuves", { p_device: deviceId, p_dossier: id })
      : await supabase.from("enquete_dossier_preuves").select("*").eq("dossier_id", id).order("created_at");
    const { data: tr } = deviceId ? await supabase.rpc("benevole_dossier_transcriptions", { p_device: deviceId, p_dossier: id })
      : await supabase.from("enquete_preuve_transcriptions").select("*").eq("dossier_id", id);
    const trMap = {}; (tr || []).forEach(t => { trMap[t.preuve_id] = t; });
    // On rejoue l'édition sur une copie locale (même mécanisme que hors connexion) : si le réseau
    // coupe pendant la modification, rien n'est perdu et la synchronisation reprendra automatiquement.
    const existant = getOfflineEnquete(id);
    putOfflineEnquete({ localId: id, remoteId: id, cols: { titre: data.titre, type_enquete: data.type_enquete || "", categorie: data.categorie || "", profil_enqueteur: data.profil_enqueteur || "",
      lat: data.lat ?? "", lng: data.lng ?? "", precision_gps_m: data.precision_gps_m ?? "", niveau_constat: data.niveau_constat, statut: data.statut, signalement_id: data.signalement_id || "" },
      donnees: data.donnees || {}, preuvesLocales: (existant && existant.preuvesLocales) || [], transcriptionsLocales: (existant && existant.transcriptionsLocales) || {}, baseUpdatedAt: data.updated_at, numero: data.numero,
      statutSync: (existant && existant.statutSync === "conflit") ? "conflit" : "synced", conflitDistant: existant && existant.conflitDistant,
      creePar: data.cree_par, source, organisationId: data.organisation_id, deviceId: deviceId || null, updatedLocalAt: Date.now() });
    setLocalId(id); setDossier(data); setD(data.donnees || {}); setPreuves(pr || []); setPreuvesLocales((existant && existant.preuvesLocales) || []);
    setTranscriptions(trMap); setTranscriptionsLocales((existant && existant.transcriptionsLocales) || {});
    setConflit(existant && existant.statutSync === "conflit" ? existant.conflitDistant : null); setEtape(0); setErreur(""); setSync("");
    setF({ titre: data.titre, type_enquete: data.type_enquete || "", categorie: data.categorie || "", profil_enqueteur: data.profil_enqueteur || "", lat: data.lat ?? "", lng: data.lng ?? "", precision_gps_m: data.precision_gps_m ?? "", niveau_constat: data.niveau_constat, statut: data.statut, signalement_id: data.signalement_id || "" });
    setSignalementLie(null); setResultatsSignalement(null); setRechSignalement("");
    setOuvert(true);
  }
  function reprendreLocal(lid) {
    const r = getOfflineEnquete(lid);
    if (!r) return;
    setLocalId(lid); setDossier(r.remoteId ? { id: r.remoteId, numero: r.numero } : null); setD(r.donnees || {}); setPreuves([]); setPreuvesLocales(r.preuvesLocales || []);
    // Comme pour les preuves, la reprise hors connexion ne recharge pas les transcriptions déjà
    // sur le serveur (aucun accès réseau ici) : seuls les brouillons locaux en attente sont restitués.
    setTranscriptions({}); setTranscriptionsLocales(r.transcriptionsLocales || {});
    setConflit(r.statutSync === "conflit" ? r.conflitDistant : null); setEtape(0); setErreur(""); setSync("");
    setF({ titre: r.cols.titre, type_enquete: r.cols.type_enquete || "", categorie: r.cols.categorie || "", profil_enqueteur: r.cols.profil_enqueteur || "", lat: r.cols.lat ?? "", lng: r.cols.lng ?? "", precision_gps_m: r.cols.precision_gps_m ?? "", niveau_constat: r.cols.niveau_constat, statut: r.cols.statut, signalement_id: r.cols.signalement_id || "" });
    setSignalementLie(null); setResultatsSignalement(null); setRechSignalement("");
    setOuvert(true);
  }
  // Recherche puis liaison/déliaison d'un signalement citoyen à l'origine du dossier — la relation
  // est facultative dans les deux sens : un dossier fonctionne très bien sans signalement, et
  // inversement.
  async function rechercherSignalements() {
    const q = rechSignalement.trim();
    if (!q) { setResultatsSignalement([]); return; }
    setRechBusy(true);
    let query = supabase.from("signalements").select("id, categorie, description, urgence, lat, lng, statut, created_at").eq("is_deleted", false).order("created_at", { ascending: false }).limit(6);
    query = /^[0-9a-f-]{6,}$/i.test(q) ? query.ilike("id", q + "%") : query.ilike("description", "%" + q + "%");
    const { data, error } = await query;
    setRechBusy(false);
    setResultatsSignalement(error ? [] : (data || []));
  }
  function lierSignalement(s) {
    setF(x => ({ ...x, signalement_id: s.id })); setSignalementLie(s); setResultatsSignalement(null); setRechSignalement("");
  }
  function delierSignalement() { setF(x => ({ ...x, signalement_id: "" })); setSignalementLie(null); }
  function reprendrePositionSignalement() {
    if (!signalementLie || signalementLie.lat == null) return;
    setF(x => ({ ...x, lat: signalementLie.lat, lng: signalementLie.lng, precision_gps_m: "" }));
  }
  useEffect(() => {
    if (!f.signalement_id) { setSignalementLie(null); return; }
    if (signalementLie && signalementLie.id === f.signalement_id) return;
    supabase.from("signalements").select("id, categorie, description, urgence, lat, lng, statut, created_at").eq("id", f.signalement_id).single()
      .then(({ data }) => setSignalementLie(data || null));
  }, [f.signalement_id]);
  // Résolution de conflit : soit on impose la version locale (écrase la version serveur), soit on
  // adopte la version serveur (la modification locale concurrente est abandonnée, mais reste dans
  // l'historique du serveur puisque quelqu'un d'autre l'a bien enregistrée).
  function resoudreGarderMaVersion() {
    const r = getOfflineEnquete(localId); if (!r) return;
    putOfflineEnquete({ ...r, baseUpdatedAt: conflit ? conflit.updated_at : r.baseUpdatedAt, statutSync: "attente", conflitDistant: null });
    setConflit(null); declencherSync(localId);
  }
  function resoudreGarderVersionServeur() {
    if (!conflit) return;
    setD(conflit.donnees || {}); setF({ titre: conflit.titre, type_enquete: conflit.type_enquete || "", categorie: conflit.categorie || "", profil_enqueteur: conflit.profil_enqueteur || "",
      lat: conflit.lat ?? "", lng: conflit.lng ?? "", precision_gps_m: conflit.precision_gps_m ?? "", niveau_constat: conflit.niveau_constat, statut: conflit.statut });
    const r = getOfflineEnquete(localId);
    if (r) putOfflineEnquete({ ...r, cols: { titre: conflit.titre, type_enquete: conflit.type_enquete, categorie: conflit.categorie, profil_enqueteur: conflit.profil_enqueteur, lat: conflit.lat, lng: conflit.lng, precision_gps_m: conflit.precision_gps_m, niveau_constat: conflit.niveau_constat, statut: conflit.statut }, donnees: conflit.donnees || {}, baseUpdatedAt: conflit.updated_at, statutSync: "synced", conflitDistant: null });
    setConflit(null); setSync("Version du serveur adoptée");
  }

  const val = (k) => (d[k] && d[k].valeur !== undefined ? d[k].valeur : (typeof d[k] === "string" ? d[k] : ""));
  const setVal = (k, v) => setD(p => ({ ...p, [k]: { ...(p[k] && typeof p[k] === "object" ? p[k] : {}), valeur: v, nature: (p[k] && p[k].nature) || "observe" } }));
  const setNature = (k, n) => setD(p => ({ ...p, [k]: { ...(p[k] || {}), nature: n } }));
  const setSimple = (k, v) => setD(p => ({ ...p, [k]: v }));
  const champ = (k, lab, rows, avecNature) => (
    <div key={k}>
      <label style={label}>{lab}</label>
      {rows ? <textarea value={val(k)} onChange={e => setVal(k, e.target.value)} rows={rows} style={{ ...champStyle, resize: "vertical" }} />
            : <input value={val(k)} onChange={e => setVal(k, e.target.value)} style={champStyle} />}
      {avecNature && <select value={(d[k] && d[k].nature) || "observe"} onChange={e => setNature(k, e.target.value)} style={{ ...champStyle, padding: 8, fontSize: 12, marginTop: -4 }}>
        {ENQ_NATURES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
    </div>
  );
  const multi = (k, options) => {
    const cur = d[k] || [];
    return <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>{options.map(o => {
      const on = cur.includes(o);
      return <button key={o} type="button" onClick={() => setSimple(k, on ? cur.filter(x => x !== o) : [...cur, o])}
        style={{ padding: "10px 12px", borderRadius: 20, border: `1px solid ${on ? "var(--c-accent-dark)" : "var(--c-border)"}`, background: on ? "var(--c-accent-dark)" : "none", color: on ? "#fff" : "var(--c-text)", fontSize: 12.5, cursor: "pointer" }}>{o}</button>;
    })}</div>;
  };
  // Évaluation d'impact par domaine : niveau + justification obligatoire si Élevé/Critique
  const setImpact = (dom, patch) => setD(p => ({ ...p, impacts_eval: { ...(p.impacts_eval || {}), [dom]: { ...((p.impacts_eval || {})[dom] || {}), ...patch } } }));
  const impactsRenseignes = () => Object.values(d.impacts_eval || {}).filter(x => x && x.niveau);
  const impactsJustifManquante = () => Object.entries(d.impacts_eval || {}).filter(([, v]) => v && ENQ_IMPACT_JUSTIF_REQUISE.includes(v.niveau) && !(v.justification || "").trim()).map(([k]) => k);

  function localiser() {
    if (!navigator.geolocation) { setErreur("La géolocalisation n'est pas disponible sur cet appareil."); return; }
    navigator.geolocation.getCurrentPosition(
      p => setF(x => ({ ...x, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6), precision_gps_m: Math.round(p.coords.accuracy) })),
      () => setErreur("Position refusée ou indisponible : saisis les coordonnées manuellement, ou coche « position GPS indisponible »."), { enableHighAccuracy: true, timeout: 15000 });
  }

  async function ajouterPreuve() {
    if (!localId) { setErreur("Le dossier doit d'abord être créé (retourne à l'étape Identification)."); return; }
    if (!np.description.trim() && !np.fichier) return;
    setBusy(true);
    let dataUrl = null;
    try { if (np.fichier) dataUrl = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(np.fichier); }); } catch (e) {}
    const lat0 = f.lat === "" ? null : Number(f.lat), lng0 = f.lng === "" ? null : Number(f.lng), desc0 = np.description.trim() || null, cap0 = new Date().toISOString();
    // La preuve est d'abord posée dans la file locale (fonctionne hors connexion) ; l'envoi de la
    // photo et son association au dossier se font lors de la synchronisation (voir syncOneDossierEnquete).
    const item = { id: uid() + uid(), type: np.type, description: desc0, nature: np.nature, capture_at: cap0, lat: lat0, lng: lng0, ajoutePar: email, dataUrl: (np.type === "photo" || np.type === "audio") ? dataUrl : null, deviceId: deviceId || null };
    const rec = getOfflineEnquete(localId);
    if (rec) putOfflineEnquete({ ...rec, preuvesLocales: [...(rec.preuvesLocales || []), item], updatedLocalAt: Date.now() });
    setPreuvesLocales(p => [...p, item]);
    setBusy(false);
    setNp({ type: np.type, description: "", nature: "observe", fichier: null });
    declencherSync(localId);
  }

  // -- Transcription manuelle des enregistrements audio ------------------
  // Une transcription est un texte saisi par un utilisateur autorisé, jamais généré
  // automatiquement, rattaché à une preuve de type "audio" déjà synchronisée (l'audio
  // original n'est jamais modifié — voir syncOneDossierEnquete). Le cycle de vie
  // (brouillon → soumise → vérifiée → validée, ou renvoyée/rejetée) est appliqué et
  // tracé côté serveur (trigger + historique du dossier) ; le client se contente de
  // proposer les actions correspondant à l'étape en cours et d'afficher les refus.
  const estAdmin = source === "admin" && !deviceId;

  // Enregistre le brouillon localement puis tente la synchronisation (voir déclencherSync /
  // syncOneDossierEnquete) : fonctionne hors connexion exactement comme l'édition du dossier
  // ou l'ajout d'une preuve, sans file d'attente séparée. transcriptionId reste null tant que
  // la transcription n'a jamais été créée côté serveur — la synchronisation la créera alors ;
  // il vaut l'identifiant existant s'il s'agit de la modification d'une transcription déjà connue.
  function sauverTranscriptionLocal(preuveId, texte) {
    const existante = transcriptions[preuveId];
    const rec = getOfflineEnquete(localId);
    const entree = { transcriptionId: existante ? existante.id : null, texte, updatedLocalAt: Date.now() };
    if (rec) putOfflineEnquete({ ...rec, transcriptionsLocales: { ...(rec.transcriptionsLocales || {}), [preuveId]: entree } });
    setTranscriptionsLocales(t => ({ ...t, [preuveId]: entree }));
    declencherSync(localId);
  }

  async function creerTranscription(preuveId) {
    setErreur("");
    // Hors connexion : on ouvre un brouillon local vide, créé côté serveur à la prochaine
    // synchronisation — même mécanisme que la modification d'un brouillon existant, pour ne
    // jamais bloquer le démarrage d'une transcription faute de réseau.
    if (!navigator.onLine) { sauverTranscriptionLocal(preuveId, ""); return; }
    try {
      const r = deviceId
        ? await supabase.rpc("benevole_transcription_creer", { p_device: deviceId, p_preuve_id: preuveId, p_texte: "" })
        : await supabase.from("enquete_preuve_transcriptions").insert({ preuve_id: preuveId, dossier_id: dossier.id, texte: "" }).select().single();
      if (r.error) throw r.error;
      setTranscriptions(t => ({ ...t, [preuveId]: r.data }));
    } catch (e) { setErreur("Impossible de commencer la transcription : " + e.message); }
  }

  async function soumettreTranscription(preuveId, texteActuel) {
    setErreur("");
    const existante = transcriptions[preuveId];
    if (!existante) return;
    if (!navigator.onLine) { setErreur("Une connexion est nécessaire pour soumettre une transcription à vérification."); return; }
    const texte = (texteActuel != null ? texteActuel : existante.texte) || "";
    if (!texte.trim()) { setErreur("La transcription ne peut pas être soumise vide."); return; }
    try {
      // On pousse d'abord explicitement le texte actuellement affiché s'il diffère de la
      // dernière version connue du serveur — qu'il ait ou non déjà été enregistré comme
      // brouillon : la soumission ne doit jamais dépendre d'un délai de synchronisation en
      // arrière-plan qu'elle ne contrôle pas, ni silencieusement perdre une saisie non enregistrée.
      if (texte !== existante.texte) {
        const rMaj = deviceId
          ? await supabase.rpc("benevole_transcription_maj", { p_device: deviceId, p_transcription_id: existante.id, p_texte: texte })
          : await supabase.from("enquete_preuve_transcriptions").update({ texte }).eq("id", existante.id);
        if (rMaj.error) throw rMaj.error;
      }
      const rec = getOfflineEnquete(localId);
      if (rec && rec.transcriptionsLocales && rec.transcriptionsLocales[preuveId]) {
        const restantes = { ...rec.transcriptionsLocales }; delete restantes[preuveId];
        putOfflineEnquete({ ...rec, transcriptionsLocales: restantes });
      }
      setTranscriptionsLocales(t => { if (!t[preuveId]) return t; const s = { ...t }; delete s[preuveId]; return s; });
      const r = deviceId
        ? await supabase.rpc("benevole_transcription_soumettre", { p_device: deviceId, p_transcription_id: existante.id })
        : await supabase.from("enquete_preuve_transcriptions").update({ statut: "soumise" }).eq("id", existante.id).select().single();
      if (r.error) throw r.error;
      setTranscriptions(t => ({ ...t, [preuveId]: r.data }));
    } catch (e) { setErreur("Soumission impossible : " + e.message); }
  }

  // Vérification et validation sont réservées à l'équipe EcoVigil (voir estAdmin) ; le serveur
  // applique de toute façon la même règle. Ce contrôle côté client n'est qu'un confort
  // d'affichage — le serveur reste la seule source d'autorité.
  async function examinerTranscription(preuveId, nouveauStatut) {
    setErreur("");
    const existante = transcriptions[preuveId];
    if (!existante) return;
    let commentaire_revision = null;
    if (nouveauStatut === "a_revoir" || nouveauStatut === "rejetee") {
      commentaire_revision = window.prompt("Commentaire (obligatoire) pour " + (nouveauStatut === "rejetee" ? "rejeter" : "renvoyer pour correction") + " cette transcription :");
      if (!commentaire_revision || !commentaire_revision.trim()) return;
    }
    const { data, error } = await supabase.from("enquete_preuve_transcriptions").update({ statut: nouveauStatut, commentaire_revision }).eq("id", existante.id).select().single();
    if (error) { setErreur("Examen impossible : " + error.message); return; }
    setTranscriptions(t => ({ ...t, [preuveId]: data }));
  }

  async function rouvrirTranscription(preuveId) {
    setErreur("");
    const existante = transcriptions[preuveId];
    if (!existante) return;
    const { data, error } = await supabase.from("enquete_preuve_transcriptions").update({ statut: "brouillon" }).eq("id", existante.id).select().single();
    if (error) { setErreur("Réouverture impossible : " + error.message); return; }
    setTranscriptions(t => ({ ...t, [preuveId]: data }));
  }

  // ---- Contrôle des champs obligatoires avant soumission définitive (ne bloque jamais l'enregistrement en brouillon) ----
  function champsManquants() {
    const m = [];
    if (!f.titre.trim()) m.push("le titre (étape Identification)");
    if (!f.type_enquete) m.push("le type d'enquête (étape Identification)");
    if (!f.categorie) m.push("le type de problème (étape Identification)");
    if (f.categorie === "autre" && !val("type_probleme_precision").trim()) m.push("la précision du problème « Autre » (étape Identification)");
    if (!val("localite").trim() && !val("quartier").trim() && !val("commune").trim()) m.push("la localité / zone (étape Localisation)");
    const gpsOk = (f.lat !== "" && f.lng !== "" && !isNaN(Number(f.lat)) && !isNaN(Number(f.lng)));
    if (!gpsOk && !d.gps_indisponible) m.push("les coordonnées GPS, ou à défaut la case « position GPS indisponible » avec son motif (étape Localisation)");
    if (d.gps_indisponible && !val("gps_indisponible_motif").trim()) m.push("le motif d'indisponibilité du GPS (étape Localisation)");
    if (!val("faits_observes").trim()) m.push("la description des faits observés (étape Constat)");
    if (impactsRenseignes().length === 0) m.push("au moins une évaluation d'impact (étape Impacts)");
    if (impactsJustifManquante().length > 0) m.push("la justification des impacts Élevé/Critique : " + impactsJustifManquante().join(", ") + " (étape Impacts)");
    if (f.niveau_constat === "a_determiner") m.push("un niveau de gravité déterminé, autre que « à déterminer » (étape Niveau & actions)");
    if (ENQ_GRAVITE_PREUVE_OBLIGATOIRE.includes(f.niveau_constat) && (preuves.length + preuvesLocales.length) === 0 && !(d.preuve_absente && val("preuve_absente_motif").trim())) {
      m.push("au moins une preuve, ou à défaut la case « aucune preuve disponible » avec son motif (étape Preuves) — obligatoire pour un niveau Grave, Très grave ou Critique");
    }
    return m;
  }

  async function valider(statut) {
    setErreur("");
    if (statut === "terminee") {
      const m = champsManquants();
      if (m.length > 0) { setErreur("Impossible de valider, il manque : " + m.join(" ; ") + "."); return; }
    }
    latest.current = { ...latest.current, f: { ...latest.current.f, statut } }; setF(x => ({ ...x, statut }));
    sauverLocal(); await declencherSync(localId); charger();
  }

  const nomType = (id) => (ENQ_CAT_FLAT.find(t => t[0] === id) || [])[1] || "—";
  const nomGroupe = (id) => (ENQ_CAT_FLAT.find(t => t[0] === id) || [])[3] || "";
  const nomTypeEnquete = (id) => (ENQ_TYPE_ENQUETE.find(t => t[0] === id) || [])[1] || "—";
  const nomNature = (n) => (ENQ_NATURES.find(t => t[0] === n) || [])[1] || "";
  const ligne = (l, v, n) => v ? <div style={{ fontSize: 12.5, padding: "5px 0", borderTop: "1px solid var(--c-border)" }}><b>{l}</b> : {v} {n && <em style={{ color: "var(--c-text-muted)" }}>({nomNature(n)})</em>}</div> : null;
  const carte = f.lat !== "" && f.lng !== "" && !isNaN(Number(f.lat)) && !isNaN(Number(f.lng));

  // ---- Rapport (ouvert dans un nouvel onglet, imprimable / enregistrable en PDF) ----
  async function rapport() {
    const w = window.open("", "_blank");
    if (!w) { setErreur("Autorise l'ouverture de fenêtres pour générer le rapport."); return; }
    w.document.write("<p style='font-family:sans-serif'>Génération du rapport…</p>");
    const { data: h } = await supabase.from("enquete_dossier_historique").select("*").eq("dossier_id", dossier.id).order("created_at");
    const e = (x) => String(x == null ? "" : x).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const dt = (x) => x ? new Date(x).toLocaleString("fr-FR") : "";
    const nat = (n) => n ? ` <small class="n">[${e(nomNature(n))}]</small>` : "";
    const lieu = [val("localite"), val("quartier"), val("commune"), val("sous_prefecture"), val("prefecture"), val("region")].filter(Boolean).join(", ");
    const niveauT = ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [];
    const niveau = niveauT[1] || "";
    const gps = carte ? `${f.lat}, ${f.lng}${f.precision_gps_m !== "" ? " (± " + f.precision_gps_m + " m)" : ""}` : (d.gps_indisponible ? "Non disponible — " + val("gps_indisponible_motif") : "");
    const impactsLignes = Object.entries(d.impacts_eval || {}).filter(([, v]) => v && v.niveau).map(([k, v]) => `${k} : ${(ENQ_IMPACT_NIVEAUX.find(n => n[0] === v.niveau) || [])[1]}${v.justification ? " — " + v.justification : ""}`);
    const lignes = [["Type d'enquête", nomTypeEnquete(f.type_enquete), ""], ["Type de problème", nomGroupe(f.categorie) + " > " + nomType(f.categorie), ""], ["Signalement lié", signalementLie ? ((signalementLie.categorie || "Signalement") + " du " + dt(signalementLie.created_at)) : "", ""], ["Date et heure", dt(d.date_heure), ""], ["Lieu", lieu, ""], ["Coordonnées GPS", gps, ""],
      ["Faits observés", val("faits_observes"), "observe"], ["Période d'apparition", val("periode"), ""], ["Étendue", val("etendue"), ""], ["Fréquence", val("frequence"), ""],
      ["Causes observables", val("causes_observables"), d.causes_observables && d.causes_observables.nature], ["Informations recueillies (tiers)", val("informations_recueillies"), "declare"],
      ["Analyse et recommandations de l'enquêteur", val("analyse_recommandations"), ""], ["Impacts évalués", impactsLignes.join(" ; "), ""],
      ["Personnes / structures concernées (responsabilité non établie)", val("acteurs"), d.acteurs && d.acteurs.nature], ["Niveau de gravité", niveau, ""],
      ["Actions réalisées", (d.actions || []).join(", "), ""], ["Mesures proposées", val("mesures"), ""], ["Actions prioritaires", val("priorites"), ""], ["Autorité à saisir", val("autorite"), ""], ["Besoin de suivi", val("suivi"), ""], ["Observations complémentaires", val("observations"), ""]].filter(l => l[1]);
    const events = [{ t: dossier.created_at, l: "Création du dossier" }, ...(h || []).filter(x => x.action !== "creation").map(x => ({ t: x.created_at, l: (x.action === "changement_statut" ? `Statut : ${ENQ_STATUTS[x.ancien_statut]} → ${ENQ_STATUTS[x.nouveau_statut]}` : "Modification") + (x.auteur ? " par " + x.auteur : "") })),
      ...preuves.map(p => ({ t: p.capture_at || p.created_at, l: `Preuve (${(ENQ_PREUVES.find(t => t[0] === p.type) || [])[1]}) : ${p.description || ""}` })),
      ...(dossier.verifie_at ? [{ t: dossier.verifie_at, l: "Vérification par " + dossier.verificateur }] : [])].sort((a, b) => new Date(a.t) - new Date(b.t));
    const imgs = preuves.filter(p => p.url);
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${e(dossier.numero)} — ${e(f.titre)}</title><style>
body{font-family:Georgia,serif;max-width:800px;margin:24px auto;padding:0 16px;color:#1b2a1f;line-height:1.5}h1{font-size:22px;margin:0}h2{font-size:15px;border-bottom:2px solid #2E7D4F;padding-bottom:3px;margin-top:26px;color:#1F5C38}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid #cfd8d2;padding:6px 8px;text-align:left;vertical-align:top}th{background:#eef4f0;width:32%}.n{color:#666}.fiche{background:#eef4f0;padding:10px 14px;border-radius:8px;font-size:13px}
.gal{display:flex;flex-wrap:wrap;gap:10px}.gal figure{margin:0;width:230px;font-size:11px}.gal img{width:100%;border-radius:6px}iframe{width:100%;height:260px;border:1px solid #cfd8d2}
button{padding:8px 14px;margin-bottom:10px}@media print{button{display:none}}</style></head><body>
<button onclick="print()">Imprimer / Enregistrer en PDF</button>
<h1>${e(f.titre)}</h1><div class="fiche"><b>${e(dossier.numero)}</b> · ${e(ENQ_STATUTS[f.statut] || "")} · ${e(nomTypeEnquete(f.type_enquete))} · Gravité : ${e(niveau)} · ${e(nomGroupe(f.categorie))} — ${e(nomType(f.categorie))}<br>${e(lieu)}${gps ? " · GPS " + e(gps) : ""}<br>Enquêteur : ${e(email)}${organisationId ? " (organisation)" : ""} · Créé le ${e(dt(dossier.created_at))}${dossier.verificateur ? " · Vérifié par " + e(dossier.verificateur) + " le " + e(dt(dossier.verifie_at)) : ""}</div>
<h2>Rapport narratif</h2>
<p>Le ${e(dt(d.date_heure) || dt(dossier.created_at))}, ${e(email)} a mené une ${e(nomTypeEnquete(f.type_enquete)).toLowerCase()} concernant un problème de type « ${e(nomType(f.categorie))} »${lieu ? " à " + e(lieu) : ""}.</p>
${val("faits_observes") ? `<p><b>Faits observés</b> <small class="n">[Observé]</small> : ${e(val("faits_observes"))}</p>` : ""}${val("causes_observables") ? `<p><b>Causes observables</b>${nat(d.causes_observables && d.causes_observables.nature)} : ${e(val("causes_observables"))}</p>` : ""}
${val("informations_recueillies") ? `<p><b>Informations recueillies auprès de tiers</b> <small class="n">[Déclaré — non vérifié directement]</small> : ${e(val("informations_recueillies"))}</p>` : ""}
${impactsLignes.length ? `<p><b>Impacts évalués</b> : ${e(impactsLignes.join(" ; "))}.</p>` : ""}
${val("acteurs") ? `<p><b>Personnes ou structures concernées</b>${nat(d.acteurs && d.acteurs.nature)} : ${e(val("acteurs"))}. Cette mention n'établit aucune responsabilité.</p>` : ""}<p>Niveau de gravité : <b>${e(niveau)}</b>${niveauT[2] ? " — " + e(niveauT[2]) : ""}</p>
${val("analyse_recommandations") ? `<p><b>Analyse et recommandations de l'enquêteur</b> : ${e(val("analyse_recommandations"))}</p>` : ""}${val("mesures") ? `<p><b>Mesures proposées</b> : ${e(val("mesures"))}</p>` : ""}
<h2>Tableau structuré</h2><table>${lignes.map(l => `<tr><th>${e(l[0])}</th><td>${e(l[1])}${nat(l[2])}</td></tr>`).join("")}</table>
${carte ? `<h2>Carte de localisation</h2><iframe src="https://www.openstreetmap.org/export/embed.html?bbox=${Number(f.lng) - 0.005}%2C${Number(f.lat) - 0.003}%2C${Number(f.lng) + 0.005}%2C${Number(f.lat) + 0.003}&layer=mapnik&marker=${f.lat}%2C${f.lng}"></iframe><p><small>${e(gps)}</small></p>` : ""}
<h2>Éléments de preuve</h2>${preuves.length ? `<table>${preuves.map(p => `<tr><th>${e((ENQ_PREUVES.find(t => t[0] === p.type) || [])[1])}</th><td>${e(p.description)}${nat(p.nature)}<br><small class="n">${e(dt(p.capture_at || p.created_at))}${p.lat != null ? " · " + p.lat + ", " + p.lng : ""}</small></td></tr>`).join("")}</table>` : `<p>Aucune preuve enregistrée.${d.preuve_absente ? " Motif : " + e(val("preuve_absente_motif")) : ""}</p>`}
${imgs.length ? `<h2>Galerie</h2><div class="gal">${imgs.map(p => `<figure><img src="${e(p.url)}"><figcaption>${e(p.description)}${nat(p.nature)}</figcaption></figure>`).join("")}</div>` : ""}
<h2>Chronologie</h2><table>${events.map(x => `<tr><th>${e(dt(x.t))}</th><td>${e(x.l)}</td></tr>`).join("")}</table>
<p><small class="n">Légende : Observé = constaté directement · Déclaré = rapporté par un tiers · Supposé = hypothèse · À vérifier = non confirmé.</small></p></body></html>`;
    w.document.open(); w.document.write(html); w.document.close();
  }

  const [hist, setHist] = useState([]);
  useEffect(() => { if (etape === 6 && dossier && !deviceId) supabase.from("enquete_dossier_historique").select("*").eq("dossier_id", dossier.id).order("created_at", { ascending: false }).limit(30).then(r => setHist(r.data || [])); }, [etape, dossier && dossier.id, sync]);
  const [bens, setBens] = useState([]); const [assignes, setAssignes] = useState([]); const [choix, setChoix] = useState("");
  async function chargerAssign() {
    if (deviceId || !dossier) return;
    const { data: a } = await supabase.from("enquete_dossier_assignations").select("id, benevole_id").eq("dossier_id", dossier.id);
    const { data: b } = await supabase.from("benevoles").select("id, nom, ville").eq("statut", "valide").eq("is_deleted", false);
    setBens(b || []); setAssignes(a || []);
  }
  useEffect(() => { chargerAssign(); }, [dossier && dossier.id, ouvert]);
  async function assigner() {
    if (!choix) return;
    const { error } = await supabase.from("enquete_dossier_assignations").insert({ dossier_id: dossier.id, benevole_id: choix, assigne_par: email });
    if (error) setErreur("Assignation impossible : " + error.message); else { setChoix(""); chargerAssign(); }
  }
  async function retirer(id) { await supabase.from("enquete_dossier_assignations").delete().eq("id", id); chargerAssign(); }

  function listeFiltree() {
    return (liste || []).filter(x => (!filtreListeGroupe || (ENQ_CAT_FLAT.find(t => t[0] === x.categorie) || [])[2] === filtreListeGroupe) && (!filtreListeGravite || x.niveau_constat === filtreListeGravite) && (!filtreListeStatut || x.statut === filtreListeStatut));
  }

  // ---- Liste ----
  if (!ouvert) {
    const enAttenteLoc = Object.values(loadOfflineEnquetes()).filter(r => r && (deviceId ? r.deviceId === deviceId : r.creePar === email) && estEnAttente(r));
    return (
      <div style={{ margin: "14px 0" }}>
        <IndicateurConnexionEnquetes email={email} deviceId={deviceId} />
        {!deviceId && <button onClick={nouveau} style={{ ...btn("var(--c-accent-dark)"), width: "100%", flex: "none" }}>+ Enquête environnementale standard</button>}
        {deviceId && liste && liste.length > 0 && <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Dossiers d'enquête qui vous sont assignés</div>}
        {enAttenteLoc.length > 0 && <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Enquêtes en attente de synchronisation</div>
          {enAttenteLoc.map(r => (
            <div key={r.localId} style={{ background: "var(--c-surface)", border: `1px solid ${r.statutSync === "conflit" ? "#B5451B" : "var(--c-border)"}`, borderRadius: 12, padding: 12, marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{r.cols.titre || "Sans titre"}</div>
              <div style={{ fontSize: 11, color: r.statutSync === "conflit" ? "#B5451B" : "var(--c-text-muted)", marginTop: 2 }}>{r.statutSync === "conflit" ? "⚠️ Conflit à résoudre" : "🔵 En attente" + (r.remoteId ? (r.statutSync === "synced" ? " (preuves non envoyées)" : " (modifications non envoyées)") : " (jamais synchronisée)")}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button onClick={() => reprendreLocal(r.localId)} style={{ ...btn("var(--c-accent-dark)"), padding: "8px 0", fontSize: 12 }}>{r.statutSync === "conflit" ? "Résoudre le conflit" : "Continuer"}</button>
                <button onClick={() => supprimerLocal(r)} style={{ ...btn(), padding: "8px 0", fontSize: 12, color: "#B5451B", border: "1px solid #B5451B" }}>{r.remoteId ? "Abandonner les modifications" : "Supprimer"}</button>
              </div>
            </div>))}
        </div>}
        {liste && liste.length > 0 && <div style={{ marginTop: 10 }}>
          {!deviceId && <>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
              <select value={filtreListeGroupe} onChange={e => setFiltreListeGroupe(e.target.value)} style={{ ...champStyle, marginBottom: 0, width: "auto", fontSize: 12, padding: "6px 8px" }}>
                <option value="">Toutes catégories</option>{ENQ_CATEGORIES.map(([gk, gl]) => <option key={gk} value={gk}>{gl}</option>)}
              </select>
              <select value={filtreListeGravite} onChange={e => setFiltreListeGravite(e.target.value)} style={{ ...champStyle, marginBottom: 0, width: "auto", fontSize: 12, padding: "6px 8px" }}>
                <option value="">Toutes gravités</option>{ENQ_NIVEAUX.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
              <select value={filtreListeStatut} onChange={e => setFiltreListeStatut(e.target.value)} style={{ ...champStyle, marginBottom: 0, width: "auto", fontSize: 12, padding: "6px 8px" }}>
                <option value="">Tous statuts</option>{Object.entries(ENQ_STATUTS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            {(() => {
              const lf = listeFiltree();
              const zoneDe = (x) => { const dd = x.donnees || {}; const v = (k) => (dd[k] && dd[k].valeur) || (typeof dd[k] === "string" ? dd[k] : ""); return v("commune") || v("quartier") || v("localite") || ""; };
              const parGroupe = {}; lf.forEach(x => { const g = nomGroupe(x.categorie) || "Non classé"; parGroupe[g] = (parGroupe[g] || 0) + 1; });
              const parZone = {}; lf.forEach(x => { const z = zoneDe(x); if (z) parZone[z] = (parZone[z] || 0) + 1; });
              const topZones = Object.entries(parZone).sort((a, b) => b[1] - a[1]).slice(0, 5);
              function exporter() {
                const cols = [{ key: "numero", label: "Numéro" }, { key: "titre", label: "Titre" }, { key: "categorie", label: "Catégorie" }, { key: "sous_categorie", label: "Sous-catégorie" }, { key: "gravite", label: "Gravité" }, { key: "statut", label: "Statut" }, { key: "zone", label: "Localité" }, { key: "date", label: "Date de création" }];
                const rows = lf.map(x => ({ numero: x.numero, titre: x.titre, categorie: nomGroupe(x.categorie), sous_categorie: nomType(x.categorie), gravite: (ENQ_NIVEAUX.find(n => n[0] === x.niveau_constat) || [])[1] || "", statut: ENQ_STATUTS[x.statut], zone: zoneDe(x), date: new Date(x.created_at).toLocaleDateString("fr-FR") }));
                exportExcel(`ecovigil-enquetes-${new Date().toISOString().slice(0, 10)}.xlsx`, rows, cols, "Tableau de suivi des enquêtes");
              }
              return (
                <>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "var(--c-text-muted)", marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, color: "var(--c-text)" }}>{lf.length} dossier(s)</span>
                    {ENQ_NIVEAUX.filter(n => n[0] !== "a_determiner").map(([v, l]) => { const n = lf.filter(x => x.niveau_constat === v).length; return n > 0 ? <span key={v}>{l} : {n}</span> : null; })}
                  </div>
                  {Object.keys(parGroupe).length > 0 && <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "var(--c-text-muted)", marginBottom: 6 }}>
                    {Object.entries(parGroupe).sort((a, b) => b[1] - a[1]).map(([g, n]) => <span key={g}>{g} : {n}</span>)}
                  </div>}
                  {topZones.length > 0 && <div style={{ display: "flex", gap: 10, flexWrap: "wrap", fontSize: 11, color: "var(--c-text-muted)", marginBottom: 8 }}>
                    <span>Principales zones :</span>{topZones.map(([z, n]) => <span key={z}>{z} ({n})</span>)}
                  </div>}
                  <button type="button" onClick={exporter} style={{ ...btn(), width: "100%", flex: "none", marginBottom: 10, fontSize: 12.5, padding: "8px 0" }}>Exporter le tableau de suivi (Excel)</button>
                </>
              );
            })()}
          </>}
          {listeFiltree().map(x => (
          <button key={x.id} onClick={() => ouvrir(x.id)} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, marginBottom: 8, cursor: "pointer" }}>
            <div style={{ fontWeight: 600, fontSize: 13 }}>{x.titre}</div>
            <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 2 }}>{x.numero} · {ENQ_STATUTS[x.statut]}{x.categorie ? " · " + nomType(x.categorie) : ""}{x.niveau_constat && x.niveau_constat !== "a_determiner" ? " · " + (ENQ_NIVEAUX.find(n => n[0] === x.niveau_constat) || [])[1] : ""}</div>
          </button>))}
          {source === "admin" && !deviceId && <div style={{ marginTop: 12 }}>
            <button type="button" onClick={() => { const next = !showCorbeille; setShowCorbeille(next); if (next) chargerCorbeille(); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: 11.5, cursor: "pointer", padding: 0 }}>{showCorbeille ? "Masquer la corbeille" : "Voir la corbeille"}</button>
            {showCorbeille && (
              <div style={{ marginTop: 8 }}>
                {corbeille === null && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Chargement…</div>}
                {corbeille && corbeille.length === 0 && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Corbeille vide.</div>}
                {corbeille && corbeille.map(x => (
                  <div key={x.id} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 10, marginBottom: 6 }}>
                    <div style={{ fontWeight: 600, fontSize: 12.5 }}>{x.titre}</div>
                    <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 2 }}>{x.numero} · supprimé par {x.deleted_by || "?"} le {x.deleted_at ? new Date(x.deleted_at).toLocaleDateString("fr-FR") : "?"}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button type="button" onClick={() => restaurerDossier(x.id)} style={{ ...btn(), padding: "6px 10px", fontSize: 12 }}>Restaurer</button>
                      <button type="button" onClick={() => supprimerDefinitivement(x.id)} style={{ ...btn(), padding: "6px 10px", fontSize: 12, color: "#B5451B", borderColor: "#B5451B" }}>Supprimer définitivement</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>}</div>}
      </div>
    );
  }

  // ---- Formulaire par étapes ----
  const verrou = estVerrouille() && !conflit;
  const grp = ENQ_CATEGORIES.find(([gk]) => (ENQ_CAT_FLAT.find(t => t[0] === f.categorie) || [])[2] === gk);
  return (
    <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", margin: "14px 0" }}>
      <IndicateurConnexionEnquetes email={email} deviceId={deviceId} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>{dossier ? dossier.numero : "Nouveau dossier"} · {sync}</div>
        <button onClick={fermer} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "var(--c-text-muted)" }}>Fermer</button>
      </div>
      {conflit && <div style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12 }}>
        <b>⚠️ Conflit détecté</b> — ce dossier a été modifié ailleurs (par {conflit.enqueteur || conflit.cree_par || "une autre personne"}) le {new Date(conflit.updated_at).toLocaleString("fr-FR")}, après votre dernière synchronisation. Votre modification n'a pas été écrasée : choisissez comment continuer.
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button type="button" onClick={resoudreGarderMaVersion} style={{ ...btn("var(--c-accent-dark)"), padding: "8px 0" }}>Garder ma version</button>
          <button type="button" onClick={resoudreGarderVersionServeur} style={{ ...btn(), padding: "8px 0" }}>Garder celle du serveur</button>
        </div>
      </div>}
      <div style={{ height: 6, background: "var(--c-surface-soft)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ width: `${((etape + 1) / ENQ_ETAPES.length) * 100}%`, height: "100%", background: "var(--c-accent-dark)", transition: "width .2s" }} />
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>Étape {etape + 1}/{ENQ_ETAPES.length} — {ENQ_ETAPES[etape]}</div>
      {dossier && dossier.revision_commentaire && (f.statut === "a_revoir" || f.statut === "rejetee") && (
        <div style={{ background: "var(--c-warning-bg)", border: "1px solid var(--c-warning-border-soft)", borderRadius: 10, padding: 10, marginBottom: 10, fontSize: 12 }}>
          <b>{f.statut === "a_revoir" ? "À revoir" : "Dossier rejeté"}</b> — commentaire du réviseur{dossier.revision_par ? " (" + dossier.revision_par + ")" : ""} : {dossier.revision_commentaire}
        </div>
      )}
      {verrou && <div style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>Dossier {f.statut === "rejetee" ? "rejeté" : f.statut === "verifiee" ? "vérifié" : "terminé"} : lecture seule.</div>}

      <fieldset disabled={verrou} style={{ border: "none", padding: 0, margin: 0 }}>
      {etape === 0 && <div>
        <label style={label}>Titre *</label>
        {deviceId
          ? <div style={{ ...champStyle, background: "var(--c-surface-soft)", color: "var(--c-text-muted)" }}>{f.titre || "—"}</div>
          : <input value={f.titre} onChange={e => setF(x => ({ ...x, titre: e.target.value }))} style={champStyle} />}
        <label style={label}>Type d'enquête *</label>
        {deviceId
          ? <div style={{ ...champStyle, background: "var(--c-surface-soft)", color: "var(--c-text-muted)" }}>{nomTypeEnquete(f.type_enquete)}</div>
          : <select value={f.type_enquete} onChange={e => setF(x => ({ ...x, type_enquete: e.target.value }))} style={champStyle}><option value="">Choisir…</option>{ENQ_TYPE_ENQUETE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>}
        <label style={label}>Grande catégorie du problème *</label>
        {deviceId
          ? <div style={{ ...champStyle, background: "var(--c-surface-soft)", color: "var(--c-text-muted)" }}>{nomGroupe(f.categorie)}</div>
          : <select value={grp ? grp[0] : ""} onChange={e => { const g = ENQ_CATEGORIES.find(([gk]) => gk === e.target.value); setF(x => ({ ...x, categorie: g && g[2].length === 1 ? g[2][0][0] : "" })); }} style={champStyle}>
              <option value="">Choisir…</option>{ENQ_CATEGORIES.map(([gk, gl]) => <option key={gk} value={gk}>{gl}</option>)}
            </select>}
        {!deviceId && grp && grp[2].length > 1 && <>
          <label style={label}>Sous-catégorie *</label>
          <select value={f.categorie} onChange={e => setF(x => ({ ...x, categorie: e.target.value }))} style={champStyle}><option value="">Choisir…</option>{grp[2].map(([sk, sl]) => <option key={sk} value={sk}>{sl}</option>)}</select>
        </>}
        {deviceId && grp && grp[2].length > 1 && <div style={{ ...champStyle, background: "var(--c-surface-soft)", color: "var(--c-text-muted)" }}>{nomType(f.categorie)}</div>}
        {f.categorie === "autre" && champ("type_probleme_precision", "Préciser le problème environnemental *")}
        {deviceId && <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: -6, marginBottom: 10 }}>Titre, type d'enquête et type de problème sont fixés par la personne qui a créé le dossier.</div>}
        {!deviceId && <div style={{ marginBottom: 10 }}>
          <label style={label}>Signalement citoyen à l'origine (facultatif)</label>
          {signalementLie ? (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 10, fontSize: 12.5 }}>
              <div><b>{signalementLie.categorie || "Signalement"}</b> · {new Date(signalementLie.created_at).toLocaleDateString("fr-FR")}</div>
              {signalementLie.description && <div style={{ color: "var(--c-text-muted)", marginTop: 4 }}>{signalementLie.description.slice(0, 140)}</div>}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                {signalementLie.lat != null && <button type="button" onClick={reprendrePositionSignalement} style={{ ...btn(), padding: "6px 10px", fontSize: 12 }}>Reprendre sa position</button>}
                <button type="button" onClick={delierSignalement} style={{ ...btn(), padding: "6px 10px", fontSize: 12, color: "#B5451B" }}>Délier</button>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={rechSignalement} onChange={e => setRechSignalement(e.target.value)} onKeyDown={e => e.key === "Enter" && rechercherSignalements()} placeholder="Référence ou mots-clés du signalement" style={{ ...champStyle, marginBottom: 0 }} />
                <button type="button" onClick={rechercherSignalements} disabled={rechBusy} style={{ ...btn(), flex: "none", padding: "0 14px" }}>{rechBusy ? "…" : "Chercher"}</button>
              </div>
              {resultatsSignalement && resultatsSignalement.length === 0 && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginTop: 6 }}>Aucun signalement trouvé.</div>}
              {resultatsSignalement && resultatsSignalement.map(s => (
                <button key={s.id} type="button" onClick={() => lierSignalement(s)} style={{ display: "block", width: "100%", textAlign: "left", background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: 8, marginTop: 6, fontSize: 12, cursor: "pointer" }}>
                  <b>{s.categorie || "Signalement"}</b> · {new Date(s.created_at).toLocaleDateString("fr-FR")}{s.description ? " — " + s.description.slice(0, 80) : ""}
                </button>
              ))}
              <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 4 }}>L'enquête reste utilisable sans signalement lié, et un signalement reste consultable sans enquête.</div>
            </div>
          )}
        </div>}
        <label style={label}>Date et heure</label>
        <input type="datetime-local" value={d.date_heure || ""} onChange={e => setSimple("date_heure", e.target.value)} style={champStyle} />
        {!deviceId && <>
          <label style={label}>Profil de l'enquêteur</label>
          <select value={f.profil_enqueteur} onChange={e => setF(x => ({ ...x, profil_enqueteur: e.target.value }))} style={champStyle}><option value="">Choisir…</option>{[["benevole","Bénévole"],["ong","ONG"],["agent_public","Agent public"],["autre","Autre"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        </>}
        <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Enquêteur : {deviceId ? "vous" : email}{organisationId ? " · rattaché à votre organisation" : ""}</div>
      </div>}

      {etape === 1 && <div>
        {champ("localite", "Localité / zone *")}
        {champ("region", "Région")}{champ("prefecture", "Préfecture")}{champ("sous_prefecture", "Sous-préfecture / Commune")}{champ("commune", "Commune")}{champ("quartier", "Quartier / village / secteur")}{champ("lieu_dit", "Lieu-dit")}
        <button type="button" onClick={localiser} style={{ ...btn("var(--c-accent-dark)"), width: "100%", flex: "none", marginBottom: 6 }}>Utiliser ma position (GPS)</button>
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 8 }}>Votre appareil vous demandera votre accord avant de partager la position. Vous pouvez aussi corriger les coordonnées à la main.</div>
        <div style={{ display: "flex", gap: 8 }}>
          <input placeholder="Latitude" value={f.lat} onChange={e => setF(x => ({ ...x, lat: e.target.value }))} style={champStyle} inputMode="decimal" />
          <input placeholder="Longitude" value={f.lng} onChange={e => setF(x => ({ ...x, lng: e.target.value }))} style={champStyle} inputMode="decimal" />
        </div>
        {f.precision_gps_m !== "" && <div style={{ fontSize: 12, marginBottom: 8 }}>Précision GPS : ± {f.precision_gps_m} m</div>}
        <PositionPicker lat={f.lat} lng={f.lng} onPick={(la, ln) => setF(x => ({ ...x, lat: la, lng: ln, precision_gps_m: "" }))} />
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10 }}>Touchez la carte pour placer ou corriger la position (la précision GPS est alors effacée).</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 6 }}>
          <input type="checkbox" checked={!!d.gps_indisponible} onChange={e => setSimple("gps_indisponible", e.target.checked)} />
          Position GPS indisponible sur le terrain — l'enquête peut continuer sans bloquer
        </label>
        {d.gps_indisponible && champ("gps_indisponible_motif", "Motif de l'indisponibilité du GPS *", 2)}
      </div>}

      {etape === 2 && <div>
        {champ("faits_observes", "Faits observés — ce que vous avez directement constaté *", 4)}
        {champ("periode", "Date ou période présumée du début")}{champ("etendue", "Étendue estimée")}{champ("frequence", "Fréquence")}
        {champ("causes_observables", "Causes observables", 3, true)}{champ("evolution", "Évolution observée (complément)", 2, true)}
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 12 }}>Ces éléments sont ce que vous avez vous-même constaté sur place.</div>
        {champ("informations_recueillies", "Informations recueillies auprès de témoins ou personnes rencontrées", 4)}
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 12 }}>Enregistrées comme « déclaré par un tiers », non vérifiées directement par vous.</div>
        {champ("analyse_recommandations", "Analyse et recommandations — votre appréciation et mesures proposées", 4)}
      </div>}

      {etape === 3 && <div>
        <label style={label}>Impacts — au moins une évaluation requise</label>
        {ENQ_IMPACT_DOMAINES.map(dom => {
          const v = (d.impacts_eval || {})[dom] || {};
          const justifReq = ENQ_IMPACT_JUSTIF_REQUISE.includes(v.niveau);
          return (
            <div key={dom} style={{ marginBottom: 10, paddingBottom: 8, borderBottom: "1px solid var(--c-border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{dom}</span>
                <select value={v.niveau || ""} onChange={e => setImpact(dom, { niveau: e.target.value })} style={{ ...champStyle, marginBottom: 0, width: "auto", padding: "8px 10px" }}>
                  <option value="">—</option>{ENQ_IMPACT_NIVEAUX.map(([nv, nl]) => <option key={nv} value={nv}>{nl}</option>)}
                </select>
              </div>
              {justifReq && <textarea value={v.justification || ""} onChange={e => setImpact(dom, { justification: e.target.value })} rows={2} placeholder="Justification obligatoire pour un impact Élevé ou Critique" style={{ ...champStyle, resize: "vertical", marginTop: 6, marginBottom: 0, borderColor: (v.justification || "").trim() ? "var(--c-border)" : "#B5451B" }} />}
            </div>
          );
        })}
        {champ("acteurs", "Personnes ou structures concernées", 3, true)}
        <div style={{ fontSize: 11, color: "var(--c-text-muted)" }}>Leur mention n'établit aucune responsabilité.</div>
      </div>}

      {etape === 4 && <div>
        {ENQ_GRAVITE_PREUVE_OBLIGATOIRE.includes(f.niveau_constat) && <div style={{ fontSize: 12, color: "#B5451B", marginBottom: 8 }}>Niveau {(ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [])[1]} : au moins une preuve est requise, sauf motif d'absence ci-dessous.</div>}
        {preuves.map(p => <div key={p.id} style={{ fontSize: 12, padding: "6px 0", borderTop: "1px solid var(--c-border)" }}>
          {p.type === "photo" && p.url && <img src={p.url} alt="" style={{ maxWidth: 120, borderRadius: 8, display: "block", marginBottom: 4 }} />}
          <b>{(ENQ_PREUVES.find(t => t[0] === p.type) || [])[1]}</b> — {p.description} <em style={{ color: "var(--c-text-muted)" }}>({nomNature(p.nature)} · {new Date(p.capture_at || p.created_at).toLocaleString("fr-FR")})</em>
          {p.type === "audio" && p.url && <TranscriptionAudio preuve={p} transcription={transcriptions[p.id]} brouillonLocal={transcriptionsLocales[p.id]} estAdmin={estAdmin}
            onCommencer={() => creerTranscription(p.id)} onSauver={texte => sauverTranscriptionLocal(p.id, texte)} onSoumettre={texte => soumettreTranscription(p.id, texte)}
            onExaminer={statut => examinerTranscription(p.id, statut)} onRouvrir={() => rouvrirTranscription(p.id)} />}
        </div>)}
        {preuvesLocales.map(p => <div key={p.id} style={{ fontSize: 12, padding: "6px 0", borderTop: "1px solid var(--c-border)" }}>
          {p.type === "photo" && p.dataUrl && <img src={p.dataUrl} alt="" style={{ maxWidth: 120, borderRadius: 8, display: "block", marginBottom: 4 }} />}
          {p.type === "audio" && p.dataUrl && <audio src={p.dataUrl} controls style={{ width: "100%", marginBottom: 4 }} />}
          <b>{(ENQ_PREUVES.find(t => t[0] === p.type) || [])[1]}</b> — {p.description} <em style={{ color: "var(--c-danger, #B5451B)" }}>🔵 en attente de synchronisation</em>
          {p.type === "audio" && <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 2 }}>La transcription sera possible une fois cet enregistrement synchronisé.</div>}
        </div>)}
        <select value={np.type} onChange={e => setNp(x => ({ ...x, type: e.target.value }))} style={champStyle}>{ENQ_PREUVES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <textarea value={np.description} onChange={e => setNp(x => ({ ...x, description: e.target.value }))} rows={2} placeholder="Description, mesure, propos recueillis…" style={{ ...champStyle, resize: "vertical" }} />
        {np.type === "photo" && <input type="file" accept="image/*" capture="environment" onChange={e => setNp(x => ({ ...x, fichier: e.target.files[0] || null }))} style={{ marginBottom: 10, fontSize: 12 }} />}
        {np.type === "audio" && <div style={{ marginBottom: 10 }}>
          <AudioRecorder onCapture={fichier => setNp(x => ({ ...x, fichier }))} />
          <label style={{ fontSize: 11.5, color: "var(--c-text-muted)", display: "block", marginTop: 4 }}>Ou choisir un enregistrement déjà existant :
            <input type="file" accept="audio/*" onChange={e => setNp(x => ({ ...x, fichier: e.target.files[0] || null }))} style={{ display: "block", marginTop: 4, fontSize: 12 }} />
          </label>
        </div>}
        <select value={np.nature} onChange={e => setNp(x => ({ ...x, nature: e.target.value }))} style={champStyle}>{ENQ_NATURES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <button type="button" onClick={ajouterPreuve} disabled={busy} style={{ ...btn(), width: "100%", flex: "none" }}>{busy ? "…" : "+ Ajouter cet élément de preuve"}</button>
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginTop: 6, marginBottom: 10 }}>Date, heure et position du dossier sont associées à chaque élément. Fonctionne aussi hors connexion : la preuve est envoyée dès que possible.</div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, marginBottom: 6 }}>
          <input type="checkbox" checked={!!d.preuve_absente} onChange={e => setSimple("preuve_absente", e.target.checked)} />
          Aucune preuve disponible pour cette enquête
        </label>
        {d.preuve_absente && champ("preuve_absente_motif", "Motif de l'absence de preuve *", 2)}
      </div>}

      {etape === 5 && <div>
        <label style={label}>Niveau de gravité (appréciation environnementale, pas une qualification juridique)</label>
        <select value={f.niveau_constat} onChange={e => setF(x => ({ ...x, niveau_constat: e.target.value }))} style={champStyle}>{ENQ_NIVEAUX.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        {(ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [])[2] && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginTop: -6, marginBottom: 10 }}>{(ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [])[2]}</div>}
        <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10 }}>La gravité tient compte de l'étendue, l'intensité, la durée, le nombre de personnes affectées, l'impact sur les ressources naturelles et les écosystèmes, le risque pour la population, et le caractère immédiat ou potentiel du danger — jamais déduite automatiquement du seul type de problème.</div>
        <label style={label}>Actions réalisées</label>{multi("actions", ENQ_ACTIONS)}
        {champ("mesures", "Mesures proposées", 3)}{champ("priorites", "Actions prioritaires", 2)}{champ("autorite", "Autorité ou organisme à saisir")}{champ("suivi", "Besoin de suivi")}{champ("observations", "Observations complémentaires", 2)}
      </div>}

      {etape === 6 && <div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{f.titre || "Sans titre"}</div>
        {ligne("Type d'enquête", nomTypeEnquete(f.type_enquete))}{ligne("Type de problème", f.categorie ? nomGroupe(f.categorie) + " > " + nomType(f.categorie) : "")}
        {signalementLie && ligne("Signalement lié", (signalementLie.categorie || "Signalement") + " du " + new Date(signalementLie.created_at).toLocaleDateString("fr-FR"))}
        {f.categorie === "autre" && ligne("Précision", val("type_probleme_precision"))}
        {ligne("Date", d.date_heure ? new Date(d.date_heure).toLocaleString("fr-FR") : "")}
        {ligne("Lieu", [val("localite"), val("quartier"), val("commune"), val("sous_prefecture"), val("prefecture"), val("region")].filter(Boolean).join(", "))}
        {carte ? ligne("GPS", `${f.lat}, ${f.lng}${f.precision_gps_m !== "" ? " (± " + f.precision_gps_m + " m)" : ""}`) : (d.gps_indisponible && ligne("GPS", "Indisponible — " + val("gps_indisponible_motif")))}
        {ligne("Faits observés", val("faits_observes"), "observe")}{ligne("Causes observables", val("causes_observables"), d.causes_observables && d.causes_observables.nature)}
        {ligne("Informations recueillies", val("informations_recueillies"), "declare")}{ligne("Analyse et recommandations", val("analyse_recommandations"))}
        {impactsRenseignes().length > 0 && ligne("Impacts évalués", Object.entries(d.impacts_eval || {}).filter(([, v]) => v && v.niveau).map(([k, v]) => `${k} : ${(ENQ_IMPACT_NIVEAUX.find(n => n[0] === v.niveau) || [])[1]}`).join(" ; "))}
        {ligne("Acteurs concernés", val("acteurs"), d.acteurs && d.acteurs.nature)}
        {ligne("Niveau de gravité", (ENQ_NIVEAUX.find(n => n[0] === f.niveau_constat) || [])[1])}{ligne("Actions réalisées", (d.actions || []).join(", "))}
        {ligne("Recommandations", val("mesures"))}{ligne("Preuves", preuves.length ? preuves.length + " élément(s)" : (d.preuve_absente ? "Aucune — " + val("preuve_absente_motif") : ""))}
        {!deviceId && dossier && <div style={{ marginTop: 10 }}>
          <label style={label}>Bénévoles assignés (accès à ce dossier uniquement)</label>
          {assignes.map(a => { const b = bens.find(x => x.id === a.benevole_id); return <div key={a.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "4px 0" }}><span>{b ? b.nom : "Bénévole"}{b && b.ville ? " · " + b.ville : ""}</span><button type="button" onClick={() => retirer(a.id)} style={{ background: "none", border: "none", color: "#B5451B", cursor: "pointer", fontSize: 12 }}>Retirer</button></div>; })}
          <div style={{ display: "flex", gap: 8 }}><select value={choix} onChange={e => setChoix(e.target.value)} style={{ ...champStyle, marginBottom: 0 }}><option value="">Choisir un bénévole…</option>{bens.filter(b => !assignes.some(a => a.benevole_id === b.id)).map(b => <option key={b.id} value={b.id}>{b.nom}{b.ville ? " · " + b.ville : ""}</option>)}</select>
          <button type="button" onClick={assigner} style={{ ...btn("var(--c-accent-dark)"), flex: "none", padding: "0 14px" }}>Assigner</button></div>
        </div>}
        {!deviceId && hist.length > 0 && <div style={{ marginTop: 10 }}><label style={label}>Historique des modifications</label>
          {hist.map(h => <div key={h.id} style={{ fontSize: 11.5, padding: "4px 0", borderTop: "1px solid var(--c-border)" }}>{new Date(h.created_at).toLocaleString("fr-FR")} · {h.action === "creation" ? "Création" : h.action === "changement_statut" ? `Statut : ${ENQ_STATUTS[h.ancien_statut]} → ${ENQ_STATUTS[h.nouveau_statut]}` : "Modification" + (h.champs_modifies ? " (" + h.champs_modifies.filter(c => c !== "donnees" || true).join(", ") + ")" : "")}{h.auteur ? " · " + h.auteur : ""}</div>)}</div>}
        {source === "admin" && !deviceId && dossier && dossier.id && ["terminee", "verifiee", "a_revoir", "rejetee"].includes(f.statut) && (
          <div style={{ marginTop: 12, padding: 10, borderRadius: 10, border: "1px solid var(--c-border)" }}>
            <label style={label}>Examen du dossier (équipe EcoVigil)</label>
            <textarea value={commentaireRevision} onChange={e => setCommentaireRevision(e.target.value)} rows={2} placeholder="Commentaire pour l'enquêteur (obligatoire pour « À revoir » et « Rejeter »)" style={{ ...champStyle, resize: "vertical" }} />
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" onClick={() => examiner("verifiee")} style={{ ...btn("var(--c-accent-dark)"), padding: "9px 0", fontSize: 12.5 }}>Valider</button>
              <button type="button" onClick={() => examiner("a_revoir")} style={{ ...btn(), padding: "9px 0", fontSize: 12.5 }}>À revoir</button>
              <button type="button" onClick={() => examiner("rejetee")} style={{ ...btn(), padding: "9px 0", fontSize: 12.5, color: "#B5451B", borderColor: "#B5451B" }}>Rejeter</button>
            </div>
          </div>
        )}
        <label style={{ ...label, marginTop: 10 }}>Statut</label>
        <select value={f.statut} onChange={e => setF(x => ({ ...x, statut: e.target.value }))} style={champStyle}>{Object.entries(ENQ_STATUTS).filter(([k]) => ["brouillon", "en_cours", "terminee"].includes(k) || k === f.statut).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        {dossier && dossier.verificateur && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Vérifié par {dossier.verificateur} le {new Date(dossier.verifie_at).toLocaleDateString("fr-FR")}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
          <button type="button" onClick={() => valider(["terminee", "verifiee", "a_revoir", "rejetee"].includes(f.statut) ? f.statut : "brouillon")} style={btn()}>{f.statut === "a_revoir" ? "Enregistrer mes corrections" : "Enregistrer comme brouillon"}</button>
          <button type="button" onClick={() => valider("terminee")} style={btn("var(--c-accent-dark)")}>Valider (terminée)</button>
        </div>
        {dossier && dossier.id && (f.statut === "terminee" || f.statut === "verifiee") && <button type="button" onClick={rapport} style={{ ...btn("#1F5C38"), width: "100%", flex: "none", marginTop: 8 }}>Générer le rapport</button>}
        {!deviceId && dossier && dossier.id && <button type="button" onClick={supprimerDossier} style={{ ...btn(), width: "100%", flex: "none", marginTop: 8, color: "#B5451B", borderColor: "#B5451B" }}>Supprimer ce dossier</button>}
      </div>}
      </fieldset>

      {erreur && <div role="alert" style={{ fontSize: 12, color: "#B5451B", marginTop: 8 }}>{erreur}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button type="button" disabled={etape === 0} onClick={() => { setErreur(""); setEtape(etape - 1); }} style={{ ...btn(), opacity: etape === 0 ? 0.4 : 1 }}>Précédent</button>
        {etape < ENQ_ETAPES.length - 1 && <button type="button" onClick={() => { setErreur(""); setEtape(etape + 1); }} style={btn("var(--c-accent-dark)")}>Suivant</button>}
      </div>
    </div>
  );
}

// Bibliothèque de questions réutilisables du constructeur libre (inspirée de KoboToolbox) :
// on y garde une question du brouillon pour la réutiliser dans d'autres enquêtes, en un clic.
// Les questions du Centre d'EcoVigil (organisation_id nul) sont visibles de toutes les organisations
// mais seul le Centre peut les modifier ; chaque organisation gère les siennes.
export function BibliothequeQuestions({ organisationId, email, isAdmin, draftQuestions, onAjouter }) {
  const [ouvert, setOuvert] = useState(false);
  const [items, setItems] = useState(null);
  const [aGarder, setAGarder] = useState("");
  const [msg, setMsg] = useState("");
  async function charger() {
    const { data } = await supabase.from("enquete_bibliotheque").select("*").order("created_at", { ascending: false }).limit(200);
    setItems((data || []).filter(r => isAdmin ? r.organisation_id == null : (r.organisation_id == null || r.organisation_id === organisationId)));
  }
  useEffect(() => { if (ouvert) charger(); }, [ouvert]);
  async function garder() {
    if (aGarder === "") return;
    const q = draftQuestions[Number(aGarder)]; if (!q) return;
    const { error } = await supabase.from("enquete_bibliotheque").insert({
      organisation_id: isAdmin ? null : organisationId, cree_par: email, texte: q.texte, type_reponse: q.type_reponse, options: q.options || null, validation: q.validation || null,
    });
    setMsg(error ? "Impossible d'enregistrer : " + error.message : "Question ajoutée à la bibliothèque ✓");
    setAGarder(""); if (!error && ouvert) charger();
  }
  async function supprimer(id) {
    if (!window.confirm("Retirer cette question de la bibliothèque ?")) return;
    await supabase.from("enquete_bibliotheque").delete().eq("id", id); charger();
  }
  const petit = { padding: "5px 9px", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", fontSize: 11.5, cursor: "pointer" };
  return (
    <div style={{ marginBottom: 8, padding: 8, borderRadius: 10, background: "var(--c-surface-soft)" }}>
      <button type="button" onClick={() => setOuvert(o => !o)} style={{ ...petit, border: "none", padding: 0, fontWeight: 600 }}>{ouvert ? "▾" : "▸"} Bibliothèque de questions</button>
      {ouvert && (
        <div style={{ marginTop: 8 }}>
          {items === null && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Chargement…</div>}
          {items && items.length === 0 && <div style={{ fontSize: 11.5, color: "var(--c-text-muted)" }}>Aucune question enregistrée pour l'instant.</div>}
          {items && items.map(r => (
            <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6, fontSize: 11.5, padding: "4px 0" }}>
              <span>{r.texte} <em style={{ color: "var(--c-text-muted)" }}>({r.type_reponse}{r.organisation_id == null && !isAdmin ? " · EcoVigil" : ""})</em></span>
              <span style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button type="button" onClick={() => onAjouter({ texte: r.texte, type_reponse: r.type_reponse, options: r.options || null, validation: r.validation || null, conditionIndex: null, conditionValeur: null, groupe: null })} style={petit}>Ajouter</button>
                {(isAdmin || r.organisation_id != null) && <button type="button" onClick={() => supprimer(r.id)} style={{ ...petit, color: "#B5451B" }}>×</button>}
              </span>
            </div>
          ))}
          {draftQuestions.length > 0 && (
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              <select value={aGarder} onChange={e => { setAGarder(e.target.value); setMsg(""); }} style={{ flex: 1, padding: 6, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: 11.5, background: "var(--c-surface)" }}>
                <option value="">Garder une question du brouillon…</option>
                {draftQuestions.map((q, i) => <option key={i} value={i}>{q.texte}</option>)}
              </select>
              <button type="button" onClick={garder} disabled={aGarder === ""} style={petit}>Garder</button>
            </div>
          )}
          {msg && <div style={{ fontSize: 11, marginTop: 6, color: "var(--c-text-muted)" }}>{msg}</div>}
        </div>
      )}
    </div>
  );
}
