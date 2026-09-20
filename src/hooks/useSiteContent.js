import { useEffect, useState } from 'react';
import { bundledContent } from '../lib/siteContent';
import { fetchContent } from '../lib/contentApi';

/**
 * Content for the public page.
 *
 * It starts from the snapshot baked into the bundle and is refreshed from the
 * local studio when that studio is running. On a published static build the
 * refresh simply fails and the baked snapshot stays, so the page always renders.
 *
 * @returns {{ content: object, origin: 'bundled' | 'local-studio' }}
 */
export function useSiteContent() {
  const [content, setContent] = useState(bundledContent);
  const [origin, setOrigin] = useState('bundled');

  useEffect(() => {
    let alive = true;

    fetchContent().then((live) => {
      if (!alive || !live) return;
      setContent(live);
      setOrigin('local-studio');
    });

    return () => {
      alive = false;
    };
  }, []);

  return { content, origin };
}
