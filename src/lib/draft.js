/**
 * Draft helpers for the local studio: ordering, validation, theme application
 * and the public page's staggered entrance timing.
 */

import {
  detectPlatform,
  isHexColor,
  validateLinkValue,
  CONTENT_ICONS,
} from './platformDetect.js';
import {
  BODY_FONT_OPTIONS,
  DEFAULT_BODY_FONT,
  DEFAULT_DISPLAY_FONT,
  DISPLAY_FONT_OPTIONS,
  resolveBodyFont,
  resolveDisplayFont,
} from './fontOptions.js';

export const NAME_MAX = 60;
export const BIO_MAX = 140;
export const FOOTER_MAX = 120;
export const LABEL_MAX = 40;

/**
 * The page colour tokens the console edits, in display order, grouped under
 * hairline rules so the group reads as a table.
 */
export const THEME_COLOR_GROUPS = [
  {
    id: 'ground',
    label: 'Фон страницы',
    rows: [
      { key: 'sandHigh', label: 'Светлый песок', role: 'Верхний край фонового перехода.' },
      { key: 'sandMid', label: 'Средний песок', role: 'Середина фонового перехода.' },
      { key: 'sandLow', label: 'Глубокий песок', role: 'Нижний край фонового перехода.' },
    ],
  },
  {
    id: 'text',
    label: 'Текст поверх фотографии',
    rows: [
      { key: 'onPhoto', label: 'Имя', role: 'Цвет имени поверх фотографии.' },
      { key: 'onPhotoSoft', label: 'Описание', role: 'Цвет описания под именем.' },
      { key: 'onPhotoMuted', label: 'Подпись внизу', role: 'Цвет подписи в самом низу страницы.' },
    ],
  },
  {
    id: 'actions',
    label: 'Кнопки и акцент',
    rows: [
      { key: 'ink', label: 'Текст на кнопках', role: 'Цвет названий на кнопках-капсулах.' },
      { key: 'buttonSurface', label: 'Заливка кнопок', role: 'Полупрозрачная заливка кнопок.' },
      { key: 'terracotta', label: 'Акцент', role: 'Цвет значков на кнопках и подсветки соцсетей.' },
    ],
  },
  {
    id: 'scrim',
    label: 'Затемнение поверх фотографии',
    rows: [
      { key: 'scrimTop', label: 'Затемнение сверху', role: 'Верхний край затемнения — читаемость имени.' },
      { key: 'scrimBottom', label: 'Затемнение снизу', role: 'Нижний край затемнения — читаемость подписи.' },
    ],
  },
];

/** Flat list of every editable colour row. */
export const THEME_COLOR_ROWS = THEME_COLOR_GROUPS.flatMap((group) => group.rows);

export function cloneContent(content) {
  return JSON.parse(JSON.stringify(content));
}

/** Links of one kind, in display order. */
export function linksOfKind(links, kind) {
  return links
    .filter((link) => link.kind === kind)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/** Reassign `sortOrder` so each kind is numbered from zero in current order. */
export function resequence(links) {
  const counters = { content: 0, social: 0 };
  const ordered = [...links].sort((a, b) => {
    if (a.kind === b.kind) return a.sortOrder - b.sortOrder;
    return a.kind === 'content' ? -1 : 1;
  });
  return ordered.map((link) => ({ ...link, sortOrder: counters[link.kind]++ }));
}

/** Move a link one position up or down inside its own kind. */
export function moveLink(links, id, direction) {
  const target = links.find((link) => link.id === id);
  if (!target) return links;

  const siblings = linksOfKind(links, target.kind);
  const index = siblings.findIndex((link) => link.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= siblings.length) return links;

  const reordered = [...siblings];
  [reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]];

  const rest = links.filter((link) => link.kind !== target.kind);
  return resequence([...rest, ...reordered]);
}

export function createLink(kind) {
  const suffix = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  return {
    id: `${kind}-${suffix}`,
    kind,
    label: '',
    url: '',
    icon: kind === 'content' ? 'journal' : 'auto',
    platform: 'link',
    sortOrder: 9999,
  };
}

/** Deterministic string used for dirty-state comparison. */
export function serializeForCompare(content) {
  return JSON.stringify({
    profile: content.profile,
    theme: content.theme,
    links: linksOfKind(content.links, 'content')
      .concat(linksOfKind(content.links, 'social'))
      .map((link) => ({
        id: link.id,
        kind: link.kind,
        label: link.label,
        url: link.url,
        icon: link.icon,
      })),
  });
}

const PROFILE_TEXT_KEYS = ['name', 'bio', 'footerNote'];
const PROFILE_IMAGE_KEYS = ['avatarSrc', 'backgroundSrc'];
const FONT_KEYS = ['fontDisplay', 'fontBody'];

function pick(source, keys) {
  return JSON.stringify(keys.map((key) => source?.[key] ?? null));
}

function linksSignature(links, kind) {
  return JSON.stringify(
    linksOfKind(links, kind).map((link) => [link.id, link.label, link.url, link.icon])
  );
}

/**
 * Which console sections differ between the draft and the saved document.
 *
 * @returns {{profile: boolean, media: boolean, fonts: boolean, colors: boolean, links: boolean, social: boolean}}
 */
export function dirtySections(draft, saved) {
  const colorKeys = THEME_COLOR_ROWS.map((row) => row.key);
  return {
    profile: pick(draft.profile, PROFILE_TEXT_KEYS) !== pick(saved.profile, PROFILE_TEXT_KEYS),
    media: pick(draft.profile, PROFILE_IMAGE_KEYS) !== pick(saved.profile, PROFILE_IMAGE_KEYS),
    fonts: pick(draft.theme, FONT_KEYS) !== pick(saved.theme, FONT_KEYS),
    colors: pick(draft.theme, colorKeys) !== pick(saved.theme, colorKeys),
    links: linksSignature(draft.links, 'content') !== linksSignature(saved.links, 'content'),
    social: linksSignature(draft.links, 'social') !== linksSignature(saved.links, 'social'),
  };
}

/**
 * Validate the whole draft.
 *
 * @returns {{ fieldErrors: Record<string,string>, linkErrors: Record<string,{label?:string,url?:string}>, summary: string[] }}
 */
export function validateDraft(content) {
  const fieldErrors = {};
  const linkErrors = {};
  const summary = [];

  const { profile, theme, links } = content;

  if (!String(profile.name ?? '').trim()) {
    fieldErrors['profile.name'] = 'Введите имя — оно показывается на странице.';
  } else if (profile.name.trim().length > NAME_MAX) {
    fieldErrors['profile.name'] = `Не больше ${NAME_MAX} символов.`;
  }

  if (!String(profile.bio ?? '').trim()) {
    fieldErrors['profile.bio'] = 'Введите одну короткую строку описания.';
  } else if (profile.bio.trim().length > BIO_MAX) {
    fieldErrors['profile.bio'] = `Не больше ${BIO_MAX} символов.`;
  }

  if (String(profile.footerNote ?? '').trim().length > FOOTER_MAX) {
    fieldErrors['profile.footerNote'] = `Не больше ${FOOTER_MAX} символов.`;
  }

  for (const { key, label } of THEME_COLOR_ROWS) {
    if (!isHexColor(theme[key])) {
      fieldErrors[`theme.${key}`] = `Введите цвет в формате #RRGGBB — «${label}».`;
    }
  }

  if (!DISPLAY_FONT_OPTIONS.some((option) => option.key === theme.fontDisplay)) {
    fieldErrors['theme.fontDisplay'] = 'Выберите шрифт имени из списка.';
  }
  if (!BODY_FONT_OPTIONS.some((option) => option.key === theme.fontBody)) {
    fieldErrors['theme.fontBody'] = 'Выберите шрифт текста из списка.';
  }

  for (const link of links) {
    const row = {};
    if (link.kind === 'content') {
      const label = String(link.label ?? '').trim();
      if (!label) row.label = 'Введите название кнопки.';
      else if (label.length > LABEL_MAX) row.label = `Не больше ${LABEL_MAX} символов.`;
      else if (!CONTENT_ICONS.includes(link.icon)) row.label = 'Выберите значок для кнопки.';
    }
    const urlCheck = validateLinkValue(link.url);
    if (!urlCheck.ok) row.url = urlCheck.reason;
    if (Object.keys(row).length > 0) linkErrors[link.id] = row;
  }

  if (Object.keys(fieldErrors).length > 0) {
    summary.push('Проверьте выделенные поля — данные не сохранены.');
  }
  const linkErrorCount = Object.keys(linkErrors).length;
  if (linkErrorCount > 0) {
    summary.push(
      linkErrorCount === 1
        ? 'В одной строке ссылки есть ошибка.'
        : `В строках ссылок есть ошибки: ${linkErrorCount}.`
    );
  }

  return { fieldErrors, linkErrors, summary };
}

export function hasErrors(result) {
  return Object.keys(result.fieldErrors).length > 0 || Object.keys(result.linkErrors).length > 0;
}

/**
 * CSS custom properties carrying the editable theme — colours and the two
 * chosen typefaces — into the page and the live preview.
 */
export function themeStyle(theme) {
  return {
    '--color-sand-high': theme.sandHigh,
    '--color-sand-mid': theme.sandMid,
    '--color-sand-low': theme.sandLow,
    '--color-on-photo': theme.onPhoto,
    '--color-on-photo-soft': theme.onPhotoSoft,
    '--color-on-photo-muted': theme.onPhotoMuted,
    '--color-ink': theme.ink,
    '--color-button-surface': theme.buttonSurface,
    '--color-terracotta': theme.terracotta,
    '--color-scrim-top': theme.scrimTop,
    '--color-scrim-bottom': theme.scrimBottom,
    '--font-display': resolveDisplayFont(theme.fontDisplay),
    '--font-ui': resolveBodyFont(theme.fontBody),
  };
}

const ENTER_STEP = 80;
const ENTER_START = 240;

/**
 * Staggered entrance delays: avatar, name, bio, then each content link in order,
 * then the social row and the footer.
 */
export function computeRevealDelays(contentLinkCount, socialCount) {
  const links = Array.from({ length: contentLinkCount }, (_, index) => ENTER_START + index * ENTER_STEP);
  const lastLink = links.length > 0 ? links[links.length - 1] : 0;
  const social = Math.max(600, lastLink + ENTER_START + 40);
  return {
    avatar: 0,
    name: 80,
    bio: 160,
    links,
    social: socialCount > 0 ? social : 0,
    footer: social + ENTER_STEP,
  };
}

/** Platform shown for a social row: the manual override wins over detection. */
export function effectivePlatform(link) {
  if (link.icon && link.icon !== 'auto') return { key: link.icon, label: null };
  return detectPlatform(link.url);
}

export { DEFAULT_DISPLAY_FONT, DEFAULT_BODY_FONT };
