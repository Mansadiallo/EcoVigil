import { Component } from "react";
import { Screen } from "./ui.jsx";
import { T } from "../lib/typo.jsx";

const MESSAGES = {
  fr: { charge: "Chargement…", erreur: "Cet écran n'a pas pu être chargé (réseau indisponible ?).", recharger: "Recharger" },
  en: { charge: "Loading…", erreur: "This screen could not be loaded (network unavailable?).", recharger: "Reload" },
  pt: { charge: "A carregar…", erreur: "Não foi possível carregar este ecrã (sem rede?).", recharger: "Recarregar" },
  es: { charge: "Cargando…", erreur: "No se pudo cargar esta pantalla (¿sin red?).", recharger: "Recargar" },
};
function messages() {
  let l = "fr";
  try { l = localStorage.getItem("pace-lang") || "fr"; } catch (e) {}
  return MESSAGES[l] || MESSAGES.fr;
}

/* Affiché le temps que le code d'un écran (chargé à la demande) arrive. */
export function EcranChargement() {
  return (
    <Screen>
      <div role="status" style={{ textAlign: "center", padding: "60px 0", color: "var(--c-text-muted)", fontSize: T.body }}>{messages().charge}</div>
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
        <div style={{ textAlign: "center", padding: "50px 16px", color: "var(--c-text)", fontSize: T.body, lineHeight: 1.5 }}>
          <div style={{ marginBottom: 14 }}>{m.erreur}</div>
          <button onClick={() => window.location.reload()} style={{ padding: "10px 18px", borderRadius: 10, border: "none", background: "var(--c-accent-dark)", color: "#fff", fontWeight: 600, cursor: "pointer" }}>{m.recharger}</button>
        </div>
      </Screen>
    );
  }
}
