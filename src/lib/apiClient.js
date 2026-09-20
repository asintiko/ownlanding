/**
 * Shared transport for the local console API.
 *
 * A non-JSON response means a static host served the SPA document instead of an
 * API, i.e. the console server is not running here; callers get `offline` and
 * fall back to the baked-in snapshot rather than showing a broken form.
 */

import { getToken } from './session.js';

export const API_BASE = '/api';

export function authHeaders(withBody = false) {
  const token = getToken();
  const headers = withBody ? { 'Content-Type': 'application/json' } : {};
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
}

export async function requestJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...options,
    headers: { ...(options.headers ?? {}) },
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return { ok: false, offline: true, status: response.status };
  }

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    return { ok: false, offline: true, status: response.status };
  }

  return { ...payload, status: response.status, unauthorized: response.status === 401 };
}

/** Normalise a failed API response into a list of human-readable problems. */
export function errorLines(result, fallback) {
  if (Array.isArray(result?.errors) && result.errors.length > 0) return result.errors;
  if (result?.error) return [result.error];
  return [fallback];
}
