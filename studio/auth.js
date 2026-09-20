/**
 * Local credential, session and media-store helpers for the console.
 *
 * Everything here lives in the same SQLite file as the page content. There is no
 * account system, no server, no e-mail delivery and no multi-user access: the
 * credential exists to stop a casual onlooker on this machine editing the site,
 * and nothing more. The address is only a login name — no message is ever sent
 * to it.
 */

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function nowIso() {
  return new Date().toISOString();
}

/** Derive a salted scrypt hash. Node built-in only — no dependency, no network. */
export function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = scryptSync(String(password), salt, 64).toString('hex');
  return `scrypt:${salt}:${derived}`;
}

/** Constant-time comparison of a candidate password against the stored hash. */
export function verifyPassword(password, stored) {
  const [scheme, salt, expected] = String(stored ?? '').split(':');
  if (scheme !== 'scrypt' || !salt || !expected) return false;

  const derived = scryptSync(String(password), salt, 64);
  const reference = Buffer.from(expected, 'hex');
  if (derived.length !== reference.length) return false;
  return timingSafeEqual(derived, reference);
}

/** Create the credential, session and media tables if this file predates them. */
export function ensureAuthSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS credential (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      address TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS media (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL UNIQUE,
      filename TEXT NOT NULL,
      mime TEXT NOT NULL DEFAULT '',
      bytes INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );
  `);
}

export function getCredential(db) {
  const row = db.prepare('SELECT address, password_hash FROM credential WHERE id = 1').get();
  if (!row) return null;
  return { address: row.address, passwordHash: row.password_hash };
}

export function isCredentialConfigured(db) {
  return getCredential(db) !== null;
}

export function createCredential(db, address, password) {
  const stamp = nowIso();
  db.prepare(
    `INSERT INTO credential (id, address, password_hash, created_at, updated_at)
     VALUES (1, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       address = excluded.address,
       password_hash = excluded.password_hash,
       updated_at = excluded.updated_at`
  ).run(address, hashPassword(password), stamp, stamp);
  return { address };
}

/** The local "forgot password" action: clears only the credential. */
export function clearCredential(db) {
  db.prepare('DELETE FROM credential WHERE id = 1').run();
  db.prepare('DELETE FROM sessions').run();
}

export function createSession(db) {
  const token = randomBytes(32).toString('hex');
  const stamp = new Date();
  db.prepare('INSERT INTO sessions (token, created_at, expires_at) VALUES (?, ?, ?)').run(
    token,
    stamp.toISOString(),
    new Date(stamp.getTime() + SESSION_TTL_MS).toISOString()
  );
  return token;
}

export function readSession(db, token) {
  if (!token) return null;
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(nowIso());
  const row = db.prepare('SELECT token FROM sessions WHERE token = ?').get(token);
  return row ? { token: row.token } : null;
}

export function revokeSession(db, token) {
  if (!token) return;
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
}

export function recordMedia(db, { path, filename, mime, bytes }) {
  db.prepare(
    `INSERT INTO media (path, filename, mime, bytes, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(path) DO UPDATE SET
       filename = excluded.filename,
       mime = excluded.mime,
       bytes = excluded.bytes`
  ).run(path, filename, mime ?? '', bytes ?? 0, nowIso());
}

export function listMedia(db) {
  return db
    .prepare('SELECT path, filename, mime, bytes, created_at FROM media ORDER BY created_at DESC, id DESC')
    .all()
    .map((row) => ({
      path: row.path,
      filename: row.filename,
      mime: row.mime,
      bytes: Number(row.bytes),
      createdAt: row.created_at,
    }));
}
