import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { qwikInsights, qwikTypes } from "@builder.io/qwik-labs/vite";

export default defineConfig((): UserConfig => {
  return {
    plugins: [
      qwikInsights({ publicApiKey: "1v0qw1g5lfb" }),
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
      qwikTypes(),
    ],
    server: {
      headers: {
        "Cache-Control": "public, max-age=0",
      },
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600",
      },
    },
  };
});
