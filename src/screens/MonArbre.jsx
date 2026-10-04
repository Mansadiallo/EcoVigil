import { useEffect, useMemo, useState } from "react";
import { IconLayers, IconPlus, IconShare, IconSprout, IconTrash, IconTree } from "../components/icons.jsx";
import { MediaThumbSmall, PhotoCaptureButton, shareContent } from "../components/media.jsx";
import { Screen, SectionTitle, TreeRing } from "../components/ui.jsx";
import { logActivity } from "../lib/audit.js";
import { LocationPrecision, ZoneReboisementMap } from "../lib/carteUtils.jsx";
import { t } from "../lib/i18n.js";
import { DEVICE_ID } from "../lib/supabase.js";
import { formatCoordonnees } from "../lib/utils.js";
import { T } from "../lib/typo.jsx";

const ETAT_SUIVI = { vivant: { label: "En bonne santé", color: "var(--c-accent)" }, stresse: { label: "En difficulté", color: "var(--c-warning)" }, mort: { label: "Mort", color: "#B5451B" } };

export function MonArbre({ arbres, suivis, onAdd, onAddSuivi, lang, coordFormat }) {
  const [showForm, setShowForm] = useState(false);
  const [nom, setNom] = useState("");
  const [photo, setPhoto] = useState(null);
  const [suiviOuvert, setSuiviOuvert] = useState(null);
  const [gpsFix, setGpsFix] = useState(null);
  const [erreur, setErreur] = useState("");

  // Surface à reboiser : même exigence que dans l'Espace Organisation — le citoyen doit
  // d'abord définir la surface qu'il compte reboiser (contour + superficie déclarée) avant
  // de pouvoir enregistrer un arbre. Persistée localement par appareil (DEVICE_ID), comme
  // pour les organisations (persistée par organisation).
  const [zoneReboisement, setZoneReboisement] = useState(undefined); // undefined = pas encore chargée
  const [showEditeurZone, setShowEditeurZone] = useState(false);
  const [pointsZoneTemp, setPointsZoneTemp] = useState([]);
  const [latPointTemp, setLatPointTemp] = useState("");
  const [lngPointTemp, setLngPointTemp] = useState("");
  const [gpsPointTemp, setGpsPointTemp] = useState(null);
  const [erreurZone, setErreurZone] = useState("");
  const [superficieSaisie, setSuperficieSaisie] = useState("");
  const [uniteSuperficieSaisie, setUniteSuperficieSaisie] = useState("m2");

  function clefZoneReboisementCitoyen() { return `pace-citoyen-zone-reboisement-${DEVICE_ID}`; }
  useEffect(() => {
    try {
      const brut = localStorage.getItem(clefZoneReboisementCitoyen());
      setZoneReboisement(brut ? JSON.parse(brut) : null);
    } catch (e) { setZoneReboisement(null); }
  }, []);
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
  function enregistrerZoneReboisement() {
    setErreurZone("");
    if (pointsZoneTemp.length < 4) { setErreurZone("Il faut au moins 4 points pour délimiter une surface."); return; }
    const superficieM2 = superficieSaisieEnM2();
    if (superficieM2 === null) { setErreurZone("Merci de renseigner la superficie à reboiser (m² ou ha)."); return; }
    const zone = { points: pointsZoneTemp, superficie_m2: superficieM2, superficie_estimee_m2: superficieTempM2, unite_saisie: uniteSuperficieSaisie, defini_par: DEVICE_ID, date: new Date().toISOString() };
    try { localStorage.setItem(clefZoneReboisementCitoyen(), JSON.stringify(zone)); } catch (e) {}
    setZoneReboisement(zone);
    setShowEditeurZone(false);
    logActivity("zone_reboisement_definie", "citoyen", DEVICE_ID, `${pointsZoneTemp.length} points, ${formatSuperficie(superficieM2)}`);
  }
  function supprimerZoneReboisementCitoyen() {
    if (!confirm("Supprimer définitivement la surface à reboiser ? Elle ne réapparaîtra pas tant que tu ne la redéfiniras pas, et il faudra la redéfinir avant de pouvoir planter de nouveaux arbres.")) return;
    try { localStorage.removeItem(clefZoneReboisementCitoyen()); } catch (e) {}
    setZoneReboisement(null);
    setShowEditeurZone(false);
    logActivity("zone_reboisement_supprimee", "citoyen", DEVICE_ID, "");
  }

  function submit() {
    if (!nom.trim()) {
      setErreur("Merci d'indiquer l'espèce de l'arbre avant d'enregistrer.");
      return;
    }
    if (!gpsFix || gpsFix.lat == null || gpsFix.lng == null) {
      setErreur("Position GPS requise — attends que le signal soit trouvé avant d'enregistrer.");
      return;
    }
    setErreur("");
    onAdd({ nom, photo, lat: gpsFix.lat, lng: gpsFix.lng });
    setNom(""); setPhoto(null); setShowForm(false); setGpsFix(null); setErreur("");
  }

  function growth(a) {
    const days = (Date.now() - a.plantedAt) / 86400000;
    return Math.min(100, Math.round((days / 180) * 100));
  }

  function dernierSuivi(arbreId) {
    return (suivis || []).filter(s => s.arbre_id === arbreId).sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0] || null;
  }

  function joursDepuis(dateStr) {
    return Math.round((Date.now() - new Date(dateStr).getTime()) / 86400000);
  }

  return (
    <Screen>
      <SectionTitle sub={t(lang, "sub_arbre")}>{t(lang, "title_arbre")}</SectionTitle>

      {/* Étape préalable obligatoire : la surface à reboiser doit être définie (au moins 4 points
          de coordonnées formant un polygone) avant de pouvoir enregistrer des arbres — même
          exigence que dans l'Espace Organisation. */}
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
              <button onClick={supprimerZoneReboisementCitoyen} style={{ padding: "7px 12px", borderRadius: 8, border: "1px solid var(--c-danger-border-soft)", background: "var(--c-surface)", color: "#B5451B", fontWeight: 600, fontSize: T.small, cursor: "pointer" }}>
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

      {!showForm && zoneReboisement && (
        <button onClick={() => setShowForm(true)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0", borderRadius: 12, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: T.body, cursor: "pointer", marginBottom: 16 }}>
          <IconPlus size={16} /> {t(lang, "btn_planter")}
        </button>
      )}
      {showForm && (
        <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 16 }}>
          <PhotoCaptureButton photo={photo} onChange={setPhoto} label="Photo de l'arbre" previewMaxHeight={130} />
          <input value={nom} onChange={e => { setNom(e.target.value); if (erreur) setErreur(""); }} placeholder="Espèce (ex : Manguier, Teck...)" style={{ width: "100%", padding: 10, borderRadius: 10, border: erreur ? "1px solid var(--c-danger)" : "1px solid var(--c-border)", fontSize: T.field, marginBottom: erreur ? 4 : 10, boxSizing: "border-box" }} />
          {erreur && <div style={{ color: "var(--c-danger)", fontSize: T.small, marginBottom: 10 }}>{erreur}</div>}
          <LocationPrecision coordFormat={coordFormat} onUpdate={(fix) => { setGpsFix(fix); if (erreur) setErreur(""); }} compact />
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { setShowForm(false); setErreur(""); }} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: T.body }}>Annuler</button>
            <button onClick={submit} style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: "var(--c-accent)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: T.body }}>Enregistrer</button>
          </div>
        </div>
      )}
      {arbres.length === 0 && !showForm && (
        <div style={{ color: "var(--c-text-muted)", fontSize: T.body, background: "var(--c-surface)", padding: 16, borderRadius: 12, border: "1px dashed var(--c-border-soft)", textAlign: "center" }}>
          <IconSprout size={22} /><div style={{marginTop: 6}}>Aucun arbre enregistré pour le moment.</div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[...arbres].reverse().map(a => {
          const ds = dernierSuivi(a.id);
          const refDate = ds ? ds.created_at : a.plantedAt;
          const jours = joursDepuis(refDate);
          const rappel = jours >= 90;
          const etatInfo = ds ? ETAT_SUIVI[ds.etat] || ETAT_SUIVI.vivant : null;
          return (
          <div key={a.id} style={{ background: "var(--c-surface)", borderRadius: 14, padding: 12, border: "1px solid var(--c-border)" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
                {a.photo_url ? (
                  <MediaThumbSmall src={a.photo_url} style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "3px solid var(--c-bg)" }} />
                ) : (
                  <>
                    <TreeRing pct={growth(a)} />
                    <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}><IconTree size={18} color="var(--c-accent)" /></span>
                  </>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: T.body, color: "var(--c-text)" }}>{a.nom}</div>
                <div style={{ fontSize: T.small, color: "var(--c-text-muted)" }}>Planté le {a.date}</div>
                {etatInfo && <div style={{ fontSize: T.meta, fontWeight: 600, color: etatInfo.color, marginTop: 2 }}>{etatInfo.label} · suivi il y a {jours} j</div>}
              </div>
              <button onClick={() => shareContent("Mon arbre sur EcoVigil", `Je viens d'enregistrer un ${a.nom} sur EcoVigil 🌱 Ensemble pour un avenir durable.`)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--c-text-muted)", padding: 6 }}><IconShare size={16} /></button>
              <div style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: T.body, color: "var(--c-accent)", fontWeight: 600 }}>{growth(a)}%</div>
            </div>

            {rappel && suiviOuvert !== a.id && (
              <div style={{ marginTop: 8, fontSize: T.meta, fontWeight: 600, color: "var(--c-warning)", background: "var(--c-warning-bg)", borderRadius: 8, padding: "6px 8px" }}>
                🔔 Suivi recommandé — dernière preuve de croissance il y a {jours} jours
              </div>
            )}

            {suiviOuvert === a.id ? (
              <SuiviForm arbre={a} onCancel={() => setSuiviOuvert(null)} onSave={async (payload) => { await onAddSuivi(a.id, payload); setSuiviOuvert(null); }} />
            ) : (
              <button onClick={() => setSuiviOuvert(a.id)} style={{ marginTop: 8, width: "100%", padding: "8px 0", borderRadius: 8, border: "1px dashed var(--c-text-faint)", background: "var(--c-surface-dashed)", color: "var(--c-text-secondary)", fontSize: T.small, cursor: "pointer" }}>
                + Ajouter une preuve de suivi (photo récente)
              </button>
            )}
          </div>
          );
        })}
      </div>
    </Screen>
  );
}

function SuiviForm({ onSave, onCancel }) {
  const [photo, setPhoto] = useState(null);
  const [etat, setEtat] = useState("vivant");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid var(--c-border-soft)" }}>
      <PhotoCaptureButton photo={photo} onChange={setPhoto} label="Photo de suivi" previewMaxHeight={120} compact />
      <select value={etat} onChange={e => setEtat(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }}>
        {Object.entries(ETAT_SUIVI).map(([id, v]) => <option key={id} value={id}>{v.label}</option>)}
      </select>
      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Note (optionnel)" style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid var(--c-border)", fontSize: T.field, marginBottom: 8, boxSizing: "border-box" }} />
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onCancel} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "1px solid var(--c-border)", background: "var(--c-surface)", cursor: "pointer", fontSize: T.body }}>Annuler</button>
        <button disabled={busy} onClick={async () => { setBusy(true); await onSave({ photo, etat, note }); setBusy(false); }} style={{ flex: 1, padding: "8px 0", borderRadius: 8, border: "none", background: "var(--c-accent)", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: T.body }}>
          {busy ? "Envoi…" : "Enregistrer le suivi"}
        </button>
      </div>
    </div>
  );
}
