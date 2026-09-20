import { cloneDefaultContent } from '../data/defaultContent.js';
import { detectPlatform } from './platformDetect.js';

export function safeURL(value, image = false) {
  if (typeof value !== 'string') return '';
  const url = value.trim();
  if (!url || /[\\\u0000-\u0020]/.test(url)) return '';
  if (url.startsWith('/') && !url.startsWith('//')) return url;
  if (!image && url.startsWith('#')) return url;
  if (!image && /^(mailto:|tel:).+/i.test(url)) return url;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) ? url : '';
  } catch {
    return '';
  }
}

export function normalizeSiteContent(doc) {
  const fallback = cloneDefaultContent();
  if (!doc || typeof doc !== 'object') return fallback;
  const profile = { ...fallback.profile, ...doc.profile };
  profile.avatarSrc = safeURL(doc.profile?.avatar?.url || profile.avatarSrc, true);
  profile.backgroundSrc = safeURL(doc.profile?.background?.url || profile.backgroundSrc, true);
  delete profile.avatar;
  delete profile.background;
  const mapLinks = (rows, kind) => (Array.isArray(rows) ? rows : []).filter(row => row && typeof row === 'object').map((row, index) => ({
    id: String(row.id ?? `${kind}-${index}`), kind,
    label: String(row.label ?? ''), url: safeURL(row.url),
    icon: row.icon || (kind === 'social' ? 'auto' : 'link'),
    platform: kind === 'social' && row.icon && row.icon !== 'auto' ? row.icon : detectPlatform(row.url).key,
    sortOrder: index,
  }));
  return { profile, theme: { ...fallback.theme, ...doc.theme }, links: [...mapLinks(doc.contentLinks, 'content'), ...mapLinks(doc.socialLinks, 'social')] };
}

export function contentToGlobal(content) {
  return { profile: content.profile, theme: content.theme,
    contentLinks: content.links.filter(link => link.kind === 'content').map(({ label, url, icon }) => ({ label, url, icon })),
    socialLinks: content.links.filter(link => link.kind === 'social').map(({ label, url, icon }) => ({ label, url, icon })),
    _status: 'published',
  };
}
