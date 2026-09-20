'use client';

import { useRowLabel } from '@payloadcms/ui';

export function LinkRowLabel() {
  const { data, path } = useRowLabel<{ label?: string; url?: string }>();
  return <span>{data?.label?.trim() || data?.url?.trim() || (path.startsWith('socialLinks') ? 'Новая соцсеть' : 'Новая кнопка')}</span>;
}
