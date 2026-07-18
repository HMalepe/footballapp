import { defineConfig } from 'vitest/config'

// Test-only config, kept separate from vite.config.ts so the app build's
// type-check doesn't pull in vitest's bundled Vite types. Tests are plain
// .ts (no JSX), so the React plugin isn't needed here.
export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
})
