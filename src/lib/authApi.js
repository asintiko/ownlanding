/**
 * Local credential calls.
 *
 * The credential is stored in the project's own SQLite file and checked by the
 * console server on this machine. There is no account, no password e-mail and no
 * recovery service: "Забыли пароль?" performs a real local reset that clears the
 * credential and keeps every page setting.
 */

import { requestJson, authHeaders, errorLines } from './apiClient.js';
import { clearToken, setToken } from './session.js';

const GENERIC_FALLBACK = 'Не удалось связаться с локальной панелью.';

/** Is a credential configured yet, and is the local server reachable at all? */
export async function fetchAuthStatus() {
  const result = await requestJson('/auth/status', { headers: authHeaders() }).catch(() => ({
    ok: false,
    offline: true,
  }));
  return {
    ok: result.ok === true,
    configured: result.configured === true,
    signedIn: result.signedIn === true,
    address: typeof result.address === 'string' ? result.address : '',
    offline: result.offline === true,
  };
}

export async function signIn({ address, password }) {
  const result = await requestJson('/auth/login', {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ address, password }),
  }).catch(() => ({ ok: false, offline: true }));

  if (result.ok && result.token) {
    setToken(result.token);
    return { ok: true, address: result.address };
  }
  if (result.offline) {
    return { ok: false, offline: true, errors: ['Локальная панель недоступна: запустите проект на этом компьютере.'] };
  }
  return { ok: false, errors: errorLines(result, GENERIC_FALLBACK) };
}

export async function createCredential({ address, password, confirm }) {
  const result = await requestJson('/auth/setup', {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ address, password, confirm }),
  }).catch(() => ({ ok: false, offline: true }));

  if (result.ok && result.token) {
    setToken(result.token);
    return { ok: true, address: result.address };
  }
  return { ok: false, errors: errorLines(result, GENERIC_FALLBACK) };
}

export async function signOut() {
  await requestJson('/auth/logout', { method: 'POST', headers: authHeaders() }).catch(() => null);
  clearToken();
  return { ok: true };
}

/** The local reset: clears the credential only. */
export async function resetCredentialLocally() {
  const result = await requestJson('/auth/forgot', { method: 'POST', headers: authHeaders() })
    .catch(() => ({ ok: false, offline: true }));

  if (result.ok) {
    clearToken();
    return { ok: true, note: result.note ?? 'Пароль удалён из локального файла.' };
  }
  return { ok: false, errors: errorLines(result, GENERIC_FALLBACK) };
}

export async function changeCredential({ currentPassword, address, newPassword }) {
  const result = await requestJson('/auth/change', {
    method: 'POST',
    headers: authHeaders(true),
    body: JSON.stringify({ currentPassword, address, newPassword }),
  }).catch(() => ({ ok: false, offline: true }));

  if (result.ok) return { ok: true, address: result.address };
  return { ok: false, errors: errorLines(result, GENERIC_FALLBACK) };
}
