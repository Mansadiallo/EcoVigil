import { LOGO_DATA_URL } from "../imagesData.js";
import { langCourante, localeDe, t, tf } from "./i18n.js";

// Langues écrites de droite à gauche (doit rester cohérent avec RTL_LANGS de i18n.js).
const estRTL = (L) => L === "ar";
const dateExport = (L) => new Date().toLocaleString(localeDe(L));
const nbLignes = (L, n) => tf(L, n > 1 ? "exp_ligne_n" : "exp_ligne_1", { n });
const nbElements = (L, n) => tf(L, n > 1 ? "exp_element_n" : "exp_element_1", { n });

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
export function exportExcel(filename, rows, columns, title) {
  const L = langCourante();
  if (!window.XLSX) { alert(t(L, "exp_excel_indispo")); return; }
  // Note technique : l'intégration d'une image réelle et la mise en forme des cellules (gras,
  // couleur) sont des fonctionnalités payantes de SheetJS Pro. La version gratuite utilisée ici
  // ne les supporte pas — même en fixant ws[cellule].s, rien ne s'appliquerait silencieusement.
  // On identifie donc le rapport par des lignes d'en-tête texte "ECOVIGIL" à la place.
  const aoa = [
    ["ECOVIGIL"],
    [title || t(L, "exp_rapport")],
    [`${t(L, "exp_exporte_le")} ${dateExport(L)}`],
    [],
    columns.map(c => c.label),
    ...rows.map(r => columns.map(c => celluleTexte(r[c.key]))),
    [],
    [`EcoVigil — ${t(L, "plateforme_desc")} — ${nbLignes(L, rows.length)}`],
  ];
  const ligneEntete = 4; // index (0-based) de la ligne des libellés de colonnes dans aoa
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: Math.max(columns.length - 1, 0) } }];
  ws["!cols"] = columns.map(() => ({ wch: 18 }));
  // Mise en page : gèle les lignes d'en-tête (titre + libellés de colonnes) pour qu'elles
  // restent visibles en défilant, répète la ligne de libellés sur chaque page imprimée, et
  // passe en paysage (plus lisible pour des tableaux à nombreuses colonnes). Ces trois
  // propriétés sont documentées comme supportées par la version gratuite de SheetJS
  // (contrairement au style de cellule et aux images, qui ne le sont pas).
  ws["!freeze"] = { xSplit: "0", ySplit: String(ligneEntete + 1), topLeftCell: `A${ligneEntete + 2}`, activePane: "bottomLeft", state: "frozen" };
  ws["!printHeader"] = [ligneEntete + 1, ligneEntete + 1];
  ws["!pageSetup"] = { orientation: "landscape", scale: 100, fitToWidth: 1 };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, t(L, "exp_feuille"));
  if (estRTL(L)) wb.Workbook = { Views: [{ RTL: true }] }; // feuille affichée de droite à gauche
  XLSX.writeFile(wb, filename);
}

// --- Export Word : document HTML avec les espaces de noms Office, ouvert nativement par
// Word (technique standard, sans dépendance supplémentaire, fiable depuis Office 97). ---
// Génère, pour Word/PDF (documents narratifs), une "fiche" par ligne : chaque champ est présenté
// comme un intitulé suivi de son explication, empilés verticalement — pas de grille de tableau,
// contrairement à Excel/CSV qui restent au format tabulaire (adapté au traitement de données).
function construireHtmlFiches(title, rows, columns, L) {
  const rtl = estRTL(L);
  const echapper = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const fiches = rows.map((r, idx) => {
    const champs = columns.map(c => `
      <p style="margin:2px 0 7px 0;line-height:1.4;">
        <span style="font-weight:bold;color:#2E5A3E;">${echapper(c.label)} : </span><span>${echapper(celluleTexte(r[c.key]) || "—")}</span>
      </p>`).join("");
    return `
      <div style="margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid #ccc;">
        <div style="font-weight:bold;font-size:13px;color:#2E5A3E;margin-bottom:6px;">${echapper(tf(L, "exp_element_titre", { i: idx + 1 }))}</div>
        ${champs}
      </div>`;
  }).join("");
  // Mise en page réelle : format A4 portrait avec marges, via la syntaxe @page propre à Office
  // (identique à ce que Word génère lui-même) — orientation portrait plus adaptée à un document
  // narratif (paragraphes) qu'à un tableau large.
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40" lang="${L}" dir="${rtl ? "rtl" : "ltr"}">
<head>
<meta charset="utf-8" />
<title>${echapper(title)}</title>
<style>
  @page Section1 { size: 21.0cm 29.7cm; mso-page-orientation: portrait; margin: 2cm 2cm 2cm 2cm; }
  div.Section1 { page: Section1; }
</style>
</head>
<body style="font-family:Calibri,Arial,sans-serif;font-size:11px;direction:${rtl ? "rtl" : "ltr"};">
<div class="Section1" dir="${rtl ? "rtl" : "ltr"}">
<table style="border:none;margin-bottom:18px;"><tr>
  <td style="border:none;padding:0;"><img src="${LOGO_DATA_URL}" width="48" height="48" alt="EcoVigil" /></td>
  <td style="border:none;padding:0 ${rtl ? "0 0 10px" : "0 0 10px"};vertical-align:middle;">
    <div style="font-size:18px;font-weight:bold;color:#2E5A3E;">${echapper(title)}</div>
    <div style="font-size:10px;color:#666;">${echapper(t(L, "exp_exporte_le"))} ${echapper(dateExport(L))} — EcoVigil — ${echapper(nbElements(L, rows.length))}</div>
  </td>
</tr></table>
${fiches}
<div style="margin-top:16px;padding-top:8px;border-top:1px solid #ccc;font-size:9px;color:#888;text-align:center;">
  EcoVigil — ${echapper(t(L, "plateforme_desc"))}
</div>
</div>
</body></html>`;
}

export function exportWord(filename, title, rows, columns) {
  const L = langCourante();
  const html = construireHtmlFiches(title, rows, columns, L);
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// --- Export PDF (via jsPDF, déjà chargé en CDN) — même logique narrative que exportWord ---
export function exportPDF(filename, title, rows, columns) {
  const L = langCourante();
  // L'arabe n'est pas supporté par les polices intégrées de jsPDF (les lettres s'afficheraient
  // brouillées) : on passe par la mise en page du navigateur, qui gère l'arabe et le sens de lecture.
  // L'utilisateur choisit alors « Enregistrer au format PDF » dans la fenêtre d'impression.
  if (estRTL(L)) {
    const w = window.open("", "_blank");
    if (!w) { alert(t(L, "exp_popup_bloque")); return; }
    w.document.write(construireHtmlFiches(title, rows, columns, L));
    w.document.close();
    setTimeout(() => { try { w.focus(); w.print(); } catch (e) {} }, 500);
    return;
  }
  if (!window.jspdf) { alert(t(L, "exp_pdf_indispo")); return; }
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
    doc.text(`${t(L, "exp_exporte_le")} ${dateExport(L)} — EcoVigil — ${nbElements(L, rows.length)}`, marginX + 16, 21);
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
    doc.text(tf(L, "exp_element_titre", { i: idx + 1 }), marginX, y);
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
    doc.text(tf(L, "exp_page_fmt", { p, n: totalPages }), pageW - marginX, pageH - 8, { align: "right" });
    doc.setTextColor(0);
  }

  doc.save(filename);
}
