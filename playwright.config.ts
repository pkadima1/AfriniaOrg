/**
 * playwright.config.ts — browser tests (`npm run test:e2e`).
 * Target: E2E_BASE_URL (a Netlify draft deploy or production — read-only
 * flows only), or by default the local production build on port 3100
 * (`npm run build` first; Playwright starts `next start` itself).
 * Uses the installed Google Chrome (no browser download).
 */
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3100';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  retries: 1,
  reporter: [['list']],
  use: { baseURL, channel: 'chrome', locale: 'fr-FR' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'mobile-375', use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 375, height: 812 } } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: 'npx next start -p 3100', url: 'http://localhost:3100', reuseExistingServer: true, timeout: 60_000 },
});
