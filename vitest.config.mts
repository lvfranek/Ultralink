import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Resolve the "@/..." imports from tsconfig.json
    tsconfigPaths: true,
  },
  test: {
    // Plain-logic tests run in Node; component tests opt into a simulated
    // browser with a `// @vitest-environment jsdom` comment at the top.
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
