'use client';

import { useFormFields, useFormModified } from '@payloadcms/ui';
import { reduceFieldsToValues } from 'payload/shared';
import { useEffect, useMemo, useRef, useState } from 'react';

export function SitePreview() {
  const fields = useFormFields(([formFields]) => formFields);
  const modified = useFormModified();
  const data = useMemo(() => reduceFieldsToValues(fields, true), [fields]);
  const frame = useRef<HTMLIFrameElement>(null);
  const latest = useRef(data);
  const ready = useRef(false);
  const [connected, setConnected] = useState(false);
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  useEffect(() => {
    latest.current = data;
    const timeout = window.setTimeout(() => {
      if (ready.current) frame.current?.contentWindow?.postMessage({ type: 'waka:preview-update', data }, window.location.origin);
    }, 150);
    return () => window.clearTimeout(timeout);
  }, [data]);

  useEffect(() => {
    function receive(event: MessageEvent<unknown>) {
      if (event.origin !== window.location.origin || event.source !== frame.current?.contentWindow) return;
      if (!event.data || typeof event.data !== 'object' || !('type' in event.data) || event.data.type !== 'waka:preview-ready') return;
      ready.current = true;
      setConnected(true);
      frame.current?.contentWindow?.postMessage({ type: 'waka:preview-update', data: latest.current }, window.location.origin);
    }
    window.addEventListener('message', receive);
    frame.current?.contentWindow?.postMessage({ type: 'waka:preview-request' }, window.location.origin);
    return () => window.removeEventListener('message', receive);
  }, []);

  return (
    <section className="waka-preview" aria-labelledby="waka-preview-title">
      <div className="waka-preview__header">
        <div><p className="waka-eyebrow">Проверьте перед публикацией</p><h2 id="waka-preview-title">Как будет выглядеть сайт</h2><p className="waka-muted">Здесь сразу видно ваши изменения. Когда всё готово, нажмите «Опубликовать изменения».</p></div>
        <a href="/" target="_blank" rel="noreferrer" className="waka-text-link">Открыть сайт ↗</a>
      </div>
      <div className="waka-preview__toolbar">
        <div className="waka-preview__devices" role="group" aria-label="Размер предпросмотра">
          <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>Телефон</button>
          <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>Компьютер</button>
        </div>
        <span className="waka-preview__status" aria-live="polite">{!connected ? 'Подключаем предпросмотр…' : modified ? 'Есть несохранённые изменения' : 'Все изменения сохранены'}</span>
      </div>
      <div className={`waka-preview__canvas waka-preview__canvas--${device}`}>
        <iframe ref={frame} src="/preview" title="Предпросмотр сайта с текущими настройками" className="waka-preview__frame" onLoad={() => {
          ready.current = false;
          setConnected(false);
          frame.current?.contentWindow?.postMessage({ type: 'waka:preview-request' }, window.location.origin);
        }} />
      </div>
    </section>
  );
}
