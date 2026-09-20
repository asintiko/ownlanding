import { getPayload } from 'payload';
import config from '../payload.config';
import { importProfileMedia } from './import-profile-media';
import { readLegacyContent } from './legacy-content';
import { contentToGlobal } from '../src/lib/payload-content.js';

const email = process.env.BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.BOOTSTRAP_ADMIN_PASSWORD;
const name = process.env.BOOTSTRAP_ADMIN_NAME?.trim();
const databaseURI = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URI;
if (!databaseURI || databaseURI.startsWith('file:')) {
  throw new Error('Bootstrap requires a remote DATABASE_URI');
}
if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error('Bootstrap requires BLOB_READ_WRITE_TOKEN');
if (!email || !password || password.length < 12 || !name) {
  throw new Error('Set BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_NAME and BOOTSTRAP_ADMIN_PASSWORD (at least 12 characters) privately');
}

const payload = await getPayload({ config });
try {
  await payload.db.migrate();
  const users = await payload.find({ collection: 'users', limit: 1, overrideAccess: true });
  if (users.totalDocs === 0) {
    await payload.create({ collection: 'users', data: { email, password, name }, context: { bootstrapAdmin: true }, overrideAccess: true });
    payload.logger.info('Created the administrator account.');
  } else {
    const administrator = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1, overrideAccess: true });
    if (!administrator.totalDocs) throw new Error('Database already contains another administrator; bootstrap stopped');
    payload.logger.info('Administrator already exists; credentials were not changed.');
  }
  const existing = await payload.findGlobal({ slug: 'site', depth: 0 });
  if (!existing.createdAt) {
    const content = contentToGlobal(readLegacyContent());
    const profile = await importProfileMedia(payload, content.profile);
    await payload.updateGlobal({ slug: 'site', data: { ...content, profile, _status: 'published' }, draft: false });
    payload.logger.info('Imported the published profile and photos.');
  } else {
    payload.logger.info('Site already exists; content was not changed.');
  }
} finally {
  await payload.destroy();
}
