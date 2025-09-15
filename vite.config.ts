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
      hmr: {
        overlay: false
      },
      proxy: {
        "/hume": {
          target: "https://api.hume.ai",
          changeOrigin: true,
          secure: true,
          timeout: 30000,
          rewrite: (path) => path.replace(/^\/hume/, ""),
          configure: (proxy) => {
            // Attach API key header for all proxied requests
            proxy.on("proxyReq", (proxyReq) => {
              if (env.VITE_HUME_API_KEY) {
                proxyReq.setHeader("X-Hume-Api-Key", env.VITE_HUME_API_KEY);
              }
            });
            proxy.on("error", (err, req, res) => {
              console.error("Hume proxy error:", err);
            });
          },
        },
        "/assemblyai": {
          target: "https://api.assemblyai.com",
          changeOrigin: true,
          secure: true,
          timeout: 30000,
          rewrite: (path) => path.replace(/^\/assemblyai/, "/v2"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq, req) => {
              if (env.VITE_ASSEMBLYAI_API_KEY) {
                proxyReq.setHeader("Authorization", env.VITE_ASSEMBLYAI_API_KEY);
              }
              // Remove any existing authorization header from client
              proxyReq.removeHeader("authorization");
              console.log("AssemblyAI proxy request:", {
                method: proxyReq.method,
                path: proxyReq.path,
                headers: proxyReq.getHeaders()
              });
            });
            proxy.on("error", (err, req, res) => {
              console.error("AssemblyAI proxy error:", err);
            });
          },
        },
        "/acr": {
          target: "https://identify-us-west-2.acrcloud.com",
          changeOrigin: true,
          secure: true,
          timeout: 30000,
          rewrite: (path) => path.replace(/^\/acr/, ""),
          configure: (proxy) => {
            proxy.on("error", (err, req, res) => {
              console.error("ACRCloud proxy error:", err);
            });
          },
        },
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      global: 'globalThis',
    },
  };
});
