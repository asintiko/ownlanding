import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
export default defineConfig([...nextVitals, ...nextTs, globalIgnores(['.next*/**', 'dist/**', 'src/payload-types.ts', 'src/app/(payload)/admin/importMap.js', 'studio/**', 'vite.config.js', 'src/components/studio/**', 'src/context/**', 'src/screens/**', 'src/hooks/**', 'src/App.jsx', 'src/main.jsx'])]);
