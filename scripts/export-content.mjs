import { createHash } from 'node:crypto';
import { mkdir, writeFile, rename } from 'node:fs/promises';
import { normalizeSiteContent } from '../src/lib/payload-content.js';
import { defaultContent } from '../src/data/defaultContent.js';

const origin = new URL(process.env.PUBLIC_SOURCE_URL || 'http://127.0.0.1:3000');
const response = await fetch(new URL('/api/globals/site?depth=1', origin), { signal: AbortSignal.timeout(30000) });
if (!response.ok) throw new Error(`Cannot read published content: HTTP ${response.status}`);
const doc = await response.json();
if (doc._status !== 'published') throw new Error('Publish the site in the admin before exporting.');
const normalized = normalizeSiteContent(doc);
const content = {
  profile: Object.fromEntries(Object.keys(defaultContent.profile).map(key => [key, normalized.profile[key]])),
  theme: Object.fromEntries(Object.keys(defaultContent.theme).map(key => [key, normalized.theme[key]])),
  links: normalized.links,
};
const extensions = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' };
await mkdir('public/assets/profile', { recursive: true });
for (const field of ['avatarSrc', 'backgroundSrc']) {
  const source = content.profile[field];
  if (!source) continue;
  const image = await fetch(new URL(source, origin), { signal: AbortSignal.timeout(30000) });
  if (!image.ok) throw new Error(`Cannot export ${field}: HTTP ${image.status}`);
  const extension = extensions[image.headers.get('content-type')?.split(';')[0]];
  if (!extension) throw new Error(`Unsupported image format for ${field}`);
  const bytes = Buffer.from(await image.arrayBuffer());
  const hash = createHash('sha256').update(bytes).digest('hex').slice(0,16);
  const filename = `${field}-${hash}.${extension}`;
  await writeFile(`public/assets/profile/${filename}`, bytes);
  content.profile[field] = `/assets/profile/${filename}`;
}
const destination = 'src/data/published-site.json';
await writeFile(`${destination}.tmp`, JSON.stringify(content, null, 2) + '\n');
await rename(`${destination}.tmp`, destination);
console.log(`Exported published profile, ${content.links.length} links and selected photos. No accounts or credentials exported.`);
