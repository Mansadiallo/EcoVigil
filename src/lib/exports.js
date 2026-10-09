import { LOGO_DATA_URL } from "../imagesData.js";

export function downloadCSV(filename, csv) {
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function celluleTexte(v) { return (v === null || v === undefined) ? "" : String(v); }

// --- Export Excel (fichier .xlsx réel, via SheetJS déjà chargé en CDN) ---
export function exportExcel(filename, rows, columns, title, options) {
  if (!window.XLSX) { alert("Bibliothèque Excel indisponible (vérifie ta connexion)."); return; }
  // Note technique : l'intégration d'une image réelle et la mise en forme des cellules (gras,
  // couleur) sont des fonctionnalités payantes de SheetJS Pro. La version gratuite utilisée ici
  // ne les supporte pas — même en fixant ws[cellule].s, rien ne s'appliquerait silencieusement.
  // On identifie donc le rapport par des lignes d'en-tête texte "ECOVIGIL" à la place.
  const aoa = [
    ["ECOVIGIL"],
    [title || "Rapport"],
    [`Exporté le ${new Date().toLocaleString("fr-FR")}`],
    [],
    columns.map(c => c.label),
    ...rows.map(r => columns.map(c => celluleTexte(r[c.key]))),
    [],
    [`EcoVigil — Plateforme Africaine d'Actions et de Contrôle Environnemental — ${rows.length} ligne${rows.length > 1 ? "s" : ""}`],
  ];
  const ligneEntete = 4; // index (0-based) de la ligne des libellés de colonnes dans aoa
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(columns.length - 1, 0) } }];
  // Largeur de chaque colonne adaptée à son contenu (libellé ou valeur la plus longue), bornée.
  ws["!cols"] = columns.map(c => {
    const maxContenu = rows.reduce((m, r) => Math.max(m, celluleTexte(r[c.key]).length), 0);
    return { wch: Math.min(60, Math.max(12, String(c.label).length + 2, maxContenu + 2)) };
  });
  // Mise en page : gèle les lignes d'en-tête (titre + libellés de colonnes) pour qu'elles
  // restent visibles en défilant, répète la ligne de libellés sur chaque page imprimée, et
  // passe en paysage (plus lisible pour des tableaux à nombreuses colonnes). Ces trois
  // propriétés sont documentées comme supportées par la version gratuite de SheetJS
  // (contrairement au style de cellule et aux images, qui ne le sont pas).
  ws["!freeze"] = { xSplit: "0", ySplit: String(ligneEntete + 1), topLeftCell: `A${ligneEntete + 2}`, activePane: "bottomLeft", state: "frozen" };
  ws["!printHeader"] = [ligneEntete + 1, ligneEntete + 1];
  ws["!pageSetup"] = { orientation: "landscape", scale: 100, fitToWidth: 1 };
  const wb = XLSX.utils.book_new();
  // Feuille « Synthèse » (totaux par statut, urgence, défi…) placée avant le détail, si fournie.
  if (options && options.synthese && options.synthese.length) {
    const s = [["ECOVIGIL"], [title || "Rapport"], [`Exporté le ${new Date().toLocaleString("fr-FR")}`], []];
    options.synthese.forEach(g => { s.push([g.titre]); g.lignes.forEach(l => s.push([l[0], l[1]])); s.push([]); });
    const ws2 = XLSX.utils.aoa_to_sheet(s);
    ws2["!cols"] = [{ wch: 42 }, { wch: 12 }];
    XLSX.utils.book_append_sheet(wb, ws2, "Synthèse");
  }
  XLSX.utils.book_append_sheet(wb, ws, "Données");
  XLSX.writeFile(wb, filename);
}

// --- Export Word : document HTML avec les espaces de noms Office, ouvert nativement par
// Word (technique standard, sans dépendance supplémentaire, fiable depuis Office 97). ---
// Génère, pour Word/PDF (documents narratifs), une "fiche" par ligne : chaque champ est présenté
// comme un intitulé suivi de son explication, empilés verticalement — pas de grille de tableau,
// contrairement à Excel/CSV qui restent au format tabulaire (adapté au traitement de données).
export function exportWord(filename, title, rows, columns) {
  const echapper = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fiches = rows.map((r, idx) => {
    const champs = columns.map(c => `
      <p style="margin:2px 0 7px 0;line-height:1.4;">
        <span style="font-weight:bold;color:#2E5A3E;">${echapper(c.label)} : </span><span>${echapper(celluleTexte(r[c.key]) || "—")}</span>
      </p>`).join("");
    return `
      <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #ccc;">
        <div style="font-weight:bold;font-size:13px;color:#2E5A3E;margin-bottom:6px;">Élément ${idx + 1}</div>
        ${champs}
      </div>`;
  }).join("");
  // Mise en page réelle : format A4 portrait avec marges, via la syntaxe @page propre à Office
  // (identique à ce que Word génère lui-même) — orientation portrait plus adaptée à un document
  // narratif (paragraphes) qu'à un tableau large.
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8" />
<title>${echapper(title)}</title>
<style>
  @page Section1 { size: 21.0cm 29.7cm; mso-page-orientation: portrait; margin: 2cm 2cm 2cm 2cm; }
  div.Section1 { page: Section1; }
</style>
</head>
<body style="font-family:Calibri,Arial,sans-serif;font-size:11px;">
<div class="Section1">
<table style="border:none;margin-bottom:18px;"><tr>
  <td style="border:none;padding:0;"><img src="${LOGO_DATA_URL}" width="48" height="48" alt="EcoVigil" /></td>
  <td style="border:none;padding:0 0 0 10px;vertical-align:middle;">
    <div style="font-size:18px;font-weight:bold;color:#2E5A3E;">${echapper(title)}</div>
    <div style="font-size:10px;color:#666;">Exporté le ${new Date().toLocaleString("fr-FR")} — EcoVigil — ${rows.length} élément${rows.length > 1 ? "s" : ""}</div>
  </td>
</tr></table>
${fiches}
<div style="margin-top:16px;padding-top:8px;border-top:1px solid #ccc;font-size:9px;color:#888;text-align:center;">
  EcoVigil — Plateforme Africaine d'Actions et de Contrôle Environnemental
</div>
</div>
</body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Export PDF (via jsPDF, déjà chargé en CDN) — même logique narrative que exportWord ---
export function exportPDF(filename, title, rows, columns) {
  if (!window.jspdf) { alert("Bibliothèque PDF indisponible (vérifie ta connexion)."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const marginX = 16;
  const contentW = pageW - marginX * 2 - 2;
  const bottomLimit = pageH - 18; // réserve pour le pied de page

  function dessinerEntete() {
    try { doc.addImage(LOGO_DATA_URL, "PNG", marginX, 8, 12, 12); } catch (e) { /* logo non critique */ }
    doc.setFontSize(14); doc.setTextColor(46, 90, 62); doc.setFont(undefined, "bold");
    doc.text(title, marginX + 16, 15);
    doc.setFont(undefined, "normal");
    doc.setFontSize(9); doc.setTextColor(120);
    doc.text(`Exporté le ${new Date().toLocaleString("fr-FR")} — EcoVigil — ${rows.length} élément${rows.length > 1 ? "s" : ""}`, marginX + 16, 21);
    doc.setTextColor(0);
    doc.setDrawColor(74, 139, 111); doc.setLineWidth(0.5);
    doc.line(marginX, 24, pageW - marginX, 24);
    return 32;
  }

  let y = dessinerEntete();

  rows.forEach((r, idx) => {
    const champs = columns.map(c => ({ label: c.label, texte: doc.splitTextToSize(celluleTexte(r[c.key]) || "—", contentW - 4) }));
    const hauteurBloc = 8 + champs.reduce((acc, ch) => acc + 4.4 + ch.texte.length * 4.2 + 1.5, 0) + 8;

    // On évite de couper une fiche entre deux pages : si elle ne tient pas, nouvelle page d'abord.
    if (y + hauteurBloc > bottomLimit) {
      doc.addPage();
      y = dessinerEntete();
    }

    doc.setFontSize(11); doc.setTextColor(46, 90, 62); doc.setFont(undefined, "bold");
    doc.text(`Élément ${idx + 1}`, marginX, y);
    y += 6.5;

    champs.forEach(ch => {
      doc.setFontSize(8.5); doc.setTextColor(90, 90, 90); doc.setFont(undefined, "bold");
      doc.text(`${ch.label} :`, marginX, y);
      y += 4.4;
      doc.setFont(undefined, "normal"); doc.setTextColor(20, 20, 20);
      doc.text(ch.texte, marginX + 2, y);
      y += ch.texte.length * 4.2 + 1.5;
    });

    doc.setDrawColor(220, 220, 220); doc.setLineWidth(0.2);
    doc.line(marginX, y, pageW - marginX, y);
    y += 8;
  });

  // Pied de page (logo + numéro) ajouté après coup sur chaque page réellement générée.
  const totalPages = doc.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    try { doc.addImage(LOGO_DATA_URL, "PNG", marginX, pageH - 12, 6, 6); } catch (e) {}
    doc.setFontSize(8); doc.setTextColor(120);
    doc.text("EcoVigil", marginX + 8, pageH - 8);
    doc.text(`Page ${p} / ${totalPages}`, pageW - marginX, pageH - 8, { align: "right" });
    doc.setTextColor(0);
  }

  doc.save(filename);
}


// =====================================================================================
// Rapports narratifs structurés (Word / PDF) : en-tête avec logo, bloc de synthèse, puis une
// fiche par élément découpée en rubriques (sections). Chaque rubrique : { titre, champs: [[cle, libellé], ...] } ;
// les champs vides sont omis, et une rubrique entièrement vide n'est pas affichée.
// options : { sousTitre, synthese: [{ titre, lignes: [[libellé, nombre]] }], titreCarte(r), metaCarte(r) }
// =====================================================================================
function champsRenseignes(r, sec) {
  return sec.champs.map(([k, lab]) => [lab, celluleTexte(r[k]).trim()]).filter(([, v]) => v !== "");
}

export function exportRapportWord(filename, title, rows, sections, options = {}) {
  const e = (v) => celluleTexte(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
  const vert = "#2E5A3E", vertClair = "#EAF2EC", bord = "#CFDCD3";
  const synthese = options.synthese || [];
  const blocSynthese = synthese.length ? `
<div style="font-size:13px;font-weight:bold;color:${vert};margin:6px 0 6px 0;">Synthèse</div>
<table style="width:100%;border-collapse:collapse;margin-bottom:20px;"><tr>${synthese.map(g => `
  <td style="width:${Math.floor(100 / synthese.length)}%;vertical-align:top;border:1px solid ${bord};padding:8px 10px;background:#F7FAF8;">
    <div style="font-weight:bold;color:${vert};margin-bottom:4px;">${e(g.titre)}</div>
    ${g.lignes.map(l => `<div>${e(l[0])} : <b>${e(l[1])}</b></div>`).join("")}
  </td>`).join("")}</tr></table>` : "";
  const cartes = rows.map((r, i) => {
    const blocs = sections.map(sec => {
      const lignes = champsRenseignes(r, sec).map(([lab, v]) => `
        <tr><td style="width:32%;background:#F4F7F5;border:1px solid ${bord};padding:4px 8px;font-weight:bold;color:#3D4F44;vertical-align:top;">${e(lab)}</td>
        <td style="border:1px solid ${bord};padding:4px 8px;vertical-align:top;">${e(v)}</td></tr>`).join("");
      return lignes ? `<tr><td colspan="2" style="background:${vertClair};color:${vert};font-weight:bold;padding:5px 8px;border:1px solid ${bord};">${e(sec.titre)}</td></tr>${lignes}` : "";
    }).join("");
    const t = options.titreCarte ? options.titreCarte(r) : `Élément ${i + 1}`;
    const meta = options.metaCarte ? options.metaCarte(r) : "";
    return `<table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <tr><td colspan="2" style="background:${vert};color:#FFFFFF;padding:7px 10px;font-weight:bold;font-size:13px;">${i + 1}. ${e(t)}${meta ? ` <span style="font-weight:normal;font-size:10px;"> — ${e(meta)}</span>` : ""}</td></tr>${blocs}</table>`;
  }).join("");
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8" /><title>${e(title)}</title>
<style>
  @page Section1 { size: 21.0cm 29.7cm; mso-page-orientation: portrait; margin: 1.8cm 1.8cm 1.8cm 1.8cm; }
  div.Section1 { page: Section1; }
</style></head>
<body style="font-family:Calibri,Arial,sans-serif;font-size:11px;color:#1B2A1F;">
<div class="Section1">
<table style="width:100%;border-collapse:collapse;margin-bottom:6px;"><tr>
  <td style="border:none;padding:0 0 8px 0;width:60px;"><img src="${LOGO_DATA_URL}" width="52" height="52" alt="EcoVigil" /></td>
  <td style="border:none;padding:0 0 8px 12px;vertical-align:middle;">
    <div style="font-size:19px;font-weight:bold;color:${vert};">${e(title)}</div>
    ${options.sousTitre ? `<div style="font-size:12px;color:#3D4F44;">${e(options.sousTitre)}</div>` : ""}
    <div style="font-size:10px;color:#666;">Exporté le ${new Date().toLocaleString("fr-FR")} — ${rows.length} élément${rows.length > 1 ? "s" : ""}</div>
  </td></tr>
  <tr><td colspan="2" style="border:none;border-top:3px solid ${vert};padding:0;font-size:2px;">&nbsp;</td></tr></table>
${blocSynthese}
${cartes || "<p>Aucun élément.</p>"}
<div style="margin-top:14px;padding-top:8px;border-top:1px solid #CCCCCC;font-size:9px;color:#888;text-align:center;">
  EcoVigil — Plateforme Africaine d'Actions et de Contrôle Environnemental
</div>
</div></body></html>`;
  const blob = new Blob(["﻿", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportRapportPDF(filename, title, rows, sections, options = {}) {
  if (!window.jspdf) { alert("Bibliothèque PDF indisponible (vérifie ta connexion)."); return; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", format: "a4" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const mx = 15, cw = W - mx * 2, bas = H - 16;
  const vert = [46, 90, 62], vertClair = [234, 242, 236], gris = [90, 90, 90];
  const labW = 46, valW = cw - labW - 4;
  let y = 0;

  function entetePremierePage() {
    try { doc.addImage(LOGO_DATA_URL, "PNG", mx, 10, 16, 16); } catch (er) { /* logo non critique */ }
    doc.setFont("helvetica", "bold"); doc.setFontSize(16); doc.setTextColor(...vert);
    doc.text(doc.splitTextToSize(title, cw - 22)[0], mx + 20, 17);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(60);
    if (options.sousTitre) doc.text(doc.splitTextToSize(options.sousTitre, cw - 22)[0], mx + 20, 22.5);
    doc.setFontSize(8.5); doc.setTextColor(120);
    doc.text(`Exporté le ${new Date().toLocaleString("fr-FR")} — ${rows.length} élément${rows.length > 1 ? "s" : ""}`, mx + 20, 27);
    doc.setDrawColor(...vert); doc.setLineWidth(0.9); doc.line(mx, 30, W - mx, 30);
    doc.setTextColor(0);
    y = 38;
  }
  function enteteCourt() {
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(120);
    doc.text(doc.splitTextToSize(title, cw)[0], mx, 12);
    doc.setDrawColor(200); doc.setLineWidth(0.3); doc.line(mx, 14, W - mx, 14);
    doc.setTextColor(0);
    y = 20;
  }
  function assurer(h, apres) {
    if (y + h <= bas) return;
    doc.addPage(); enteteCourt();
    if (apres) apres();
  }
  function barreCarte(i, suite) {
    const t = options.titreCarte ? options.titreCarte(rows[i]) : `Élément ${i + 1}`;
    const meta = options.metaCarte ? options.metaCarte(rows[i]) : "";
    doc.setFillColor(...vert); doc.rect(mx, y, cw, 8, "F");
    doc.setTextColor(255); doc.setFont("helvetica", "bold"); doc.setFontSize(10.5);
    const metaW = meta ? doc.getTextWidth(meta) * 0.8 + 8 : 0;
    doc.text(doc.splitTextToSize(`${i + 1}. ${t}${suite ? " (suite)" : ""}`, cw - 8 - metaW)[0], mx + 3, y + 5.5);
    if (meta) { doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.text(meta, W - mx - 3, y + 5.5, { align: "right" }); }
    doc.setTextColor(0);
    y += 8;
  }

  entetePremierePage();

  // Bloc de synthèse (jusqu'à 3 colonnes)
  const synthese = options.synthese || [];
  if (synthese.length) {
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.setTextColor(...vert);
    doc.text("Synthèse", mx, y); y += 5;
    const nbCol = Math.min(3, synthese.length), colW = cw / nbCol;
    for (let d = 0; d < synthese.length; d += nbCol) {
      const groupe = synthese.slice(d, d + nbCol);
      const hauteur = 7 + Math.max(...groupe.map(g => g.lignes.length)) * 4.6 + 3;
      assurer(hauteur);
      groupe.forEach((g, j) => {
        const x = mx + j * colW;
        doc.setFillColor(247, 250, 248); doc.setDrawColor(207, 220, 211); doc.setLineWidth(0.2);
        doc.rect(x, y, colW - 2, hauteur, "FD");
        doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...vert);
        doc.text(g.titre, x + 3, y + 5);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(30);
        g.lignes.forEach((l, k) => doc.text(doc.splitTextToSize(`${l[0]} : ${l[1]}`, colW - 8)[0], x + 3, y + 10 + k * 4.6));
      });
      y += hauteur + 3;
    }
    y += 4;
  }

  rows.forEach((r, i) => {
    const secs = sections.map(sec => ({ titre: sec.titre, champs: champsRenseignes(r, sec) })).filter(sec => sec.champs.length);
    const hauteurChamp = ([, v]) => Math.max(1, doc.splitTextToSize(v, valW).length) * 4.3 + 2.4;
    // la barre de titre ne reste jamais seule en bas de page : on exige la place du 1er champ
    const premier = secs.length ? 7 + hauteurChamp(secs[0].champs[0]) : 0;
    assurer(8 + premier);
    barreCarte(i, false);
    secs.forEach(sec => {
      assurer(7 + hauteurChamp(sec.champs[0]), () => barreCarte(i, true));
      doc.setFillColor(...vertClair); doc.rect(mx, y, cw, 6, "F");
      doc.setFont("helvetica", "bold"); doc.setFontSize(9); doc.setTextColor(...vert);
      doc.text(sec.titre, mx + 3, y + 4.2); y += 6;
      sec.champs.forEach(([lab, v]) => {
        const lignes = doc.splitTextToSize(v, valW);
        const h = hauteurChamp([lab, v]);
        assurer(h, () => barreCarte(i, true));
        doc.setFont("helvetica", "bold"); doc.setFontSize(8.5); doc.setTextColor(...gris);
        doc.text(doc.splitTextToSize(lab, labW - 2), mx + 3, y + 4);
        doc.setFont("helvetica", "normal"); doc.setFontSize(9); doc.setTextColor(25);
        doc.text(lignes, mx + labW + 2, y + 4);
        y += h;
        doc.setDrawColor(228); doc.setLineWidth(0.15); doc.line(mx, y, W - mx, y);
      });
    });
    y += 7;
  });

  // Pied de page : logo, nom et pagination sur chaque page
  const total = doc.internal.getNumberOfPages();
  for (let p = 1; p <= total; p++) {
    doc.setPage(p);
    try { doc.addImage(LOGO_DATA_URL, "PNG", mx, H - 12, 6, 6); } catch (er) {}
    doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(120);
    doc.text("EcoVigil — Plateforme Africaine d'Actions et de Contrôle Environnemental", mx + 8, H - 8);
    doc.text(`Page ${p} / ${total}`, W - mx, H - 8, { align: "right" });
    doc.setTextColor(0);
  }
  doc.save(filename);
}
