import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolve the "@/..." imports from tsconfig.json
    tsconfigPaths: true,
  },
  test: {
    // Unit tests for plain functions — no browser environment needed
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
