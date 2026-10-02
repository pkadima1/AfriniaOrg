/**
 * Integration tests (`npm run test:integration`): the server content readers
 * against the local Firestore + Storage emulators with the real rules loaded
 * (project demo-afrinia — no production access). Run through
 * `firebase emulators:exec`, which sets FIRESTORE_EMULATOR_HOST etc.
 * Same aliases as vitest.config.ts; the file list REPLACES the unit one
 * (mergeConfig would concatenate it).
 */
import { defineConfig } from 'vitest/config';
import base from './vitest.config';

export default defineConfig({
  ...base,
  test: {
    ...base.test,
    include: ['tests/integration/**/*.test.ts'],
    fileParallelism: false,
  },
});
