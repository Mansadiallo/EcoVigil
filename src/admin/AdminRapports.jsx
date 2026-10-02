import { useEffect, useState } from "react";
import { IconLock } from "../components/icons.jsx";
import { toCSV } from "../components/media.jsx";
import { StatCard } from "../components/ui.jsx";
import { logAudit } from "../lib/audit.js";
import { ENV_DEFI_PAR_CODE, chargerTaxonomiePubliee } from "../lib/categories.jsx";
import { downloadCSV, exportExcel, exportPDF, exportWord } from "../lib/exports.js";
import { supabase } from "../lib/supabase.js";
import { calculerPriorite } from "../lib/utils.js";

function weeksAgo(dateStr, n) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now - d) / 86400000);
  return Math.floor(diffDays / 7) === n;
}

function weeklyBuckets(items, weeks = 8) {
  const buckets = [];
  for (let i = weeks - 1; i >= 0; i--) {
    buckets.push({ week: i, count: items.filter(x => x.created_at && weeksAgo(x.created_at, i)).length });
  }
  return buckets;
}

function MiniBarChart({ data, color, label }) {
  const max = Math.max(1, ...data.map(d => d.count));
  return (
    <div style={{ background: "var(--c-surface)", borderRadius: 14, padding: 14, border: "1px solid var(--c-border)", marginBottom: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--c-text)", marginBottom: 10 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 70 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
            <div style={{ width: "100%", background: color, borderRadius: 3, height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.week === 0 ? 1 : 0.65 }} title={`${d.count}`} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 8.5, color: "var(--c-text-muted)" }}>{d.week === 0 ? "cette sem." : `-${d.week}`}</div>
        ))}
      </div>
    </div>
  );
}

function RepartitionParDefi({ signalements }) {
  const [, setV] = useState(0);
  useEffect(() => { chargerTaxonomiePubliee().then(() => setV(x => x + 1)); }, []);
  if (Object.keys(ENV_DEFI_PAR_CODE).length === 0) return null; // taxonomie pas encore publiée : rien à ventiler
  const counts = {};
  (signalements || []).forEach(s => {
    const defi = ENV_DEFI_PAR_CODE[s.categorie] || "Non classé";
    counts[defi] = (counts[defi] || 0) + 1;
  });
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;
  const max = entries[0][1];
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Répartition par défi environnemental</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {entries.map(([nom, count]) => (
          <div key={nom}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--c-text-secondary)", marginBottom: 3 }}>
              <span>{nom}</span><span>{count}</span>
            </div>
            <div style={{ height: 6, background: "var(--c-surface-soft)", borderRadius: 999 }}>
              <div style={{ height: 6, width: `${(count / max) * 100}%`, background: "var(--c-accent-dark)", borderRadius: 999 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ExportRow({ label, count, getRows, columns, filenamePrefix, title }) {
  const [busy, setBusy] = useState(null);
  const formats = [
    { id: "csv", label: "CSV" },
    { id: "xlsx", label: "Excel" },
    { id: "doc", label: "Word" },
    { id: "pdf", label: "PDF" },
  ];
  async function lancer(format) {
    setBusy(format);
    try {
      const rows = await getRows();
      const base = `${filenamePrefix}-${Date.now()}`;
      if (format === "csv") downloadCSV(`${base}.csv`, toCSV(rows, columns));
      else if (format === "xlsx") exportExcel(`${base}.xlsx`, rows, columns, title);
      else if (format === "doc") exportWord(`${base}.doc`, title, rows, columns);
      else if (format === "pdf") exportPDF(`${base}.pdf`, title, rows, columns);
    } catch (e) {
      alert("Échec de l'export : " + (e && e.message ? e.message : "erreur inconnue"));
    } finally { setBusy(null); }
  }
  return (
    <div style={{ border: "1px solid var(--c-border)", borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--c-text)", marginBottom: 8 }}>{label} ({count})</div>
      <div style={{ display: "flex", gap: 6 }}>
        {formats.map(f => (
          <button key={f.id} onClick={() => lancer(f.id)} disabled={busy !== null} style={{
            flex: 1, padding: "7px 0", borderRadius: 8, border: "1px solid var(--c-border)",
            background: "var(--c-surface)", color: "var(--c-text-secondary)", fontWeight: 600, fontSize: 11,
            cursor: busy !== null ? "default" : "pointer", opacity: busy && busy !== f.id ? 0.5 : 1 }}>
            {busy === f.id ? "…" : f.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Permet au Centre d'EcoVigil de consulter, pour n'importe quelle organisation, le même rapport
// exportable (signalements de son domaine) que celle-ci voit dans son propre Espace Organisation —
// même logique de filtrage par défis/codesDomaine que EspaceOrganisation.charger(), dupliquée ici
// car calculée localement à partir de l'organisation choisie plutôt que de la session connectée.
function AdminRapportOrganisation() {
  const [organisations, setOrganisations] = useState(null);
  const [orgId, setOrgId] = useState("");
  const [chargement, setChargement] = useState(false);
  const [rapport, setRapport] = useState(null); // { org, rows }

  useEffect(() => {
    supabase.from("organisations").select("id, nom, type, defis, statut").eq("is_deleted", false).order("nom", { ascending: true })
      .then(({ data }) => setOrganisations(data || []));
  }, []);

  async function chargerRapport(id) {
    setOrgId(id);
    setRapport(null);
    if (!id || !organisations) return;
    const orgData = organisations.find(o => o.id === id);
    if (!orgData) return;
    setChargement(true);
    const { data: problemes } = await supabase.from("env_problemes").select("code, defi_id");
    const codesDomaine = (problemes || []).filter(p => (orgData.defis || []).includes(p.defi_id)).map(p => p.code);
    let sigs = [];
    if (codesDomaine.length > 0) {
      let requete = supabase.from("signalements").select("*").in("categorie", codesDomaine).eq("is_deleted", false).order("created_at", { ascending: false }).limit(300);
      if (orgData.type !== "gouvernement") {
        const { data: mesB } = await supabase.from("benevoles").select("id").eq("organisation_id", orgData.id).eq("is_deleted", false);
        const ids = (mesB || []).map(b => b.id);
        requete = ids.length > 0 ? requete.in("benevole_id", ids) : null;
      }
      if (requete) { const { data } = await requete; sigs = data || []; }
    }
    setRapport({ org: orgData, rows: sigs });
    setChargement(false);
  }

  const colonnes = [
    { key: "id", label: "ID" }, { key: "categorie", label: "Catégorie" }, { key: "urgence", label: "Urgence" },
    { key: "statut", label: "Statut" }, { key: "description", label: "Description" },
    { key: "lat", label: "Latitude" }, { key: "lng", label: "Longitude" }, { key: "date", label: "Date" },
    { key: "benevole_nom", label: "Bénévole — Nom" }, { key: "benevole_contact", label: "Bénévole — Contact" },
    { key: "benevole_pays", label: "Bénévole — Pays" }, { key: "benevole_ville", label: "Bénévole — Ville" },
    { key: "benevole_quartier", label: "Bénévole — Quartier" },
  ];

  return (
    <div style={{ marginTop: 24 }}>
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Rapports par organisation</div>
      <div style={{ fontSize: 11, color: "var(--c-text-muted)", marginBottom: 10 }}>
        Même rapport (signalements de son domaine) que celui que l'organisation exporte depuis son propre espace.
      </div>
      <select value={orgId} onChange={e => chargerRapport(e.target.value)} style={{ width: "100%", padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, marginBottom: 10, background: "var(--c-surface)" }}>
        <option value="">Sélectionner une organisation…</option>
        {(organisations || []).map(o => (
          <option key={o.id} value={o.id}>{o.nom} ({o.type === "gouvernement" ? "Gouvernement" : "ONG"}{o.statut !== "valide" ? " — non validée" : ""})</option>
        ))}
      </select>
      {chargement && <div style={{ fontSize: 12, color: "var(--c-text-muted)", textAlign: "center", padding: 10 }}>Chargement…</div>}
      {rapport && (
        <ExportRow
          label={`Signalements du domaine de ${rapport.org.nom}`}
          count={rapport.rows.length}
          columns={colonnes}
          filenamePrefix={`pace-${rapport.org.type}-${(rapport.org.nom || "org").replace(/\s+/g, "-")}`}
          title={`Rapport ${rapport.org.nom}`}
          getRows={() => rapport.rows.map(s => ({ ...s, date: new Date(s.created_at).toLocaleDateString("fr-FR") }))}
        />
      )}
    </div>
  );
}

export function AdminRapports({ signalements, arbres, isSuperAdmin, centreVerrouille, onToggleCentre }) {
  const [benevolesCount, setBenevolesCount] = useState(null);

  useEffect(() => {
    supabase.from("benevoles").select("id", { count: "exact", head: true }).eq("is_deleted", false).then(({ count }) => setBenevolesCount(count));
  }, []);

  const colonnesSignalements = [
    { key: "id", label: "ID" }, { key: "categorie", label: "Catégorie" }, { key: "defi", label: "Défi" }, { key: "urgence", label: "Urgence" }, { key: "priorite", label: "Priorité" },
    { key: "statut", label: "Statut" }, { key: "description", label: "Description" },
    { key: "lat", label: "Latitude" }, { key: "lng", label: "Longitude" },
    { key: "date", label: "Date" }, { key: "device_id", label: "Appareil" },
    { key: "benevole_nom", label: "Bénévole — Nom" }, { key: "benevole_contact", label: "Bénévole — Contact" },
    { key: "benevole_pays", label: "Bénévole — Pays" }, { key: "benevole_ville", label: "Bénévole — Ville" },
    { key: "benevole_quartier", label: "Bénévole — Quartier" },
  ];
  const colonnesArbres = [
    { key: "id", label: "ID" }, { key: "nom", label: "Espèce" }, { key: "lat", label: "Latitude" },
    { key: "lng", label: "Longitude" }, { key: "date", label: "Date de plantation" }, { key: "device_id", label: "Appareil" },
  ];
  const colonnesBenevoles = [
    { key: "nom", label: "Nom" }, { key: "contact", label: "Contact" }, { key: "zone", label: "Zone" },
    { key: "statut", label: "Statut" }, { key: "created_at", label: "Date d'inscription" },
  ];

  const resolus = signalements.filter(s => s.statut === "resolu").length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 10, marginBottom: 18 }}>
        <StatCard label="Signalements" value={signalements.length} unit="" accent="#B5451B" />
        <StatCard label="Résolus" value={resolus} unit="" accent="var(--c-accent)" />
        <StatCard label="Arbres plantés" value={arbres.length} unit="" accent="var(--c-accent)" />
        <StatCard label="Bénévoles" value={benevolesCount === null ? "…" : benevolesCount} unit="" accent="var(--c-accent-dark)" />
      </div>

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Évolution (8 dernières semaines)</div>
      <MiniBarChart data={weeklyBuckets(signalements)} color="#B5451B" label="Signalements" />
      <MiniBarChart data={weeklyBuckets(arbres)} color="var(--c-accent)" label="Arbres plantés" />

      <RepartitionParDefi signalements={signalements} />

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Exporter le rapport</div>
      <ExportRow label="Signalements" count={signalements.length} columns={colonnesSignalements} filenamePrefix="pace-signalements" title="Rapport EcoVigil — Signalements"
        getRows={() => signalements.map(s => ({ ...s, defi: ENV_DEFI_PAR_CODE[s.categorie] || "Non classé", priorite: calculerPriorite(s, signalements) }))} />
      <ExportRow label="Arbres plantés" count={arbres.length} columns={colonnesArbres} filenamePrefix="pace-arbres" title="Rapport EcoVigil — Arbres plantés"
        getRows={() => arbres} />
      <ExportRow label="Bénévoles" count={benevolesCount === null ? 0 : benevolesCount} columns={colonnesBenevoles} filenamePrefix="pace-benevoles" title="Rapport EcoVigil — Bénévoles"
        getRows={async () => { const { data } = await supabase.from("benevoles").select("*").eq("is_deleted", false).order("created_at", { ascending: false }); return data || []; }} />

      <AdminRapportOrganisation />

      <AdminEquipe isSuperAdmin={isSuperAdmin} centreVerrouille={centreVerrouille} onToggleCentre={onToggleCentre} />
    </div>
  );
}

function AdminEquipe({ isSuperAdmin, centreVerrouille, onToggleCentre }) {
  const [admins, setAdmins] = useState(null);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    const { data } = await supabase.from("admins").select("email, added_at, role").order("added_at", { ascending: true });
    setAdmins(data || []);
  }
  useEffect(() => { load(); }, []);

  async function addAdmin(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!email.trim()) return;
    setBusy(true); setMsg("");
    const emailNormalise = email.trim().toLowerCase();
    const { error } = await supabase.from("admins").insert({ email: emailNormalise });
    setBusy(false);
    if (error) { setMsg("Échec — vérifie l'adresse ou tes droits."); return; }
    // Action la plus sensible de l'application (octroi de droits admin) : elle doit être tracée.
    logAudit("ajout_admin", "admins", emailNormalise, null, { role: "admin" });
    setMsg(`${email} peut maintenant créer un compte admin avec cette adresse.`);
    setEmail("");
    load();
  }

  async function retirerAdmin(a) {
    if (!confirm(`Retirer les droits admin de ${a.email} ? Cette action est immédiate.`)) return;
    const { data, error } = await supabase.from("admins").delete().eq("email", a.email);
    if (error) { setMsg("Échec du retrait — vérifie tes droits (réservé au super-admin)."); return; }
    // Le RLS bloque silencieusement (0 ligne supprimée, pas d'erreur) le retrait du dernier
    // admin restant, pour éviter un verrouillage total du Centre d'EcoVigil.
    if (!data || data.length === 0) { setMsg("Impossible de retirer ce compte : c'est le dernier administrateur restant."); return; }
    logAudit("retrait_admin", "admins", a.email, null, { role: a.role });
    setMsg(`${a.email} a été retiré de l'équipe administrateurs.`);
    load();
  }

  return (
    <div style={{ marginTop: 24 }}>
      {isSuperAdmin && (
        <div style={{
          background: centreVerrouille && centreVerrouille.verrouille ? "var(--c-danger-border-soft)" : "var(--c-surface)",
          border: `1px solid ${centreVerrouille && centreVerrouille.verrouille ? "#B5451B" : "var(--c-border)"}`,
          borderRadius: 14, padding: 14, marginBottom: 20
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <IconLock size={15} color={centreVerrouille && centreVerrouille.verrouille ? "#B5451B" : "var(--c-text-muted)"} />
            <div style={{ fontWeight: 700, fontSize: 13, color: centreVerrouille && centreVerrouille.verrouille ? "#B5451B" : "var(--c-text)" }}>
              Centre {centreVerrouille && centreVerrouille.verrouille ? "verrouillé" : "déverrouillé"}
            </div>
          </div>
          <div style={{ fontSize: 11.5, color: "var(--c-text-muted)", marginBottom: 10, lineHeight: 1.5 }}>
            {centreVerrouille && centreVerrouille.verrouille
              ? `Seul toi (super-admin) as accès au Centre d'EcoVigil. Les autres admins voient un écran d'accès suspendu.${centreVerrouille.motif ? ` Motif : ${centreVerrouille.motif}` : ""}`
              : "En cas de compte admin compromis ou pour une maintenance, tu peux suspendre l'accès de tous les autres admins. Toi seul gardes l'accès."}
          </div>
          <button onClick={async () => {
            if (centreVerrouille && centreVerrouille.verrouille) {
              if (!confirm("Déverrouiller le Centre d'EcoVigil pour tous les admins ?")) return;
              await onToggleCentre();
            } else {
              const motif = prompt("Motif du verrouillage (optionnel, visible par les admins bloqués) :") || "";
              if (!confirm("Verrouiller le Centre d'EcoVigil pour tous les admins sauf toi ?")) return;
              await onToggleCentre(motif);
            }
          }} style={{
            padding: "9px 14px", borderRadius: 10, border: "none", fontWeight: 600, fontSize: 12.5, cursor: "pointer",
            background: centreVerrouille && centreVerrouille.verrouille ? "var(--c-accent-dark)" : "#B5451B", color: "#fff"
          }}>
            {centreVerrouille && centreVerrouille.verrouille ? "Déverrouiller" : "Verrouiller le Centre d'EcoVigil"}
          </button>
        </div>
      )}
      <div style={{ fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 600, color: "var(--c-accent-dark)", marginBottom: 10 }}>Équipe administrateurs</div>
      <form onSubmit={addAdmin} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="email@exemple.com"
          style={{ flex: 1, padding: 9, borderRadius: 10, border: "1px solid var(--c-border)", fontSize: 13, boxSizing: "border-box" }} />
        <button type="button" onClick={addAdmin} disabled={busy} style={{ padding: "0 16px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          {busy ? "..." : "Ajouter"}
        </button>
      </form>
      {msg && <div style={{ fontSize: 11.5, color: "var(--c-text-secondary)", marginBottom: 10 }}>{msg}</div>}
      <div style={{ fontSize: 10.5, color: "var(--c-text-muted)", marginBottom: 8 }}>La personne devra créer son compte via "Centre d'EcoVigil → Créer un compte" avec cette adresse exacte.</div>
      {admins === null ? <div style={{ fontSize: 12, color: "var(--c-text-muted)" }}>Chargement…</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {admins.map(a => (
            <div key={a.email} style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)", borderRadius: 10, padding: "8px 12px", fontSize: 12.5, color: "var(--c-text)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.email}</span>
                <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, flexShrink: 0, background: a.role === "super_admin" ? "var(--c-accent-dark)" : "var(--c-surface-soft)", color: a.role === "super_admin" ? "#fff" : "var(--c-text-muted)" }}>
                  {a.role === "super_admin" ? "Super admin" : "Admin"}
                </span>
              </div>
              {isSuperAdmin && a.role !== "super_admin" && (
                <button onClick={() => retirerAdmin(a)} style={{ flexShrink: 0, fontSize: 11, padding: "5px 10px", borderRadius: 8, border: "1px solid #B5451B", background: "var(--c-danger-border-soft)", color: "#B5451B", fontWeight: 600, cursor: "pointer" }}>Retirer</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
