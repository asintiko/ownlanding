import 'server-only';
import { getPayload } from 'payload';
import config from '@payload-config';
import { normalizeSiteContent } from './payload-content.js';
export async function getSiteContent() {
  const payload = await getPayload({ config });
  const doc = await payload.findGlobal({ slug: 'site', depth: 1, draft: false, overrideAccess: false });
  return normalizeSiteContent(doc);
}
