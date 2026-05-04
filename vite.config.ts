/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// GitHub Pages serves project sites at https://<user>.github.io/<repo>/.
// Set base to that path in production; '/' in dev.
// Override with VITE_BASE env var if you fork/rename.
const base = process.env.VITE_BASE ?? (process.env.NODE_ENV === 'production' ? '/traveller-lifepath/' : '/');

export default defineConfig({
  base,
  plugins: [react()],
  build: { outDir: 'dist', sourcemap: true },
  test: {
    // Use jsdom for component tests; engine/data tests opt into 'node' via inline @vitest-environment.
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['./src/test/setup.ts'],
  },
});
