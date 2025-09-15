import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { loadEnv } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        "/hume": {
          target: "https://api.hume.ai",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/hume/, ""),
          configure: (proxy) => {
            // Attach API key header for all proxied requests
            proxy.on("proxyReq", (proxyReq) => {
              if (env.VITE_HUME_API_KEY) {
                proxyReq.setHeader("X-Hume-Api-Key", env.VITE_HUME_API_KEY);
              }
            });
          },
        },
        "/acr": {
          target: "https://identify-us-west-2.acrcloud.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/acr/, ""),
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
