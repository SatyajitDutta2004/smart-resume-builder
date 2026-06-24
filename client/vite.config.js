import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: false,
    open: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:4001",
        changeOrigin: true,
        rewrite: (path) => path,
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            const parts = id
              .toString()
              .split(/[/\\]node_modules[/\\]/)
              .pop()
              .split(/[/\\]/);
            let pkgName = parts[0];
            if (pkgName.startsWith("@") && parts.length > 1) {
              pkgName = `${pkgName}/${parts[1]}`;
            }
            return `vendor-${pkgName.replace("@", "").replace("/", "-")}`;
          }
        },
      },
    },
  },
});
