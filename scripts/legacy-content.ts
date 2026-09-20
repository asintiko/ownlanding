import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { cloneDefaultContent } from '../src/data/defaultContent.js';
export function readLegacyContent() {
  const snapshot = path.resolve(process.cwd(), 'src/data/published-site.json');
  if (existsSync(snapshot)) return JSON.parse(readFileSync(snapshot, 'utf8'));
  const content = cloneDefaultContent();
  const file = path.resolve(process.cwd(), 'studio/data/site.sqlite3');
  if (!existsSync(file)) return content;
  const db = new DatabaseSync(file, { readOnly: true });
  try {
    const profile = db.prepare('SELECT * FROM site_profile WHERE id = 1').get();
    if (!profile) return content;
    content.profile = { name: String(profile.name), bio: String(profile.bio), footerNote: String(profile.footer_note ?? ''), avatarSrc: String(profile.avatar_src ?? ''), backgroundSrc: String(profile.background_src ?? '') };
    const theme = db.prepare('SELECT * FROM theme WHERE id = 1').get();
    if (theme) for (const key of Object.keys(content.theme)) {
      const column = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      if (theme[column]) content.theme[key] = String(theme[column]);
    }
    content.links = db.prepare('SELECT * FROM links ORDER BY kind, sort_order, id').all().map(row => ({ id: String(row.id), kind: String(row.kind), label: String(row.label), url: String(row.url), icon: String(row.icon), platform: String(row.platform), sortOrder: Number(row.sort_order) }));
    return content;
  } finally { db.close(); }
}
