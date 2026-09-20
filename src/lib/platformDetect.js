/**
 * Platform detection for link destinations.
 *
 * Pure, dependency-free ES module: it is imported by the browser bundle (to show
 * the detection badge live while typing) and by the local studio server (to store
 * the detected platform with the record).
 */

import { CONTENT_ICON_KEYS } from './iconCatalog.js';

/** Known platforms. `hosts` are matched against the URL hostname and its subdomains. */
export const PLATFORMS = [
  { key: 'telegram', label: 'Telegram', hosts: ['t.me', 'telegram.me', 'telegram.org', 'telegram.dog', 'tg.dev'] },
  { key: 'youtube', label: 'YouTube', hosts: ['youtube.com', 'youtu.be', 'youtube-nocookie.com'] },
  { key: 'instagram', label: 'Instagram', hosts: ['instagram.com', 'instagr.am'] },
  { key: 'x', label: 'X', hosts: ['x.com', 'twitter.com', 't.co'] },
  { key: 'tiktok', label: 'TikTok', hosts: ['tiktok.com'] },
  { key: 'facebook', label: 'Facebook', hosts: ['facebook.com', 'fb.com', 'fb.me'] },
  { key: 'linkedin', label: 'LinkedIn', hosts: ['linkedin.com', 'lnkd.in'] },
  { key: 'whatsapp', label: 'WhatsApp', hosts: ['whatsapp.com', 'wa.me', 'chat.whatsapp.com'] },
  { key: 'github', label: 'GitHub', hosts: ['github.com', 'github.io'] },
  { key: 'email', label: 'E-mail', protocols: ['mailto:'] },
  { key: 'phone', label: 'Телефон', protocols: ['tel:'] },
];

/** The neutral fallback used when nothing is recognised. */
export const NEUTRAL_PLATFORM = { key: 'link', label: null };

/** Link icons offered for the full-width content buttons (the whole catalogue). */
export const CONTENT_ICONS = CONTENT_ICON_KEYS;

/**
 * Extract a hostname (or a mailto/tel marker) from a raw link value.
 *
 * @param {string} raw
 * @returns {{ protocol: string, host: string } | null}
 */
export function parseLink(raw) {
  const value = String(raw ?? '').trim();
  if (!value || value === '#') return null;

  const protocolMatch = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  const protocol = protocolMatch ? protocolMatch[1].toLowerCase() : '';

  if (protocol === 'mailto' || protocol === 'tel') {
    return { protocol: `${protocol}:`, host: '' };
  }

  try {
    const withProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(value) ? value : `https://${value}`;
    const url = new URL(withProtocol);
    return { protocol: url.protocol, host: url.hostname.toLowerCase().replace(/^www\./, '') };
  } catch {
    return null;
  }
}

/**
 * Detect the platform a link points at.
 *
 * @param {string} raw
 * @returns {{ key: string, label: string | null }} `{ key: 'link', label: null }` when unknown.
 */
export function detectPlatform(raw) {
  const parsed = parseLink(raw);
  if (!parsed) return NEUTRAL_PLATFORM;

  const byProtocol = PLATFORMS.find((platform) =>
    (platform.protocols ?? []).includes(parsed.protocol)
  );
  if (byProtocol) return { key: byProtocol.key, label: byProtocol.label };

  const byHost = PLATFORMS.find((platform) =>
    (platform.hosts ?? []).some((host) => parsed.host === host || parsed.host.endsWith(`.${host}`))
  );
  if (byHost) return { key: byHost.key, label: byHost.label };

  return NEUTRAL_PLATFORM;
}

/** Human-readable domain for a link, or the raw value when it cannot be parsed. */
export function linkHostLabel(raw) {
  const parsed = parseLink(raw);
  if (!parsed) return '';
  if (parsed.protocol === 'mailto:') return 'E-mail';
  if (parsed.protocol === 'tel:') return 'Телефон';
  return parsed.host;
}

/**
 * Whether a value is an acceptable destination: the shipped `#` placeholder, an
 * absolute http(s) address, a mailto:/tel: address, or a bare domain.
 *
 * @param {string} raw
 * @returns {{ ok: boolean, reason?: string }}
 */
export function validateLinkValue(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return { ok: false, reason: 'Введите адрес ссылки.' };
  if (value === '#') return { ok: true };
  if (/\s/.test(value)) return { ok: false, reason: 'Адрес не должен содержать пробелов.' };

  const parsed = parseLink(value);
  if (!parsed) return { ok: false, reason: 'Введите полный адрес, например https://t.me/…' };

  if (parsed.protocol === 'mailto:' || parsed.protocol === 'tel:') {
    const target = value.slice(parsed.protocol.length);
    if (!target) return { ok: false, reason: 'Введите адрес электронной почты или номер телефона.' };
    return { ok: true };
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return { ok: false, reason: 'Поддерживаются адреса http:// и https://.' };
  }

  const host = parsed.host.replace(/^www\./, '');
  if (!host || !host.includes('.')) {
    return { ok: false, reason: 'Введите домен, например t.me или youtube.com.' };
  }

  return { ok: true };
}

/** Validate a colour value: `#RRGGBB`, or `#RRGGBBAA` when the token carries transparency. */
export function isHexColor(value) {
  return /^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(String(value ?? '').trim());
}

/** Normalise a colour value to upper-case `#RRGGBB` / `#RRGGBBAA`, or `null` when invalid. */
export function normalizeHexColor(value) {
  const trimmed = String(value ?? '').trim().toUpperCase();
  return isHexColor(trimmed) ? trimmed : null;
}
