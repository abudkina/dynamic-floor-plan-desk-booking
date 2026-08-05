import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Базовый путь для GitHub Pages: /<имя-репозитория>/ */
const githubPagesBase = '/dynamic-floor-plan-desk-booking/';

export default defineConfig({
  base: process.env.GITHUB_PAGES === '1' ? githubPagesBase : '/',
  plugins: [react()],
  worker: {
    format: 'es',
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
  },
});
