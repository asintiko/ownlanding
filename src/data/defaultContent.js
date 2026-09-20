/**
 * Shipped default content for the Katy Delma link-in-bio page.
 *
 * This module is the single seed source: the local studio seeds its SQLite
 * database from it on first run, "Сбросить к значениям по умолчанию" restores it,
 * and a production build falls back to it when the local database is absent.
 *
 * Dependency-free ESM — imported by both the browser bundle and the local
 * studio server.
 */

export const defaultContent = {
  profile: {
    name: 'Katy Delma',
    bio: 'Chasing golden hours & hidden coastlines — sharing the trails, gear, and stories from the road.',
    footerNote: '\u00a9 2026 Katy Delma \u00b7 made with wanderlust',
    avatarSrc: '/assets/images/katy-delma-avatar.jpg',
    backgroundSrc: '/assets/images/golden-hour-coast.jpg',
  },
  theme: {
    /* Ground */
    sandHigh: '#F3EEE4',
    sandMid: '#E6DDCD',
    sandLow: '#DDD2BC',
    /* Text on the photograph */
    onPhoto: '#FFFFFF',
    onPhotoSoft: '#FFFFFFEB',
    onPhotoMuted: '#FFFFFFB8',
    /* Buttons and accent */
    buttonSurface: '#FFFFFFD6',
    ink: '#2C2A26',
    terracotta: '#936347',
    /* Scrim */
    scrimTop: '#28231C8C',
    scrimBottom: '#221D16AD',
    /* Typefaces */
    fontDisplay: 'font-display-georgia',
    fontBody: 'font-body-system',
  },
  links: [
    { id: 'travel-blog', kind: 'content', label: 'Travel Blog', url: '#', icon: 'journal', platform: 'link', sortOrder: 0 },
    { id: 'travel-tips', kind: 'content', label: 'Travel Tips', url: '#', icon: 'compass', platform: 'link', sortOrder: 1 },
    { id: 'hiking-equipment', kind: 'content', label: 'Hiking Equipment', url: '#', icon: 'tent', platform: 'link', sortOrder: 2 },
    { id: 'camera-equipment', kind: 'content', label: 'Camera Equipment', url: '#', icon: 'camera', platform: 'link', sortOrder: 3 },
    { id: 'tiktok', kind: 'social', label: '', url: '#', icon: 'auto', platform: 'link', sortOrder: 0 },
    { id: 'youtube', kind: 'social', label: '', url: '#', icon: 'auto', platform: 'link', sortOrder: 1 },
    { id: 'x', kind: 'social', label: '', url: '#', icon: 'auto', platform: 'link', sortOrder: 2 },
    { id: 'instagram', kind: 'social', label: '', url: '#', icon: 'auto', platform: 'link', sortOrder: 3 },
  ],
};

/** Deep clone so callers can never mutate the shipped defaults. */
export function cloneDefaultContent() {
  return JSON.parse(JSON.stringify(defaultContent));
}
