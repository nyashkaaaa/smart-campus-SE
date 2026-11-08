import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

// Reuses vite.config.ts, so the "@/..." alias and the React plugin are the same as in the app.
export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      css: false,
    },
  })
);
