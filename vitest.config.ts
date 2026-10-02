/**
 * vitest.config.ts — unit tests (`npm test`). TypeScript and the `@/` import
 * alias work as in the app. Firestore/Storage rule tests are separate
 * (`npm run test:rules`, emulator) and browser tests use Playwright.
 */
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // `server-only` throws outside a Next.js server build; tests run server
      // modules directly (the build still enforces the real guard).
      'server-only': fileURLToPath(new URL('./tests/stubs/server-only.ts', import.meta.url)),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.{js,ts}', 'src/**/*.test.ts'],
  },
});
