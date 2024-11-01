import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // The proxy target server. Requests to /api will be forwarded to http://localhost:5000.
    // For instance, a request to /api/users will actually go to http://localhost:5000/api/users.
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
