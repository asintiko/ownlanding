import { randomBytes } from 'node:crypto';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
if (process.env.PAYLOAD_QA !== '1') throw new Error('Run only against an isolated QA database with PAYLOAD_QA=1.');
const base = process.env.QA_URL || 'http://localhost:3000';
async function api(path, data, token, method = data ? 'POST' : 'GET') {
 const response = await fetch(base + '/api/' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `JWT ${token}` } : {}) }, ...(data ? { body: JSON.stringify(data) } : {}) });
 const json = await response.json(); return { status: response.status, json };
}
const credentials = existsSync('data/qa-account.json') ? JSON.parse(readFileSync('data/qa-account.json')) : { email: 'qa@localhost.test', password: randomBytes(24).toString('hex') };
writeFileSync('data/qa-account.json', JSON.stringify(credentials), { mode: 0o600 });
const init = await api('users/init');
if (!init.json.initialized) { const register = await api('users/first-register', credentials); assert.equal(register.status, 200, JSON.stringify(register.json)); }
const login = await api('users/login', credentials); assert.equal(login.status, 200); const token = login.json.token;
const initial = (await api('globals/site')).json;
assert.equal(initial.profile.name, 'Katy Delma');
assert.equal((await api('globals/site', { profile: { name: 'Unauthorized' } })).status, 403);
const draft = await api('globals/site?draft=true', { profile: { ...initial.profile, name: 'QA unpublished draft' }, _status: 'draft' }, token); assert.equal(draft.status, 200, JSON.stringify(draft.json));
assert.equal((await api('globals/site')).json.profile.name, initial.profile.name);
assert.equal((await api('globals/site?draft=true')).json.profile.name, initial.profile.name);
assert.equal((await api('globals/site?draft=true', null, token)).json.profile.name, 'QA unpublished draft');
const invalid = await api('globals/site', { contentLinks: [{ label: 'Unsafe', url: 'javascript:alert(1)', icon: 'link' }] }, token); assert.equal(invalid.status, 400);
const empty = await api('globals/site', { contentLinks: [{ label: 'Blank', url: '', icon: 'link' }] }, token); assert.equal(empty.status, 400);
const updated = await api('globals/site', { ...initial, contentLinks: [...initial.contentLinks, { label: 'QA new link', url: 'https://example.com/test', icon: 'camera' }], _status: 'published' }, token); assert.equal(updated.status, 200, JSON.stringify(updated.json));
assert.equal((await api('globals/site')).json.contentLinks.at(-1).label, 'QA new link');
const restore = await api('globals/site', { ...initial, _status: 'published' }, token); assert.equal(restore.status, 200);
console.log('API QA passed: auth, unauthorized write, draft isolation, unsafe/empty URL rejection, publish and restore. Credentials saved only in ignored data/qa-account.json.');

const form = new FormData();
form.set('_payload', JSON.stringify({ alt: 'QA image' }));
form.set('file', new Blob([readFileSync('public/assets/images/katy-delma-avatar.jpg')], { type: 'image/jpeg' }), 'qa-avatar.jpg');
const upload = await fetch(base + '/api/media', { method: 'POST', headers: { Authorization: `JWT ${token}` }, body: form });
assert.equal(upload.status, 201);
const media = (await upload.json()).doc;
assert.equal((await fetch(new URL(media.url, base))).status, 200);
assert.equal((await api('media/' + media.id, null, null, 'DELETE')).status, 403);
assert.equal((await api('media/' + media.id, null, token, 'DELETE')).status, 200);
console.log('Media QA passed: image upload, public file read, protected delete, cleanup.');
