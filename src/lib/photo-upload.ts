type UploadHandler = (args: { file: File; updateFilename: (filename: string) => void }) => Promise<unknown>;

export async function photoUploadBody(file: File, alt: string, handler: UploadHandler | null | undefined, signal: AbortSignal) {
  const body = new FormData();
  body.set('_payload', JSON.stringify({ alt: alt.slice(0, 250) }));
  if (handler) {
    let filename = file.name;
    const clientUploadContext = await handler({ file, updateFilename: next => { filename = next; } });
    signal.throwIfAborted();
    body.set('file', JSON.stringify({ clientUploadContext, collectionSlug: 'media', filename, mimeType: file.type, size: file.size }));
  } else {
    signal.throwIfAborted();
    body.set('file', file);
  }
  return body;
}
