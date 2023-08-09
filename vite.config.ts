import { defineConfig } from "vite";

export default defineConfig({
  server: {
    host: true,
  },
  base: "/matterjs-air-hockey/",
  build: {
    target: "esnext",
  },
});
