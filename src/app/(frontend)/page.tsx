import { cache } from 'react';
import LinkInBioCard from '../../components/link-in-bio/LinkInBioCard';
import { getSiteContent } from '../../lib/payload-server';

export const dynamic = 'force-dynamic';
const readContent = cache(getSiteContent);

export async function generateMetadata() {
  const { profile } = await readContent();
  return { title: `${profile.name} · Links`, description: profile.bio };
}

export default async function HomePage() {
  const content = await readContent();
  return <LinkInBioCard content={content} />;
}
