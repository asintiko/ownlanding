import assert from 'node:assert/strict';
import test from 'node:test';
import { photoUploadBody } from '../src/lib/photo-upload.ts';
import { Users } from '../src/collections/Users.ts';

test('cloud uploads send a small signed receipt instead of the image bytes', async () => {
  const file = new File([new Uint8Array(6 * 1024 * 1024)], 'portrait.png', { type: 'image/png' });
  const body = await photoUploadBody(file, 'Portrait', async ({ file: input, updateFilename }) => {
    assert.equal(input, file);
    updateFilename('portrait-unique.png');
    return { signedReceipt: 'verified-receipt', prefix: '' };
  }, new AbortController().signal);
  assert.equal(typeof body.get('file'), 'string');
  assert.ok(body.get('file').length < 1024);
  assert.deepEqual(JSON.parse(body.get('file')), {
    clientUploadContext: { signedReceipt: 'verified-receipt', prefix: '' },
    collectionSlug: 'media', filename: 'portrait-unique.png', mimeType: 'image/png', size: file.size,
  });
  assert.deepEqual(JSON.parse(body.get('_payload')), { alt: 'Portrait' });
});

test('local upload still sends the original file', async () => {
  const file = new File(['photo'], 'portrait.png', { type: 'image/png' });
  const body = await photoUploadBody(file, 'Portrait', null, new AbortController().signal);
  assert.equal(await body.get('file').text(), 'photo');
});

test('an aborted direct upload cannot proceed to create a media record', async () => {
  const controller = new AbortController();
  await assert.rejects(photoUploadBody(new File(['photo'], 'portrait.png'), 'Portrait', async () => {
    controller.abort();
    return {};
  }, controller.signal), { name: 'AbortError' });
});

test('cloud first-user registration is blocked, while private bootstrap and administrators can create users', () => {
  const previous = process.env.VERCEL;
  process.env.VERCEL = '1';
  try {
    const guard = Users.hooks.beforeChange[0];
    assert.throws(() => guard({ operation: 'create', req: { context: {} }, data: {} }), { status: 403 });
    assert.throws(() => guard({ operation: 'create', req: { context: {} }, data: { bootstrapAdmin: true } }), { status: 403 });
    assert.deepEqual(guard({ operation: 'create', req: { context: { bootstrapAdmin: true } }, data: { name: 'Admin' } }), { name: 'Admin' });
    assert.deepEqual(guard({ operation: 'create', req: { context: {}, user: { id: 1 } }, data: {} }), {});
  } finally {
    if (previous === undefined) delete process.env.VERCEL;
    else process.env.VERCEL = previous;
  }
});
