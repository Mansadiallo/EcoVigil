import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Le site est servi sur https://mansadiallo.github.io/EcoVigil/ (un sous-dossier, pas la racine
// du domaine) : "base" doit correspondre exactement au nom du dépôt GitHub, sinon les fichiers
// JS/CSS générés par le build seront cherchés au mauvais endroit et la page restera blanche.
export default defineConfig({
  plugins: [react()],
  base: "/EcoVigil/",
  build: {
    outDir: "dist",
  },
});
