import { Component } from "react";
import { Screen } from "./ui.jsx";
import { langCourante, t } from "../lib/i18n.js";

function messages() {
  const L = langCourante();
  return { charge: t(L, "chargement"), erreur: t(L, "ecran_erreur"), recharger: t(L, "recharger") };
}

/* Affiché le temps que le code d'un écran (chargé à la demande) arrive. */
export function EcranChargement() {
  return (
    <Screen>
      <div role="status" style={{ textAlign: "center", padding: "60px 0", color: "var(--c-text-muted)", fontSize: 13 }}>{messages().charge}</div>
    </Screen>
  );
}

/* Évite l'écran blanc si un écran ne peut pas être chargé (hors ligne, nouvelle version déployée entre-temps)
   ou plante à l'affichage : message + bouton pour recharger. Changer d'onglet réinitialise le garde-fou (via key). */
export class BoundaireErreur extends Component {
  constructor(props) { super(props); this.state = { erreur: false }; }
  static getDerivedStateFromError() { return { erreur: true }; }
  componentDidCatch(e) { console.error("Écran non chargé :", e); }
  render() {
    if (!this.state.erreur) return this.props.children;
    const m = messages();
    return (
      <Screen>
        <div style={{ textAlign: "center", padding: "50px 16px", color: "var(--c-text)", fontSize: 13.5, lineHeight: 1.5 }}>
          <div style={{ marginBottom: 14 }}>{m.erreur}</div>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>{m.recharger}</button>
        </div>
      </Screen>
    );
  }
}
