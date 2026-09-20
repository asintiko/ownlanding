'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import LinkInBioCard from '../../../components/link-in-bio/LinkInBioCard';
import { normalizeSiteContent } from '../../../lib/payload-content';

type Content = ReturnType<typeof normalizeSiteContent>;
type Media = { id?: number | string; url?: string };

export default function PreviewClient({ initialContent }: { initialContent: Content }) {
  const [content, setContent] = useState(initialContent);
  const [destination, setDestination] = useState('');

  useEffect(() => {
    let revision = 0;
    let controller: AbortController | undefined;
    const mediaCache = new Map<string, Media>();

    const receive = async (event: MessageEvent) => {
      if (event.origin !== window.location.origin || event.source !== window.parent) return;
      if (event.data?.type === 'waka:preview-request') {
        window.parent.postMessage({ type: 'waka:preview-ready' }, window.location.origin);
        return;
      }
      if (event.data?.type !== 'waka:preview-update' || !event.data.data || typeof event.data.data !== 'object') return;
      const current = ++revision;
      controller?.abort();
      controller = new AbortController();
      const signal = controller.signal;
      const data = event.data.data;
      const profile = { ...data.profile };
      setContent(normalizeSiteContent(data));
      setDestination('');

      await Promise.all(['avatar', 'background'].map(async (field) => {
        const value = profile[field];
        if (!value || (typeof value === 'object' && value.url)) return;
        const id = typeof value === 'object' ? value.id : value;
        if (!id || !/^[a-zA-Z0-9_-]+$/.test(String(id))) return;
        const key = String(id);
        if (mediaCache.has(key)) {
          profile[field] = mediaCache.get(key);
          return;
        }
        try {
          const response = await fetch(`/api/media/${encodeURIComponent(key)}?depth=0`, { signal });
          if (!response.ok) return;
          const media: Media = await response.json();
          if (media.url) {
            mediaCache.set(key, media);
            profile[field] = media;
          }
        } catch {
          // Keep the existing image while a new selection is loading or unavailable.
        }
      }));
      if (current === revision) setContent(normalizeSiteContent({ ...data, profile }));
    };

    window.addEventListener('message', receive);
    window.parent.postMessage({ type: 'waka:preview-ready' }, window.location.origin);
    return () => {
      revision++;
      controller?.abort();
      window.removeEventListener('message', receive);
    };
  }, []);

  const inspectLink = (event: MouseEvent<HTMLDivElement>) => {
    const anchor = (event.target as Element).closest('a');
    if (!anchor) return;
    event.preventDefault();
    setDestination(anchor.getAttribute('href') || '');
  };

  return <div className="site-preview" onClickCapture={inspectLink}>
    <LinkInBioCard content={content} />
    {destination ? <output className="site-preview__destination" aria-live="polite">Адрес ссылки: {destination}</output> : null}
  </div>;
}
