/// <reference types="vitest/config" />
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import babel from '@rolldown/plugin-babel';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  server: {
    proxy: {
      // Send /api requests to the API. xfwd adds the X-Forwarded-* headers,
      // so the API sees the visitor's IP like it does behind nginx in Docker.
      '/api': { target: 'http://localhost:3000', xfwd: true },
    },
  },
  test: {
    environment: 'jsdom', // a fake browser, so components can render in Node
    setupFiles: ['./src/test-setup.ts'],
  },
});
