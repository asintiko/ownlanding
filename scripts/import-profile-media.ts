import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Payload } from 'payload';
import type { Site } from '../src/payload-types';

export async function importProfileMedia(payload: Payload, profile: Site['profile']) {
  const updated = { ...profile };
  const publicRoot = path.resolve(process.cwd(), 'public');
  for (const [field, sourceField, description] of [
    ['avatar', 'avatarSrc', 'Фотография профиля'],
    ['background', 'backgroundSrc', 'Фон страницы'],
  ] as const) {
    if (updated[field]) continue;
    const source = updated[sourceField];
    if (!source?.startsWith('/assets/')) continue;
    const filePath = path.resolve(publicRoot, `.${source}`);
    if (!filePath.startsWith(publicRoot + path.sep) || !existsSync(filePath)) continue;
    const existing = await payload.find({ collection: 'media', where: { filename: { equals: path.basename(filePath) } }, limit: 1 });
    const media = existing.docs[0] || await payload.create({ collection: 'media', data: { alt: description }, filePath });
    updated[field] = media.id;
  }
  return updated;
}
