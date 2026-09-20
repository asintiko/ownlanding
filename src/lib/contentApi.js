/**
 * Thin client for the local console API.
 *
 * The API only exists while the project runs locally. On a published static
 * build every call fails fast and the caller falls back to the baked-in
 * snapshot, so the public page never depends on a server being reachable.
 * Reading content is open; every write carries the local session token.
 */

import { requestJson, authHeaders } from './apiClient.js';

/** Whether the local console server is answering. */
export async function probeStudio() {
  try {
    const result = await requestJson('/health');
    return result.ok === true;
  } catch {
    return false;
  }
}

/** Read the saved content, or `null` when the console is not reachable. */
export async function fetchContent() {
  try {
    const result = await requestJson('/content');
    return result.ok && result.content ? result.content : null;
  } catch {
    return null;
  }
}

/**
 * Persist the whole edited state.
 *
 * @param {object} content
 */
export async function saveContent(content) {
  try {
    const result = await requestJson('/content', {
      method: 'PUT',
      headers: authHeaders(true),
      body: JSON.stringify({ content }),
    });
    if (result.ok) return { ok: true, content: result.content };
    if (result.offline) {
      return { ok: false, offline: true, errors: ['Локальная студия недоступна.'] };
    }
    if (result.unauthorized) {
      return { ok: false, unauthorized: true, errors: ['Сессия истекла. Войдите снова.'] };
    }
    return {
      ok: false,
      errors: result.errors ?? [result.error ?? 'Не удалось сохранить изменения.'],
    };
  } catch {
    return { ok: false, offline: true, errors: ['Локальная студия недоступна.'] };
  }
}

/** Restore the shipped defaults. */
export async function resetContent() {
  try {
    const result = await requestJson('/reset', { method: 'POST', headers: authHeaders() });
    if (result.ok) return { ok: true, content: result.content };
    if (result.unauthorized) {
      return { ok: false, unauthorized: true, errors: ['Сессия истекла. Войдите снова.'] };
    }
    return { ok: false, errors: [result.error ?? 'Не удалось сбросить данные.'] };
  } catch {
    return { ok: false, offline: true, errors: ['Локальная студия недоступна.'] };
  }
}

/**
 * Upload an image and return its public path.
 *
 * @param {File} file
 */
export async function uploadImage(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Файл не удалось прочитать.'));
    reader.readAsDataURL(file);
  }).catch(() => '');

  if (!dataUrl) return { ok: false, error: 'Файл не удалось прочитать.' };

  try {
    const result = await requestJson('/upload', {
      method: 'POST',
      headers: authHeaders(true),
      body: JSON.stringify({ filename: file.name, dataUrl }),
    });
    if (result.ok && result.path) return { ok: true, path: result.path };
    if (result.offline) return { ok: false, error: 'Локальная студия недоступна — файл не сохранён.' };
    if (result.unauthorized) return { ok: false, error: 'Сессия истекла. Войдите снова.' };
    return { ok: false, error: result.error ?? 'Файл не удалось загрузить.' };
  } catch {
    return { ok: false, error: 'Локальная студия недоступна — файл не сохранён.' };
  }
}

/** Images uploaded so far, newest first. */
export async function fetchMedia() {
  try {
    const result = await requestJson('/media');
    return result.ok && Array.isArray(result.items) ? result.items : [];
  } catch {
    return [];
  }
}
