import { getSiteContent } from '../../../lib/payload-server';
import PreviewClient from './PreviewClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Предосмотр сайта', robots: { index: false, follow: false } };

export default async function PreviewPage() {
  return <PreviewClient initialContent={await getSiteContent()} />;
}
