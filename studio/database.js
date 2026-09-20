/**
 * Local content store for the Katy Delma link-in-bio page.
 *
 * Backed by a single SQLite file next to the project (`studio/data/site.sqlite3`)
 * using Node's built-in `node:sqlite` — no external service, no account, no
 * dependency to install. The store is owned by one operator on one machine.
 */

import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { cloneDefaultContent } from '../src/data/defaultContent.js';
import { CONTENT_ICONS, detectPlatform, normalizeHexColor } from '../src/lib/platformDetect.js';
import { DEFAULT_BODY_FONT, DEFAULT_DISPLAY_FONT } from '../src/lib/fontOptions.js';
import { ensureAuthSchema } from './auth.js';

const KINDS = new Set(['content', 'social']);

/**
 * The theme columns, in one place: `[column, content key, default value]`.
 * Adding a colour or a typeface here is all the schema needs.
 */
const THEME_COLUMNS = [
  ['sand_high', 'sandHigh', '#F3EEE4'],
  ['sand_mid', 'sandMid', '#E6DDCD'],
  ['sand_low', 'sandLow', '#DDD2BC'],
  ['on_photo', 'onPhoto', '#FFFFFF'],
  ['on_photo_soft', 'onPhotoSoft', '#FFFFFFEB'],
  ['on_photo_muted', 'onPhotoMuted', '#FFFFFFB8'],
  ['ink', 'ink', '#2C2A26'],
  ['button_surface', 'buttonSurface', '#FFFFFFD6'],
  ['terracotta', 'terracotta', '#936347'],
  ['scrim_top', 'scrimTop', '#28231C8C'],
  ['scrim_bottom', 'scrimBottom', '#221D16AD'],
  ['font_display', 'fontDisplay', DEFAULT_DISPLAY_FONT],
  ['font_body', 'fontBody', DEFAULT_BODY_FONT],
];

const COLOR_COLUMNS = THEME_COLUMNS.filter(([column]) => !column.startsWith('font_'));

/** Absolute path of the SQLite file for a project root. */
export function databasePath(projectRoot) {
  return join(projectRoot, 'studio', 'data', 'site.sqlite3');
}

function nowIso() {
  return new Date().toISOString();
}

function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS site_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      name TEXT NOT NULL,
      bio TEXT NOT NULL,
      footer_note TEXT NOT NULL DEFAULT '',
      avatar_src TEXT NOT NULL DEFAULT '',
      background_src TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      kind TEXT NOT NULL,
      label TEXT NOT NULL DEFAULT '',
      url TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'auto',
      platform TEXT NOT NULL DEFAULT 'link',
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS links_kind_order ON links (kind, sort_order);
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS theme (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      updated_at TEXT NOT NULL
    );
  `);

  migrateThemeColumns(db);
  ensureAuthSchema(db);
}

const THEME_NAMES = ['id', ...THEME_COLUMNS.map(([column]) => column), 'updated_at'];

/**
 * Bring an older theme table up to the current shape.
 *
 * Steps: add any column the file predates; carry a legacy value across when a
 * token was renamed; then rebuild the table when it still carries columns this
 * version no longer writes, because a leftover NOT NULL column without a
 * default would otherwise make every later write fail.
 */
function migrateThemeColumns(db) {
  let existing = new Set(db.prepare('PRAGMA table_info(theme)').all().map((row) => row.name));

  if (!existing.has('updated_at')) {
    db.exec("ALTER TABLE theme ADD COLUMN updated_at TEXT NOT NULL DEFAULT ''");
    existing = new Set(db.prepare('PRAGMA table_info(theme)').all().map((row) => row.name));
  }

  for (const [column, , fallback] of THEME_COLUMNS) {
    if (existing.has(column)) continue;
    db.exec(`ALTER TABLE theme ADD COLUMN ${column} TEXT NOT NULL DEFAULT '${fallback}'`);
    existing.add(column);
  }

  // The accent token was renamed to `terracotta`: carry the stored value over.
  if (existing.has('accent')) {
    db.exec(
      "UPDATE theme SET terracotta = accent WHERE accent IS NOT NULL AND accent <> ''"
    );
  }

  const extra = [...existing].filter((name) => !THEME_NAMES.includes(name));
  if (extra.length === 0) return;

  db.exec('DROP TABLE IF EXISTS theme_rebuilt');
  db.exec('BEGIN');
  try {
    db.exec(`
      CREATE TABLE theme_rebuilt (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        ${THEME_COLUMNS.map(([column]) => `${column} TEXT NOT NULL`).join(',\n        ')},
        updated_at TEXT NOT NULL
      )
    `);
    if (existing.has('updated_at')) {
      db.exec(
        `INSERT INTO theme_rebuilt (${THEME_NAMES.join(', ')})
         SELECT ${THEME_NAMES.join(', ')} FROM theme`
      );
    }
    db.exec('DROP TABLE theme');
    db.exec('ALTER TABLE theme_rebuilt RENAME TO theme');
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function isSeeded(db) {
  const row = db.prepare('SELECT COUNT(*) AS count FROM site_profile').get();
  return Number(row?.count ?? 0) > 0;
}

function writeContentInternal(db, content) {
  const stamp = nowIso();

  db.prepare(
    `INSERT INTO site_profile (id, name, bio, footer_note, avatar_src, background_src, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       name = excluded.name,
       bio = excluded.bio,
       footer_note = excluded.footer_note,
       avatar_src = excluded.avatar_src,
       background_src = excluded.background_src,
       updated_at = excluded.updated_at`
  ).run(
    content.profile.name,
    content.profile.bio,
    content.profile.footerNote,
    content.profile.avatarSrc,
    content.profile.backgroundSrc,
    stamp
  );

  const columns = THEME_COLUMNS.map(([column]) => column);
  const placeholders = columns.map(() => '?').join(', ');
  const updates = columns.map((column) => `${column} = excluded.${column}`).join(', ');

  db.prepare(
    `INSERT INTO theme (id, ${columns.join(', ')}, updated_at)
     VALUES (1, ${placeholders}, ?)
     ON CONFLICT(id) DO UPDATE SET ${updates}, updated_at = excluded.updated_at`
  ).run(...columns.map((column) => themeValue(content.theme, column)), stamp);

  db.prepare('DELETE FROM links').run();
  const insert = db.prepare(
    `INSERT INTO links (id, kind, label, url, icon, platform, sort_order, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const link of content.links) {
    insert.run(
      link.id,
      link.kind,
      link.label,
      link.url,
      link.icon,
      link.platform,
      link.sortOrder,
      stamp,
      stamp
    );
  }
}

function themeValue(theme, column) {
  const entry = THEME_COLUMNS.find(([name]) => name === column);
  if (!entry) return null;
  return theme[entry[1]];
}

function readContentInternal(db) {
  const profile = db.prepare('SELECT * FROM site_profile WHERE id = 1').get();
  const themeRow = db.prepare('SELECT * FROM theme WHERE id = 1').get();
  const linkRows = db
    .prepare('SELECT * FROM links ORDER BY kind ASC, sort_order ASC, id ASC')
    .all();

  if (!profile || !themeRow) return cloneDefaultContent();

  const theme = {};
  for (const [column, key, fallback] of THEME_COLUMNS) {
    theme[key] = themeRow[column] ?? fallback;
  }

  return {
    profile: {
      name: profile.name,
      bio: profile.bio,
      footerNote: profile.footer_note,
      avatarSrc: profile.avatar_src,
      backgroundSrc: profile.background_src,
    },
    theme,
    links: linkRows.map((row) => ({
      id: row.id,
      kind: row.kind,
      label: row.label,
      url: row.url,
      icon: row.icon,
      platform: row.platform,
      sortOrder: Number(row.sort_order),
    })),
  };
}

/**
 * Validate and normalise an incoming content payload.
 *
 * @returns {{ ok: true, content: object } | { ok: false, errors: string[] }}
 */
export function normalizeContent(input) {
  const errors = [];

  if (!input || typeof input !== 'object') {
    return { ok: false, errors: ['Тело запроса не содержит данных.'] };
  }

  const profileInput = input.profile ?? {};
  const themeInput = input.theme ?? {};
  const name = String(profileInput.name ?? '').trim();
  const bio = String(profileInput.bio ?? '').trim();
  if (!name) errors.push('Имя не может быть пустым.');
  if (!bio) errors.push('Описание не может быть пустым.');

  const theme = {};
  for (const [, key, fallback] of COLOR_COLUMNS) {
    theme[key] = normalizeHexColor(themeInput[key]) ?? fallback;
  }
  theme.fontDisplay = String(themeInput.fontDisplay ?? '').trim() || DEFAULT_DISPLAY_FONT;
  theme.fontBody = String(themeInput.fontBody ?? '').trim() || DEFAULT_BODY_FONT;

  const rawLinks = Array.isArray(input.links) ? input.links : [];
  const seenIds = new Set();
  const counters = { content: 0, social: 0 };
  const links = [];

  rawLinks.forEach((raw, index) => {
    const kind = KINDS.has(raw?.kind) ? raw.kind : 'content';
    const url = String(raw?.url ?? '').trim();
    const label = String(raw?.label ?? '').trim();

    if (!url) {
      errors.push(`Ссылка №${index + 1} не содержит адреса.`);
      return;
    }
    if (kind === 'content' && !label) {
      errors.push(`У ссылки №${index + 1} не заполнено название.`);
      return;
    }

    let id = String(raw?.id ?? '').trim();
    if (!id || seenIds.has(id)) id = `${kind}-${Date.now()}-${index}`;
    seenIds.add(id);

    const rawIcon = String(raw?.icon ?? 'auto').trim() || 'auto';
    const icon = kind === 'content' ? (CONTENT_ICONS.includes(rawIcon) ? rawIcon : 'link') : rawIcon;
    const detected = detectPlatform(url);

    links.push({
      id,
      kind,
      label: kind === 'social' ? '' : label,
      url,
      icon,
      platform: icon !== 'auto' && kind === 'social' ? icon : detected.key,
      sortOrder: counters[kind]++,
    });
  });

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    content: {
      profile: {
        name,
        bio,
        footerNote: String(profileInput.footerNote ?? '').trim(),
        avatarSrc: String(profileInput.avatarSrc ?? '').trim(),
        backgroundSrc: String(profileInput.backgroundSrc ?? '').trim(),
      },
      theme,
      links,
    },
  };
}

/** Open (creating, migrating and seeding when needed) the local store. */
export function openStore(projectRoot) {
  const file = databasePath(projectRoot);
  mkdirSync(dirname(file), { recursive: true });

  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  createSchema(db);

  if (!isSeeded(db)) {
    const normalized = normalizeContent(cloneDefaultContent());
    if (!normalized.ok) throw new Error('Не удалось подготовить данные по умолчанию.');
    db.exec('BEGIN');
    try {
      writeContentInternal(db, normalized.content);
      db.exec('COMMIT');
    } catch (error) {
      db.exec('ROLLBACK');
      throw error;
    }
  }

  return {
    path: file,
    db,
    read() {
      return readContentInternal(db);
    },
    write(content) {
      db.exec('BEGIN');
      try {
        writeContentInternal(db, content);
        db.exec('COMMIT');
      } catch (error) {
        db.exec('ROLLBACK');
        throw error;
      }
      return readContentInternal(db);
    },
    reset() {
      const normalized = normalizeContent(cloneDefaultContent());
      if (!normalized.ok) throw new Error('Не удалось подготовить данные по умолчанию.');
      return this.write(normalized.content);
    },
    close() {
      db.close();
    },
  };
}

/** Content snapshot for a production build (creates, migrates and seeds the DB when absent). */
export function readContentSnapshot(projectRoot) {
  try {
    const store = openStore(projectRoot);
    const content = store.read();
    store.close();
    return content;
  } catch {
    return cloneDefaultContent();
  }
}

/** Write an uploaded image into the project's canonical image folder. */
export function writeUpload(projectRoot, filename, buffer) {
  const targetDir = join(projectRoot, 'public', 'assets', 'images');
  mkdirSync(targetDir, { recursive: true });
  const target = join(targetDir, filename);
  writeFileSync(target, buffer);
  return `/assets/images/${filename}`;
}

/** Whether a stored image path still exists on disk. */
export function assetExists(projectRoot, publicPath) {
  if (!publicPath || !publicPath.startsWith('/')) return false;
  return existsSync(join(projectRoot, 'public', publicPath.replace(/^\//, '')));
}

/** Read the raw bytes of a project asset. */
export function readAsset(projectRoot, publicPath) {
  if (!publicPath || !publicPath.startsWith('/')) return null;
  const file = join(projectRoot, 'public', publicPath.replace(/^\//, ''));
  if (!existsSync(file)) return null;
  return readFileSync(file);
}
