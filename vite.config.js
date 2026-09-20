import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { localStudio } from './studio/vite-plugin-studio.js';
import { readContentSnapshot } from './studio/database.js';

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), localStudio({ projectRoot })],
  define: {
    // Content is baked into the bundle at build time, so a published build shows
    // the studio's saved content. In dev the page also refreshes it live.
    __SITE_CONTENT__: JSON.stringify(readContentSnapshot(projectRoot)),
  },
  server: {
    host: '127.0.0.1',
  },
});
