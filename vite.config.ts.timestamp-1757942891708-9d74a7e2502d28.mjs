// vite.config.ts
import { defineConfig } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///home/project/node_modules/lovable-tagger/dist/index.js";
import { loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
var __vite_injected_original_dirname = "/home/project";
var vite_config_default = defineConfig(({ mode }) => {
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
          rewrite: (path2) => path2.replace(/^\/hume/, ""),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (env.VITE_HUME_API_KEY) {
                proxyReq.setHeader("X-Hume-Api-Key", env.VITE_HUME_API_KEY);
              }
            });
          }
        },
        "/assemblyai": {
          target: "https://api.assemblyai.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path2) => path2.replace(/^\/assemblyai/, "/v2"),
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              if (env.VITE_ASSEMBLYAI_API_KEY) {
                proxyReq.setHeader("authorization", env.VITE_ASSEMBLYAI_API_KEY);
              }
            });
          }
        },
        "/acr": {
          target: "https://identify-us-west-2.acrcloud.com",
          changeOrigin: true,
          secure: true,
          rewrite: (path2) => path2.replace(/^\/acr/, "")
        }
      }
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__vite_injected_original_dirname, "./src")
      }
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9ob21lL3Byb2plY3Qvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHJlYWN0IGZyb20gXCJAdml0ZWpzL3BsdWdpbi1yZWFjdC1zd2NcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcbmltcG9ydCB7IGxvYWRFbnYgfSBmcm9tIFwidml0ZVwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4ge1xuICBjb25zdCBlbnYgPSBsb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCksIFwiXCIpO1xuXG4gIHJldHVybiB7XG4gICAgc2VydmVyOiB7XG4gICAgICBob3N0OiBcIjo6XCIsXG4gICAgICBwb3J0OiA4MDgwLFxuICAgICAgcHJveHk6IHtcbiAgICAgICAgXCIvaHVtZVwiOiB7XG4gICAgICAgICAgdGFyZ2V0OiBcImh0dHBzOi8vYXBpLmh1bWUuYWlcIixcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiB0cnVlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9odW1lLywgXCJcIiksXG4gICAgICAgICAgY29uZmlndXJlOiAocHJveHkpID0+IHtcbiAgICAgICAgICAgIC8vIEF0dGFjaCBBUEkga2V5IGhlYWRlciBmb3IgYWxsIHByb3hpZWQgcmVxdWVzdHNcbiAgICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXFcIiwgKHByb3h5UmVxKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlbnYuVklURV9IVU1FX0FQSV9LRVkpIHtcbiAgICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoXCJYLUh1bWUtQXBpLUtleVwiLCBlbnYuVklURV9IVU1FX0FQSV9LRVkpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBcIi9hc3NlbWJseWFpXCI6IHtcbiAgICAgICAgICB0YXJnZXQ6IFwiaHR0cHM6Ly9hcGkuYXNzZW1ibHlhaS5jb21cIixcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXG4gICAgICAgICAgc2VjdXJlOiB0cnVlLFxuICAgICAgICAgIHJld3JpdGU6IChwYXRoKSA9PiBwYXRoLnJlcGxhY2UoL15cXC9hc3NlbWJseWFpLywgXCIvdjJcIiksXG4gICAgICAgICAgY29uZmlndXJlOiAocHJveHkpID0+IHtcbiAgICAgICAgICAgIHByb3h5Lm9uKFwicHJveHlSZXFcIiwgKHByb3h5UmVxKSA9PiB7XG4gICAgICAgICAgICAgIGlmIChlbnYuVklURV9BU1NFTUJMWUFJX0FQSV9LRVkpIHtcbiAgICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoXCJhdXRob3JpemF0aW9uXCIsIGVudi5WSVRFX0FTU0VNQkxZQUlfQVBJX0tFWSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIFwiL2FjclwiOiB7XG4gICAgICAgICAgdGFyZ2V0OiBcImh0dHBzOi8vaWRlbnRpZnktdXMtd2VzdC0yLmFjcmNsb3VkLmNvbVwiLFxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgICBzZWN1cmU6IHRydWUsXG4gICAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2Fjci8sIFwiXCIpLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHBsdWdpbnM6IFtyZWFjdCgpLCBtb2RlID09PSBcImRldmVsb3BtZW50XCIgJiYgY29tcG9uZW50VGFnZ2VyKCldLmZpbHRlcihCb29sZWFuKSxcbiAgICByZXNvbHZlOiB7XG4gICAgICBhbGlhczoge1xuICAgICAgICBcIkBcIjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF5TixTQUFTLG9CQUFvQjtBQUN0UCxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsdUJBQXVCO0FBQ2hDLFNBQVMsZUFBZTtBQUp4QixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN4QyxRQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsSUFBSSxHQUFHLEVBQUU7QUFFM0MsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sTUFBTTtBQUFBLE1BQ04sT0FBTztBQUFBLFFBQ0wsU0FBUztBQUFBLFVBQ1AsUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFVBQ1IsU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsV0FBVyxFQUFFO0FBQUEsVUFDN0MsV0FBVyxDQUFDLFVBQVU7QUFFcEIsa0JBQU0sR0FBRyxZQUFZLENBQUMsYUFBYTtBQUNqQyxrQkFBSSxJQUFJLG1CQUFtQjtBQUN6Qix5QkFBUyxVQUFVLGtCQUFrQixJQUFJLGlCQUFpQjtBQUFBLGNBQzVEO0FBQUEsWUFDRixDQUFDO0FBQUEsVUFDSDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLGVBQWU7QUFBQSxVQUNiLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLGlCQUFpQixLQUFLO0FBQUEsVUFDdEQsV0FBVyxDQUFDLFVBQVU7QUFDcEIsa0JBQU0sR0FBRyxZQUFZLENBQUMsYUFBYTtBQUNqQyxrQkFBSSxJQUFJLHlCQUF5QjtBQUMvQix5QkFBUyxVQUFVLGlCQUFpQixJQUFJLHVCQUF1QjtBQUFBLGNBQ2pFO0FBQUEsWUFDRixDQUFDO0FBQUEsVUFDSDtBQUFBLFFBQ0Y7QUFBQSxRQUNBLFFBQVE7QUFBQSxVQUNOLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLFNBQVMsQ0FBQ0EsVUFBU0EsTUFBSyxRQUFRLFVBQVUsRUFBRTtBQUFBLFFBQzlDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFNBQVMsQ0FBQyxNQUFNLEdBQUcsU0FBUyxpQkFBaUIsZ0JBQWdCLENBQUMsRUFBRSxPQUFPLE9BQU87QUFBQSxJQUM5RSxTQUFTO0FBQUEsTUFDUCxPQUFPO0FBQUEsUUFDTCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsTUFDdEM7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInBhdGgiXQp9Cg==
