/**
 * Local console server, mounted into the Vite dev server.
 *
 * This is what makes the admin panel real without any cloud service: the same
 * `vite` process that serves the page also answers the console's small JSON API,
 * checks the local credential and reads/writes the SQLite file on disk. Nothing
 * here is reachable from the published static build.
 *
 * Reading the page content stays open — that content is public anyway. Every
 * mutation requires a session issued by the local credential.
 */

import { openStore, normalizeContent, writeUpload } from './database.js';
import {
  clearCredential,
  createCredential,
  createSession,
  getCredential,
  isCredentialConfigured,
  listMedia,
  readSession,
  recordMedia,
  revokeSession,
  verifyPassword,
} from './auth.js';

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ALLOWED_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const ADDRESS_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD = 8;

/** The one sign-in failure message. It never says which half was wrong. */
const CREDENTIAL_ERROR = 'Не удалось войти. Проверьте адрес и пароль.';

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function bearer(req) {
  const header = String(req.headers?.authorization ?? '');
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1] : '';
}

function readBody(req, limit = MAX_UPLOAD_BYTES * 2) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Слишком большой запрос.'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function parseJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function slugify(value) {
  const slug = String(value ?? '')
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
  return slug || 'image';
}

function uniqueName() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function handleUpload(store, payload) {
  const dataUrl = String(payload?.dataUrl ?? '');
  const match = /^data:([a-z/+.-]+);base64,(.+)$/i.exec(dataUrl);
  if (!match) {
    return { status: 400, body: { ok: false, error: 'Некорректный файл изображения.' } };
  }

  const mime = match[1].toLowerCase();
  const ext = ALLOWED_TYPES[mime];
  if (!ext) {
    return { status: 415, body: { ok: false, error: 'Поддерживаются JPG, PNG, WEBP до 8 МБ.' } };
  }

  const buffer = Buffer.from(match[2], 'base64');
  if (buffer.length === 0) return { status: 400, body: { ok: false, error: 'Файл пустой.' } };
  if (buffer.length > MAX_UPLOAD_BYTES) {
    return { status: 413, body: { ok: false, error: 'Файл больше 8 МБ.' } };
  }

  const filename = `${slugify(payload?.filename)}-${uniqueName()}.${ext}`;
  const publicPath = writeUpload(store.projectRoot, filename, buffer);
  recordMedia(store.db, { path: publicPath, filename, mime, bytes: buffer.length });

  return { status: 200, body: { ok: true, path: publicPath, filename, bytes: buffer.length } };
}

function validateCredentialInput({ address, password }) {
  const errors = [];
  if (!ADDRESS_PATTERN.test(String(address ?? '').trim())) {
    errors.push('Введите адрес электронной почты, например owner@example.com.');
  }
  if (String(password ?? '').length < MIN_PASSWORD) {
    errors.push(`Пароль должен быть не короче ${MIN_PASSWORD} символов.`);
  }
  return errors;
}

/**
 * @param {Object} options
 * @param {string} options.projectRoot Absolute project root.
 */
export function localStudio({ projectRoot }) {
  let store = null;

  const getStore = () => {
    if (!store) store = { ...openStore(projectRoot), projectRoot };
    return store;
  };

  const activeSession = (req) => readSession(getStore().db, bearer(req));

  return {
    name: 'accio-local-studio',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api', async (req, res) => {
        const { pathname } = new URL(req.url ?? '/', 'http://localhost');
        const method = (req.method ?? 'GET').toUpperCase();

        try {
          /* ---------------- open routes ---------------- */

          if (method === 'GET' && pathname === '/health') {
            sendJson(res, 200, {
              ok: true,
              mode: 'local',
              engine: 'sqlite',
              configured: isCredentialConfigured(getStore().db),
            });
            return;
          }

          if (method === 'GET' && pathname === '/auth/status') {
            const active = getStore();
            const session = readSession(active.db, bearer(req));
            const credential = session ? getCredential(active.db) : null;
            sendJson(res, 200, {
              ok: true,
              configured: isCredentialConfigured(active.db),
              signedIn: session !== null,
              address: credential?.address ?? '',
            });
            return;
          }

          if (method === 'POST' && pathname === '/auth/setup') {
            const active = getStore();
            if (isCredentialConfigured(active.db)) {
              sendJson(res, 409, { ok: false, error: 'Доступ уже настроен. Войдите и измените его.' });
              return;
            }
            const payload = parseJson(await readBody(req)) ?? {};
            const address = String(payload.address ?? '').trim().toLowerCase();
            const errors = validateCredentialInput({ address, password: payload.password });
            if (payload.password !== payload.confirm) errors.push('Пароли не совпадают.');
            if (errors.length > 0) {
              sendJson(res, 422, { ok: false, errors });
              return;
            }
            createCredential(active.db, address, String(payload.password));
            sendJson(res, 200, { ok: true, token: createSession(active.db), address });
            return;
          }

          if (method === 'POST' && pathname === '/auth/login') {
            const active = getStore();
            const payload = parseJson(await readBody(req)) ?? {};
            const address = String(payload.address ?? '').trim().toLowerCase();
            const credential = getCredential(active.db);
            const matches =
              credential !== null &&
              credential.address === address &&
              verifyPassword(String(payload.password ?? ''), credential.passwordHash);

            if (!matches) {
              sendJson(res, 401, { ok: false, error: CREDENTIAL_ERROR });
              return;
            }
            sendJson(res, 200, { ok: true, token: createSession(active.db), address });
            return;
          }

          if (method === 'POST' && pathname === '/auth/forgot') {
            await readBody(req);
            const active = getStore();
            if (!isCredentialConfigured(active.db)) {
              sendJson(res, 409, { ok: false, error: 'Доступ ещё не настроен.' });
              return;
            }
            clearCredential(active.db);
            sendJson(res, 200, {
              ok: true,
              cleared: true,
              note: 'Пароль удалён из локального файла. Настройки страницы сохранены.',
            });
            return;
          }

          if (method === 'GET' && pathname === '/content') {
            sendJson(res, 200, { ok: true, content: getStore().read() });
            return;
          }

          if (method === 'GET' && pathname === '/media') {
            sendJson(res, 200, { ok: true, items: listMedia(getStore().db) });
            return;
          }

          /* ---------------- session required ---------------- */

          if (!activeSession(req)) {
            if (method === 'POST' && pathname === '/auth/logout') {
              sendJson(res, 200, { ok: true });
              return;
            }
            sendJson(res, 401, { ok: false, error: 'Нужно войти в локальную панель.' });
            return;
          }

          if (method === 'POST' && pathname === '/auth/logout') {
            revokeSession(getStore().db, bearer(req));
            sendJson(res, 200, { ok: true });
            return;
          }

          if (method === 'POST' && pathname === '/auth/change') {
            const active = getStore();
            const payload = parseJson(await readBody(req)) ?? {};
            const credential = getCredential(active.db);
            if (!credential) {
              sendJson(res, 409, { ok: false, error: 'Сначала настройте доступ.' });
              return;
            }
            if (!verifyPassword(String(payload.currentPassword ?? ''), credential.passwordHash)) {
              sendJson(res, 403, { ok: false, error: 'Текущий пароль указан неверно.' });
              return;
            }
            const address = String(payload.address ?? credential.address).trim().toLowerCase();
            const errors = validateCredentialInput({ address, password: payload.newPassword });
            if (errors.length > 0) {
              sendJson(res, 422, { ok: false, errors });
              return;
            }
            createCredential(active.db, address, String(payload.newPassword));
            sendJson(res, 200, { ok: true, address });
            return;
          }

          if (method === 'PUT' && pathname === '/content') {
            const payload = parseJson(await readBody(req));
            const normalized = normalizeContent(payload?.content ?? payload);
            if (!normalized.ok) {
              sendJson(res, 422, { ok: false, errors: normalized.errors });
              return;
            }
            const saved = getStore().write(normalized.content);
            sendJson(res, 200, { ok: true, content: saved, savedAt: new Date().toISOString() });
            return;
          }

          if (method === 'POST' && pathname === '/reset') {
            const reset = getStore().reset();
            sendJson(res, 200, { ok: true, content: reset, savedAt: new Date().toISOString() });
            return;
          }

          if (method === 'POST' && pathname === '/upload') {
            const payload = parseJson(await readBody(req));
            const result = handleUpload(getStore(), payload);
            sendJson(res, result.status, result.body);
            return;
          }

          sendJson(res, 404, { ok: false, error: 'Такого метода нет.' });
        } catch (error) {
          server.config.logger.error(`[local-studio] ${error?.message ?? error}`);
          sendJson(res, 500, {
            ok: false,
            error: 'Локальная студия не смогла обработать запрос.',
            detail: error?.message ?? String(error),
          });
        }
      });
    },
  };
}
