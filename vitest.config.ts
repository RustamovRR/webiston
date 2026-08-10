import { defineConfig } from "vitest/config"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/**/*.test.{ts,tsx}",
      "packages/**/*.test.{ts,tsx}",
      "packages/**/__tests__/*.{ts,tsx}",
      // The extension had no tests at all while being prepared for the Chrome
      // Web Store. `pnpm typecheck` cannot cover it either (tsconfig.json:27),
      // so before this line nothing in the repo-wide gate looked at it.
      "apps/**/*.test.{ts,tsx}"
    ],
    exclude: ["node_modules", ".next", "dist"],
    server: {
      // next-intl has to go through Vite rather than Node's resolver, or the
      // alias below never applies to it — Node loads externalised packages
      // itself and fails on their extensionless `next/navigation` import.
      deps: { inline: ["next-intl"] }
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        ".next/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/index.ts"
      ]
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // next-intl's client barrel imports "next/navigation" without the
      // extension. Next's own bundler resolves that; Node ESM under Vitest
      // does not, and the whole module graph fails to load before a single
      // test runs. Pointing at the real file is the smallest fix that lets a
      // component using `useTranslations` be rendered in a test at all.
      "next/navigation": path.resolve(__dirname, "./node_modules/next/navigation.js")
    }
  }
})
