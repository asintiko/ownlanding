import test from 'node:test';
import assert from 'node:assert/strict';
import { safeURL, normalizeSiteContent, contentToGlobal } from '../src/lib/payload-content.js';
import { cloneDefaultContent } from '../src/data/defaultContent.js';
test('unsafe protocols and protocol-relative URLs cannot reach public links', () => {
  for (const url of ['javascript:alert(1)', '//evil.com', 'data:text/html,test', '\\evil.com', 'https://host/\nscript']) assert.equal(safeURL(url), '');
  for (const url of ['https://example.com', 'mailto:a@example.com', 'tel:+123', '/assets/a.jpg', '#']) assert.equal(safeURL(url), url);
  assert.equal(safeURL('mailto:a@example.com', true), '');
});
test('row order, media override and social detection survive CMS normalization', () => {
  const doc = contentToGlobal(cloneDefaultContent());
  doc.profile = { ...doc.profile, avatar: { url: '/api/media/file/avatar.webp' } };
  doc.socialLinks = [{ label: 'Telegram', url: 'https://t.me/test', icon: 'auto' }];
  doc.contentLinks.reverse();
  const content = normalizeSiteContent(doc);
  assert.equal(content.profile.avatarSrc, '/api/media/file/avatar.webp');
  assert.equal(content.links[0].label, 'Camera Equipment');
  assert.equal(content.links.at(-1).platform, 'telegram');
  assert.equal(content.links.at(-1).label, 'Telegram');
});
test('deleted rows stay deleted, transient form data does not crash preview', () => {
  assert.equal(normalizeSiteContent({ contentLinks: [], socialLinks: [] }).links.length, 0);
  assert.equal(normalizeSiteContent({ contentLinks: false, socialLinks: [null] }).links.length, 0);
});
