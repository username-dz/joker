import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables based on mode

  return {
    server: {
      host: true,
    },
    define: {
      // Make environment mode available in the app
      "import.meta.env.MODE": JSON.stringify(mode),
    },

    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["/*"],
        manifest: {
          name: "Joker Graphics",
          short_name: "Joker",
          description: "Joker Graphics - Creative Designs",
          theme_color: "#ffffff",
          background_color: "#ffffff",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "/favicon-assets/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/favicon-assets/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/favicon-assets/pwa-maskable-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "maskable",
            },
            {
              src: "/favicon-assets/pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
      }),
    ],
  };
});
