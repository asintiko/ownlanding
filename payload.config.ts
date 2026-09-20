import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { ru } from '@payloadcms/translations/languages/ru';
import { en } from '@payloadcms/translations/languages/en';
import sharp from 'sharp';
import { Users } from './src/collections/Users';
import { Media } from './src/collections/Media';
import { Site } from './src/globals/Site';
import { importProfileMedia } from './scripts/import-profile-media';
import { readLegacyContent } from './scripts/legacy-content';
import { contentToGlobal } from './src/lib/payload-content.js';
mkdirSync(path.resolve(process.cwd(), 'data'), { recursive: true });
const secret = process.env.PAYLOAD_SECRET;
if (!secret || secret.length < 32) throw new Error('Set PAYLOAD_SECRET to a random value of at least 32 characters in .env');
export default buildConfig({
  secret,
  admin: { user: 'users', importMap: { baseDir: path.resolve(process.cwd(), 'src') }, meta: { titleSuffix: '— Katy Delma Studio' }, components: { views: { dashboard: { Component: '/components/payload/Dashboard#Dashboard' } } } },
  i18n: { supportedLanguages: { ru, en }, fallbackLanguage: 'ru' },
  collections: [Users, Media], globals: [Site], sharp,
  db: sqliteAdapter({ busyTimeout: 5000, wal: true, client: { url: process.env.DATABASE_URI || 'file:./data/payload.db' }, migrationDir: path.resolve(process.cwd(), 'src/migrations') }),
  typescript: { outputFile: path.resolve(process.cwd(), 'src/payload-types.ts') },
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  onInit: async (payload) => {
    const existing = await payload.findGlobal({ slug: 'site', depth: 0 });
    if (!existing.createdAt) {
      const content = contentToGlobal(readLegacyContent());
      const profile = await importProfileMedia(payload, content.profile);
      await payload.updateGlobal({ slug: 'site', data: { ...content, profile, _status: 'published' }, draft: false });
      payload.logger.info('Imported site content into Payload; original studio database is unchanged.');
    }
  },
});
