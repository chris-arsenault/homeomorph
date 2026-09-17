import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";
import { validateCampaign } from "./src/content/validateEncounters";

export default defineConfig({
  base: "./",
  server: {
    host: "0.0.0.0",
    port: 26003,
    strictPort: true,
  },
  plugins: [
    react(),
    {
      name: "validate-authored-campaign",
      buildStart() {
        const errors = validateCampaign();
        if (errors.length) throw new Error(errors.join("\n"));
      },
    },
  ],
  test: {
    environment: "happy-dom",
  },
});
