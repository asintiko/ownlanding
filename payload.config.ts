import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { buildConfig } from 'payload';
import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';
import { ru } from '@payloadcms/translations/languages/ru';
import { en } from '@payloadcms/translations/languages/en';
import sharp from 'sharp';
import { Users } from './src/collections/Users';
import { Media } from './src/collections/Media';
import { Site } from './src/globals/Site';
import { importProfileMedia } from './scripts/import-profile-media';
import { readLegacyContent } from './scripts/legacy-content';
import { contentToGlobal } from './src/lib/payload-content.js';
const databaseURI = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URI || 'file:./data/payload.db';
const remoteDatabase = !databaseURI.startsWith('file:');
const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
if (process.env.VERCEL && (!remoteDatabase || !blobToken)) {
  throw new Error('Vercel requires DATABASE_URI for Turso and BLOB_READ_WRITE_TOKEN');
}
if (remoteDatabase && !(process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN)) throw new Error('Set DATABASE_AUTH_TOKEN for Turso');
if (!remoteDatabase) mkdirSync(path.resolve(process.cwd(), 'data'), { recursive: true });
const secret = process.env.PAYLOAD_SECRET;
if (!secret || secret.length < 32) throw new Error('Set PAYLOAD_SECRET to a random value of at least 32 characters in .env');
export default buildConfig({
  secret,
  admin: { user: 'users', importMap: { baseDir: path.resolve(process.cwd(), 'src') }, meta: { titleSuffix: '— Katy Delma Studio' }, components: { views: { dashboard: { Component: '/components/payload/Dashboard#Dashboard' } } } },
  i18n: { supportedLanguages: { ru, en }, fallbackLanguage: 'ru' },
  collections: [Users, Media], globals: [Site], sharp,
  plugins: [vercelBlobStorage({ enabled: Boolean(blobToken), token: blobToken || '', alwaysInsertFields: true, collections: { media: true }, clientUploads: true })],
  db: sqliteAdapter({ push: remoteDatabase ? false : undefined, busyTimeout: remoteDatabase ? 0 : 5000, wal: !remoteDatabase, client: { url: databaseURI, authToken: process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN }, migrationDir: path.resolve(process.cwd(), 'src/migrations') }),
  typescript: { outputFile: path.resolve(process.cwd(), 'src/payload-types.ts') },
  upload: { limits: { fileSize: 10 * 1024 * 1024 } },
  onInit: async (payload) => {
    if (remoteDatabase || process.env.PAYLOAD_MIGRATING === 'true') return;
    const existing = await payload.findGlobal({ slug: 'site', depth: 0 });
    if (!existing.createdAt) {
      const content = contentToGlobal(readLegacyContent());
      const profile = await importProfileMedia(payload, content.profile);
      await payload.updateGlobal({ slug: 'site', data: { ...content, profile, _status: 'published' }, draft: false });
      payload.logger.info('Imported site content into Payload; original studio database is unchanged.');
    }
  },
});
