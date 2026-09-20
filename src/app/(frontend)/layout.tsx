import type { ReactNode } from 'react';
import './site.css';

export default function SiteLayout({ children }: { children: ReactNode }) {
  return <html lang="ru"><body>{children}</body></html>;
}
