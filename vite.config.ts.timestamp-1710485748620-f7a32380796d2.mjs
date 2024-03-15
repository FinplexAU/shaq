// vite.config.ts
import { defineConfig } from "file:///home/eamon/programming/finplex/shaq/node_modules/.pnpm/vite@5.0.12_@types+node@20.11.6/node_modules/vite/dist/node/index.js";
import { qwikVite } from "file:///home/eamon/programming/finplex/shaq/node_modules/.pnpm/@builder.io+qwik@1.4.5_@types+node@20.11.6_undici@5.22.0/node_modules/@builder.io/qwik/optimizer.mjs";
import { qwikCity } from "file:///home/eamon/programming/finplex/shaq/node_modules/.pnpm/@builder.io+qwik-city@1.4.5_@types+node@20.11.6/node_modules/@builder.io/qwik-city/vite/index.mjs";
import tsconfigPaths from "file:///home/eamon/programming/finplex/shaq/node_modules/.pnpm/vite-tsconfig-paths@4.2.1_typescript@5.3.3_vite@5.0.12/node_modules/vite-tsconfig-paths/dist/index.mjs";
import { qwikInsights, qwikTypes } from "file:///home/eamon/programming/finplex/shaq/node_modules/.pnpm/github.com+BuilderIo+qwik-labs-build@635e08da77577c5a4c78603cda74625fc47429f6_pmjouacjd6emwdsopkwglref24/node_modules/@builder.io/qwik-labs/vite/index.js";
var vite_config_default = defineConfig(() => {
  return {
    plugins: [
      qwikInsights({ publicApiKey: "1v0qw1g5lfb" }),
      qwikCity(),
      qwikVite(),
      tsconfigPaths(),
      qwikTypes()
    ],
    server: {
      headers: {
        "Cache-Control": "public, max-age=0"
      }
    },
    preview: {
      headers: {
        "Cache-Control": "public, max-age=600"
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9lYW1vbi9wcm9ncmFtbWluZy9maW5wbGV4L3NoYXFcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL2VhbW9uL3Byb2dyYW1taW5nL2ZpbnBsZXgvc2hhcS92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9lYW1vbi9wcm9ncmFtbWluZy9maW5wbGV4L3NoYXEvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIHR5cGUgVXNlckNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgeyBxd2lrVml0ZSB9IGZyb20gXCJAYnVpbGRlci5pby9xd2lrL29wdGltaXplclwiO1xuaW1wb3J0IHsgcXdpa0NpdHkgfSBmcm9tIFwiQGJ1aWxkZXIuaW8vcXdpay1jaXR5L3ZpdGVcIjtcbmltcG9ydCB0c2NvbmZpZ1BhdGhzIGZyb20gXCJ2aXRlLXRzY29uZmlnLXBhdGhzXCI7XG5pbXBvcnQgeyBxd2lrSW5zaWdodHMsIHF3aWtUeXBlcyB9IGZyb20gXCJAYnVpbGRlci5pby9xd2lrLWxhYnMvdml0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKCk6IFVzZXJDb25maWcgPT4ge1xuICByZXR1cm4ge1xuICAgIHBsdWdpbnM6IFtcbiAgICAgIHF3aWtJbnNpZ2h0cyh7IHB1YmxpY0FwaUtleTogXCIxdjBxdzFnNWxmYlwiIH0pLFxuICAgICAgcXdpa0NpdHkoKSxcbiAgICAgIHF3aWtWaXRlKCksXG4gICAgICB0c2NvbmZpZ1BhdGhzKCksXG4gICAgICBxd2lrVHlwZXMoKSxcbiAgICBdLFxuICAgIHNlcnZlcjoge1xuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIkNhY2hlLUNvbnRyb2xcIjogXCJwdWJsaWMsIG1heC1hZ2U9MFwiLFxuICAgICAgfSxcbiAgICB9LFxuICAgIHByZXZpZXc6IHtcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgXCJDYWNoZS1Db250cm9sXCI6IFwicHVibGljLCBtYXgtYWdlPTYwMFwiLFxuICAgICAgfSxcbiAgICB9LFxuICB9O1xufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThSLFNBQVMsb0JBQXFDO0FBQzVVLFNBQVMsZ0JBQWdCO0FBQ3pCLFNBQVMsZ0JBQWdCO0FBQ3pCLE9BQU8sbUJBQW1CO0FBQzFCLFNBQVMsY0FBYyxpQkFBaUI7QUFFeEMsSUFBTyxzQkFBUSxhQUFhLE1BQWtCO0FBQzVDLFNBQU87QUFBQSxJQUNMLFNBQVM7QUFBQSxNQUNQLGFBQWEsRUFBRSxjQUFjLGNBQWMsQ0FBQztBQUFBLE1BQzVDLFNBQVM7QUFBQSxNQUNULFNBQVM7QUFBQSxNQUNULGNBQWM7QUFBQSxNQUNkLFVBQVU7QUFBQSxJQUNaO0FBQUEsSUFDQSxRQUFRO0FBQUEsTUFDTixTQUFTO0FBQUEsUUFDUCxpQkFBaUI7QUFBQSxNQUNuQjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVM7QUFBQSxNQUNQLFNBQVM7QUFBQSxRQUNQLGlCQUFpQjtBQUFBLE1BQ25CO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
