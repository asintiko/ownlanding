/**
 * Where the local session token lives.
 *
 * The token is issued by the console server running on this machine and is kept
 * in this browser profile only. It grants access to the local write API; it is
 * not an account, and nothing about it survives the project being closed down.
 */

const STORAGE_KEY = 'katy-delma-studio-token';

export function getToken() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setToken(token) {
  try {
    if (token) window.localStorage.setItem(STORAGE_KEY, token);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable: the console stays usable for reading, writes will 401 */
  }
}

export function clearToken() {
  setToken('');
}
