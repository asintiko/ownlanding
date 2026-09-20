import LinkInBioCard from '../components/link-in-bio/LinkInBioCard';
import { useSiteContent } from '../hooks/useSiteContent';

/** The link-in-bio page — a single card that holds every destination. */
export default function HomePage() {
  const { content } = useSiteContent();

  return <LinkInBioCard content={content} />;
}
