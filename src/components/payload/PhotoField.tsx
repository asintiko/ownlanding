'use client';

import { useDocumentInfo, useField, useForm, useFormFields, useListDrawer } from '@payloadcms/ui';
import { Images, Upload } from 'lucide-react';
import Image from 'next/image';
import type { UploadFieldClientProps } from 'payload';
import { useEffect, useId, useRef, useState } from 'react';
import type { Media } from '../../payload-types';
import { safeURL } from '../../lib/payload-content.js';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 10 * 1024 * 1024;
class PhotoUploadError extends Error {}

export function PhotoField(props: UploadFieldClientProps) {
  const { value, setValue, path, disabled, formProcessing, showError, errorMessage } = useField<number | string | null>({
    potentiallyStalePath: props.path,
  });
  const fallback = useFormFields(([fields]) => fields[`${path}Src`]?.value);
  const { setProcessing } = useForm();
  const { setUploadStatus } = useDocumentInfo();
  const [ListDrawer, , { openDrawer, closeDrawer }] = useListDrawer({
    collectionSlugs: ['media'], selectedCollection: 'media', uploads: true,
  });
  const [media, setMedia] = useState<Media | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadController = useRef<AbortController | null>(null);
  const id = useId();
  const avatar = path.endsWith('.avatar');
  const label = avatar ? 'Аватарка' : 'Фон сайта';
  const inactive = Boolean(props.readOnly || disabled || formProcessing || uploading);
  const selectedMedia = media && String(media.id) === String(value) ? media : null;
  const imageURL = safeURL(selectedMedia?.url || fallback, true);

  useEffect(() => {
    if (!value) return;
    const controller = new AbortController();
    fetch(`/api/media/${encodeURIComponent(String(value))}?depth=0`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error('Не удалось загрузить фотографию. Попробуйте выбрать её снова.');
        return response.json() as Promise<Media>;
      })
      .then(setMedia)
      .catch((reason: Error) => { if (!controller.signal.aborted) setError(reason.message); });
    return () => controller.abort();
  }, [value]);

  useEffect(() => () => uploadController.current?.abort(), []);

  async function upload(file: File) {
    if (inactive) return;
    setError('');
    setNotice('');
    if (!IMAGE_TYPES.includes(file.type)) {
      setError('Выберите фотографию JPG, PNG, WebP или AVIF.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Файл слишком большой. Выберите изображение до 10 МБ.');
      return;
    }
    setUploading(true);
    setProcessing(true);
    setUploadStatus?.('uploading');
    const controller = new AbortController();
    uploadController.current = controller;
    const timeout = window.setTimeout(() => controller.abort(), 60000);
    try {
      const body = new FormData();
      body.set('_payload', JSON.stringify({ alt: `${label}: ${file.name}`.slice(0, 250) }));
      body.set('file', file);
      const response = await fetch('/api/media', { method: 'POST', body, signal: controller.signal });
      if (response.status === 401 || response.status === 403) throw new PhotoUploadError('Войдите в админку снова, чтобы загрузить фотографию.');
      const result = await response.json();
      if (!response.ok || !result.doc?.id) throw new PhotoUploadError('Не удалось загрузить фотографию. Попробуйте ещё раз.');
      setMedia(result.doc);
      setValue(result.doc.id);
      setNotice('Фото загружено. Проверьте результат внизу и нажмите «Опубликовать изменения».');
    } catch (reason) {
      setError(reason instanceof PhotoUploadError ? reason.message : 'Не удалось загрузить фотографию. Проверьте подключение и попробуйте ещё раз.');
    } finally {
      window.clearTimeout(timeout);
      uploadController.current = null;
      setUploading(false);
      setProcessing(false);
      setUploadStatus?.('idle');
    }
  }

  return <section className="waka-photo-field field-type" aria-labelledby={`${id}-label`} aria-busy={uploading}>
    <h3 id={`${id}-label`}>{label}</h3>
    <p className="waka-muted">{avatar ? 'Круглая фотография рядом с вашим именем.' : 'Большая фотография за текстом и кнопками.'}</p>
    <div className="waka-photo-field__body">
      <div className={`waka-photo-field__preview${avatar ? ' waka-photo-field__preview--avatar' : ''}`}>
        {imageURL ? <Image src={imageURL} alt={label} width={320} height={200} unoptimized /> : <span>Фото ещё не выбрано</span>}
      </div>
      <div className="waka-photo-field__actions">
        <input ref={fileInput} type="file" accept={IMAGE_TYPES.join(',')} hidden onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) void upload(file);
        }} />
        <button type="button" className="waka-photo-field__upload" disabled={inactive} onClick={() => fileInput.current?.click()} aria-label={`Загрузить своё фото — ${label.toLowerCase()}`}>
          <Upload size={18} aria-hidden="true" />{uploading ? 'Загружаем фото…' : 'Загрузить своё фото'}
        </button>
        <button type="button" disabled={inactive} onClick={openDrawer} aria-label={`Выбрать из медиатеки — ${label.toLowerCase()}`}>
          <Images size={18} aria-hidden="true" />Выбрать из медиатеки
        </button>
        <small className="waka-muted">С компьютера или телефона · JPG, PNG, WebP, AVIF · до 10 МБ</small>
      </div>
    </div>
    {notice ? <p className="waka-photo-field__notice" role="status">{notice}</p> : null}
    {error || showError ? <p className="waka-field-error" role="alert">{error || errorMessage}</p> : null}
    <ListDrawer allowCreate={false} enableRowSelections={false} onSelect={({ doc }) => {
      if (inactive) return;
      setValue(doc.id);
      setError('');
      setNotice('Фото выбрано. Проверьте результат внизу и нажмите «Опубликовать изменения».');
      closeDrawer();
    }} />
  </section>;
}
