import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// En ligne (GitHub Pages), le site vit dans /cactus-informatique/ : gardez le même nom que votre dépôt.
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/cactus-informatique/" : "/",
  plugins: [react()],
}));
