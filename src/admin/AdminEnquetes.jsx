import { useEffect, useRef, useState } from "react";
import { IconCamera, IconPlus, IconX } from "../components/icons.jsx";
import { compressImage, uploadPhotoGeneric } from "../components/media.jsx";
import { SectionTitle } from "../components/ui.jsx";
import { BibliothequeQuestions, EnquetesStandard } from "../enquetes/EnquetesTerrain.jsx";
import { supabase } from "../lib/supabase.js";
import { T } from "../lib/typo.jsx";

export function AdminEnquetes({ session }) {
  const email = session && session.user ? session.user.email : "";
  const [liste, setListe] = useState(null);
  const [selection, setSelection] = useState(null);
  const [detail, setDetail] = useState(null);

  const [showCreer, setShowCreer] = useState(false);
  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("questionnaire");
  const [categorie, setCategorie] = useState("");
  const [draftQuestions, setDraftQuestions] = useState([]);
  const [qTexte, setQTexte] = useState("");
  const [qType, setQType] = useState("texte");
  const [qOptions, setQOptions] = useState("");
  const [qConditionIndex, setQConditionIndex] = useState("");
  const [qConditionValeur, setQConditionValeur] = useState("");
  const [qGroupe, setQGroupe] = useState("");
  const [qFormat, setQFormat] = useState("texte");   // pour les questions "texte" : "texte" ou "nombre"
  const [qMin, setQMin] = useState("");
  const [qMax, setQMax] = useState("");
  const [busy, setBusy] = useState(false);
  const [erreur, setErreur] = useState("");

  const [noteEntree, setNoteEntree] = useState("");
  const [photoEntree, setPhotoEntree] = useState(null);
  const [busyEntree, setBusyEntree] = useState(false);
  const [resultatPublic, setResultatPublic] = useState("");
  const fileRefEntree = useRef(null);

  async function charger() {
    const { data } = await supabase.from("enquetes").select("*").order("created_at", { ascending: false }).limit(100);
    setListe(data || []);
  }
  useEffect(() => { charger(); }, []);

  const optionsQuestion = (q) => q.type_reponse === "oui_non" ? ["Oui", "Non"] : q.type_reponse === "echelle" ? [1, 2, 3, 4, 5] : (q.options || []);

  function ajouterQuestionDraft() {
    if (!qTexte.trim()) return;
    const validation = qType === "texte" && qFormat === "nombre" ? { kind: "nombre", min: qMin !== "" ? Number(qMin) : null, max: qMax !== "" ? Number(qMax) : null }
      : qType === "texte" && (qMin !== "" || qMax !== "") ? { kind: "texte", min_len: qMin !== "" ? Number(qMin) : null, max_len: qMax !== "" ? Number(qMax) : null }
      : null;
    setDraftQuestions(prev => [...prev, {
      texte: qTexte.trim(), type_reponse: qType,
      options: (qType === "choix_unique" || qType === "choix_multiple") ? qOptions.split(",").map(o => o.trim()).filter(Boolean) : null,
      conditionIndex: qConditionIndex === "" ? null : Number(qConditionIndex), conditionValeur: qConditionIndex === "" ? null : qConditionValeur,
      groupe: qGroupe.trim() || null, validation,
    }]);
    setQTexte(""); setQOptions(""); setQConditionIndex(""); setQConditionValeur(""); setQGroupe(qGroupe); setQFormat("texte"); setQMin(""); setQMax("");
  }
  function retirerQuestionDraft(i) {
    setDraftQuestions(prev => prev.filter((_, idx) => idx !== i)
      .map(q => q.conditionIndex == null ? q : { ...q, conditionIndex: q.conditionIndex === i ? null : (q.conditionIndex > i ? q.conditionIndex - 1 : q.conditionIndex) }));
  }

  async function creerEnquete() {
    setErreur("");
    if (!titre.trim()) { setErreur("Le titre est requis."); return; }
    if (type !== "investigation" && draftQuestions.length === 0) { setErreur("Ajoute au moins une question pour un questionnaire."); return; }
    setBusy(true);
    const { data: enq, error } = await supabase.from("enquetes").insert({
      titre: titre.trim(), description: description.trim() || null, type, categorie: categorie.trim() || null, cree_par: email,
    }).select().single();
    if (error || !enq) { setBusy(false); setErreur("Échec de la création : " + (error ? error.message : "erreur inconnue")); return; }
    if (draftQuestions.length) {
      const { data: inserees } = await supabase.from("enquete_questions").insert(draftQuestions.map((q, i) => ({ enquete_id: enq.id, ordre: i, texte: q.texte, type_reponse: q.type_reponse, options: q.options, groupe_repetable: q.groupe, validation: q.validation }))).select();
      const idParOrdre = {}; (inserees || []).forEach(r => { idParOrdre[r.ordre] = r.id; });
      const maj = draftQuestions.map((q, i) => q.conditionIndex != null && idParOrdre[i] != null && idParOrdre[q.conditionIndex] != null
        ? supabase.from("enquete_questions").update({ condition_question_id: idParOrdre[q.conditionIndex], condition_valeur: String(q.conditionValeur) }).eq("id", idParOrdre[i]) : null).filter(Boolean);
      if (maj.length) await Promise.all(maj);
    }
    setBusy(false);
    setShowCreer(false);
    setTitre(""); setDescription(""); setCategorie(""); setType("questionnaire"); setDraftQuestions([]);
    charger();
  }

  async function ouvrirGestion(enq) {
    setSelection(enq);
    setDetail(null);
    setResultatPublic(enq.resultat_public || "");
    const [{ data: questions }, { data: participations }, { data: entrees }] = await Promise.all([
      supabase.from("enquete_questions").select("*").eq("enquete_id", enq.id).order("ordre", { ascending: true }),
      supabase.from("enquete_participations").select("id, enquete_reponses(question_id, valeur)").eq("enquete_id", enq.id),
      supabase.from("enquete_entrees").select("*").eq("enquete_id", enq.id).order("created_at", { ascending: false }),
    ]);
    setDetail({ questions: questions || [], participations: participations || [], entrees: entrees || [] });
  }

  function statsQuestion(q) {
    const valeurs = [];
    (detail.participations || []).forEach(p => {
      // Un groupe répétable peut produire plusieurs réponses à la même question pour une
      // participation (une par occurrence ajoutée) : on les compte toutes, chacune comme une
      // observation distincte.
      (p.enquete_reponses || []).filter(x => x.question_id === q.id).forEach(r => { if (r.valeur) valeurs.push(r.valeur); });
    });
    if (q.type_reponse === "texte") return { texte: valeurs };
    const comptage = {};
    valeurs.forEach(v => { v.split(", ").forEach(part => { comptage[part] = (comptage[part] || 0) + 1; }); });
    return { comptage, total: valeurs.length };
  }

  async function choisirPhotoEntree(e) {
    const f = e.target.files && e.target.files[0];
    e.target.value = "";
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => setPhotoEntree(await compressImage(reader.result, 900, 0.7));
    reader.readAsDataURL(f);
  }

  async function ajouterEntree() {
    if (!noteEntree.trim() || !selection) return;
    setBusyEntree(true);
    const photoUrl = photoEntree ? await uploadPhotoGeneric(photoEntree, "enquetes") : null;
    await supabase.from("enquete_entrees").insert({ enquete_id: selection.id, auteur: email, contenu: noteEntree.trim(), photo_url: photoUrl });
    setNoteEntree(""); setPhotoEntree(null);
    setBusyEntree(false);
    ouvrirGestion(selection);
  }

  async function enregistrerResultat() {
    if (!selection) return;
    await supabase.from("enquetes").update({ resultat_public: resultatPublic.trim() || null }).eq("id", selection.id);
  }

  async function cloturer() {
    if (!selection) return;
    if (!confirm("Clôturer cette enquête ? Le résultat public (si renseigné) devient visible par tous, et plus personne ne pourra y répondre.")) return;
    await supabase.from("enquetes").update({ statut: "fermee", resultat_public: resultatPublic.trim() || null, cloturee_at: new Date().toISOString() }).eq("id", selection.id);
    charger();
    setSelection(null); setDetail(null);
  }
  async function reouvrir() {
    if (!selection) return;
    await supabase.from("enquetes").update({ statut: "ouverte", cloturee_at: null }).eq("id", selection.id);
    charger();
    ouvrirGestion({ ...selection, statut: "ouverte" });
  }
  // Suppression définitive (tout type, tout statut) — réservée au Super administrateur ici
  // (voir la policy RLS "suppression enquetes") ; efface aussi questions, participations et
  // réponses (cascade en base), et détache un dossier d'enquête éventuellement lié sans le supprimer.
  async function supprimerEnquete() {
    if (!selection) return;
    if (!confirm(`Supprimer définitivement l'enquête « ${selection.titre} » ? Cette action est irréversible : ses questions, participations et réponses seront aussi effacées.`)) return;
    setErreur("");
    const { error } = await supabase.from("enquetes").delete().eq("id", selection.id);
    if (error) { setErreur("Suppression impossible : " + error.message); return; }
    charger();
    setSelection(null); setDetail(null);
  }

  const champ = { width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" };
  const typeLabel = { questionnaire: "Questionnaire", investigation: "Investigation", mixte: "Questionnaire + investigation" };

  // --- Vue gestion d'une enquête ---
  if (selection && detail) {
    return (
      <div>
        <button onClick={() => { setSelection(null); setDetail(null); }} style={{ background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.body, cursor: "pointer", marginBottom: 10, padding: 0 }}>← Enquêtes</button>
        <SectionTitle sub={typeLabel[selection.type]}>{selection.titre}</SectionTitle>
        <div style={{ fontSize: T.small, color: selection.statut === "ouverte" ? "var(--c-accent-dark)" : "var(--c-text-muted)", marginBottom: 14 }}>
          {selection.statut === "ouverte" ? "● En cours" : "● Clôturée"}
        </div>

        {selection.type !== "questionnaire" && (
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12, marginBottom: 16 }}>
            <div style={{ fontSize: T.body, fontWeight: 600, marginBottom: 8 }}>Journal d'investigation ({detail.entrees.length})</div>
            <input ref={fileRefEntree} type="file" accept="image/*" onChange={choisirPhotoEntree} style={{ display: "none" }} />
            <textarea value={noteEntree} onChange={e => setNoteEntree(e.target.value)} rows={2} placeholder="Ajouter une note, une preuve, une avancée…" style={{ ...champ, resize: "none" }} />
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button type="button" onClick={() => fileRefEntree.current && fileRefEntree.current.click()} style={{ padding: "7px 10px", borderRadius: 8, border: "1px solid var(--c-border)", background: photoEntree ? "var(--c-surface-soft)" : "none", fontSize: T.small, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                <IconCamera size={13} /> {photoEntree ? "Photo jointe" : "Ajouter une photo"}
              </button>
              <button onClick={ajouterEntree} disabled={busyEntree || !noteEntree.trim()} style={{ flex: 1, padding: "7px 10px", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer", opacity: busyEntree ? 0.7 : 1 }}>
                {busyEntree ? "…" : "Ajouter au journal"}
              </button>
            </div>
            {detail.entrees.map(en => (
              <div key={en.id} style={{ borderTop: "1px solid var(--c-border)", padding: "8px 0", fontSize: T.small }}>
                <div style={{ color: "var(--c-text-secondary)" }}>{en.contenu}</div>
                {en.photo_url && <img src={en.photo_url} alt="" style={{ maxWidth: "100%", borderRadius: 8, marginTop: 6 }} />}
                <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 3 }}>{en.auteur} · {new Date(en.created_at).toLocaleString("fr-FR")}</div>
              </div>
            ))}

            <div style={{ marginTop: 14 }}>
              {erreur && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
              <div style={{ fontSize: T.small, fontWeight: 600, marginBottom: 6 }}>Résultat public (visible à la clôture)</div>
              <textarea value={resultatPublic} onChange={e => setResultatPublic(e.target.value)} rows={2} placeholder="Conclusion communicable à tous…" style={{ ...champ, resize: "none" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={enregistrerResultat} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "none", fontSize: T.small, cursor: "pointer" }}>Enregistrer le brouillon</button>
                {selection.statut === "ouverte"
                  ? <button onClick={cloturer} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "#B5451B", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>Clôturer</button>
                  : <button onClick={reouvrir} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>Rouvrir</button>}
              </div>
              <button onClick={supprimerEnquete} style={{ width: "100%", marginTop: 8, padding: "8px 0", borderRadius: 8, border: "1px solid #B5451B", background: "none", color: "#B5451B", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>Supprimer définitivement cette enquête</button>
            </div>
          </div>
        )}

        {selection.type !== "investigation" && (
          <div style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 12, padding: 12 }}>
            <div style={{ fontSize: T.body, fontWeight: 600, marginBottom: 10 }}>Réponses ({detail.participations.length} participation{detail.participations.length > 1 ? "s" : ""})</div>
            {detail.questions.map(q => {
              const s = statsQuestion(q);
              return (
                <div key={q.id} style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: T.body, fontWeight: 600, marginBottom: 6 }}>{q.texte}</div>
                  {q.type_reponse === "texte" ? (
                    s.texte.length === 0 ? <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Aucune réponse.</div> :
                    s.texte.slice(0, 20).map((t, i) => <div key={i} style={{ fontSize: T.small, color: "var(--c-text-secondary)", padding: "3px 0", borderTop: i > 0 ? "1px solid var(--c-border)" : "none" }}>« {t} »</div>)
                  ) : Object.keys(s.comptage).length === 0 ? <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Aucune réponse.</div> : (
                    Object.entries(s.comptage).map(([opt, n]) => (
                      <div key={opt} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ fontSize: T.meta, width: 90, flexShrink: 0, color: "var(--c-text-secondary)" }}>{opt}</div>
                        <div style={{ flex: 1, height: 8, background: "var(--c-surface-soft)", borderRadius: 4, overflow: "hidden" }}>
                          <div style={{ width: `${(n / s.total) * 100}%`, height: "100%", background: "var(--c-accent-dark)" }} />
                        </div>
                        <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", width: 20 }}>{n}</div>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // --- Vue liste ---
  return (
    <div>
      <SectionTitle sub="Questionnaires citoyens et dossiers d'investigation, créés et suivis par l'équipe.">Enquêtes</SectionTitle>

      <EnquetesStandard email={email} organisationId={null} source="admin" />
      {!showCreer ? (
        <button onClick={() => setShowCreer(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px dashed var(--c-border)", background: "none", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: T.body, cursor: "pointer", margin: "14px 0" }}>
          <IconPlus size={16} /> Créer une enquête
        </button>
      ) : (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", margin: "14px 0" }}>
          <input value={titre} onChange={e => setTitre(e.target.value)} placeholder="Titre de l'enquête" style={champ} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Description (optionnel)" style={{ ...champ, resize: "none" }} />
          <input value={categorie} onChange={e => setCategorie(e.target.value)} placeholder="Catégorie liée (optionnel, ex : pollution_eau)" style={champ} />
          <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
            {[["questionnaire", "Questionnaire"], ["investigation", "Investigation"], ["mixte", "Les deux"]].map(([v, l]) => (
              <button key={v} type="button" onClick={() => setType(v)} style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: `1px solid ${type === v ? "var(--c-accent-dark)" : "var(--c-border)"}`, background: type === v ? "var(--c-accent-dark)" : "none", color: type === v ? "#fff" : "var(--c-text)", fontSize: T.meta, cursor: "pointer" }}>{l}</button>
            ))}
          </div>

          {type !== "investigation" && (
            <div style={{ background: "var(--c-surface-soft)", borderRadius: 10, padding: 10, marginBottom: 10 }}>
              <div style={{ fontSize: T.small, fontWeight: 600, marginBottom: 6 }}>Questions ({draftQuestions.length})</div>
              {draftQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: T.small, padding: "4px 0" }}>
                  <span>{q.texte} <em style={{ color: "var(--c-text-muted)" }}>({q.type_reponse}{q.conditionIndex != null && draftQuestions[q.conditionIndex] ? ` · si « ${draftQuestions[q.conditionIndex].texte} » = ${q.conditionValeur}` : ""}{q.groupe ? ` · groupe « ${q.groupe} »` : ""}{q.validation ? (q.validation.kind === "nombre" ? ` · nombre ${q.validation.min ?? "…"}–${q.validation.max ?? "…"}` : ` · ${q.validation.min_len ?? 0}–${q.validation.max_len ?? "…"} car.`) : ""})</em></span>
                  <button type="button" onClick={() => retirerQuestionDraft(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-muted)" }}><IconX size={13} /></button>
                </div>
              ))}
              <BibliothequeQuestions organisationId={null} email={email} isAdmin={true} draftQuestions={draftQuestions} onAjouter={q => setDraftQuestions(prev => [...prev, q])} />
              <input value={qTexte} onChange={e => setQTexte(e.target.value)} placeholder="Texte de la question" style={{ ...champ, marginTop: 6 }} />
              <select value={qType} onChange={e => setQType(e.target.value)} style={{ ...champ, background: "var(--c-surface)" }}>
                <option value="texte">Réponse libre</option>
                <option value="oui_non">Oui / Non</option>
                <option value="echelle">Échelle 1 à 5</option>
                <option value="choix_unique">Choix unique</option>
                <option value="choix_multiple">Choix multiple</option>
              </select>
              {(qType === "choix_unique" || qType === "choix_multiple") && (
                <input value={qOptions} onChange={e => setQOptions(e.target.value)} placeholder="Options séparées par des virgules" style={champ} />
              )}
              {qType === "texte" && (
                <div style={{ marginBottom: 8 }}>
                  <select value={qFormat} onChange={e => { setQFormat(e.target.value); setQMin(""); setQMax(""); }} style={{ ...champ, marginBottom: 6, background: "var(--c-surface)" }}>
                    <option value="texte">Format : texte libre</option>
                    <option value="nombre">Format : nombre</option>
                  </select>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="number" value={qMin} onChange={e => setQMin(e.target.value)} placeholder={qFormat === "nombre" ? "Valeur minimale" : "Longueur minimale (caractères)"} style={{ ...champ, marginBottom: 0 }} />
                    <input type="number" value={qMax} onChange={e => setQMax(e.target.value)} placeholder={qFormat === "nombre" ? "Valeur maximale" : "Longueur maximale (caractères)"} style={{ ...champ, marginBottom: 0 }} />
                  </div>
                  <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 4 }}>Optionnel : le bénévole ne pourra pas envoyer une réponse qui sort de ces limites.</div>
                </div>
              )}
              <input value={qGroupe} onChange={e => setQGroupe(e.target.value)} list="groupes-repetables-admin" placeholder="Groupe répétable (optionnel, ex : Point de pollution)" style={champ} />
              <datalist id="groupes-repetables-admin">{[...new Set(draftQuestions.map(q => q.groupe).filter(Boolean))].map(g => <option key={g} value={g} />)}</datalist>
              {qGroupe.trim() && <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: -4, marginBottom: 8 }}>Cette question et les suivantes portant le même nom de groupe pourront être répétées plusieurs fois par le répondant (ex. plusieurs sites touchés).</div>}
              {draftQuestions.some(q => ["oui_non", "echelle", "choix_unique", "choix_multiple"].includes(q.type_reponse)) && (
                <div style={{ marginBottom: 8 }}>
                  <select value={qConditionIndex} onChange={e => { setQConditionIndex(e.target.value); setQConditionValeur(""); }} style={{ ...champ, marginBottom: qConditionIndex !== "" ? 6 : 8, background: "var(--c-surface)" }}>
                    <option value="">Toujours poser cette question</option>
                    {draftQuestions.map((q, i) => ["oui_non", "echelle", "choix_unique", "choix_multiple"].includes(q.type_reponse) ? <option key={i} value={i}>Poser seulement si « {q.texte} » =…</option> : null)}
                  </select>
                  {qConditionIndex !== "" && (
                    <select value={qConditionValeur} onChange={e => setQConditionValeur(e.target.value)} style={{ ...champ, background: "var(--c-surface)" }}>
                      <option value="">Choisir la valeur déclenchante…</option>
                      {optionsQuestion(draftQuestions[Number(qConditionIndex)]).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  )}
                </div>
              )}
              <button type="button" onClick={ajouterQuestionDraft} style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "1px dashed var(--c-border)", background: "none", fontSize: T.small, cursor: "pointer" }}>+ Ajouter cette question</button>
            </div>
          )}

          {erreur && <div role="alert" style={{ fontSize: T.small, color: "#B5451B", marginBottom: 8 }}>{erreur}</div>}
          <button onClick={creerEnquete} disabled={busy} style={{ width: "100%", padding: "9px 0", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", opacity: busy ? 0.7 : 1 }}>
            {busy ? "…" : "Créer l'enquête"}
          </button>
          <button onClick={() => setShowCreer(false)} style={{ width: "100%", padding: "6px 0", background: "none", border: "none", color: "var(--c-text-muted)", fontSize: T.small, cursor: "pointer", marginTop: 4 }}>Annuler</button>
        </div>
      )}

      {liste === null ? (
        <div style={{ fontSize: T.small, color: "var(--c-text-muted)", textAlign: "center", padding: 16 }}>Chargement…</div>
      ) : liste.length === 0 ? (
        <div style={{ fontSize: T.body, color: "var(--c-text-muted)", textAlign: "center", padding: 16 }}>Aucune enquête créée pour le moment.</div>
      ) : (
        <div className="pace-grid-cards">
          {liste.map(e => (
            <button key={e.id} onClick={() => ouvrirGestion(e)} style={{
              textAlign: "left", background: "var(--c-surface)", borderRadius: 12, padding: 12, border: "1px solid var(--c-border)", cursor: "pointer" }}>
              <div style={{ fontWeight: 600, fontSize: T.body }}>{e.titre}</div>
              <div style={{ fontSize: T.meta, color: "var(--c-text-muted)", marginTop: 2 }}>{typeLabel[e.type]} · {e.statut === "ouverte" ? "en cours" : "clôturée"}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
