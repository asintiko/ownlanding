import { getPayload } from 'payload';
import config from '../payload.config';
import { importProfileMedia } from './import-profile-media';
const payload = await getPayload({ config });
try {
  const site = await payload.findGlobal({ slug: 'site', draft: false, depth: 0 });
  const profile = await importProfileMedia(payload, site.profile);
  if (profile.avatar !== site.profile.avatar || profile.background !== site.profile.background) {
    await payload.updateGlobal({ slug: 'site', data: { profile, _status: 'published' }, draft: false });
    payload.logger.info('Existing page images are now available in the media library.');
  }
} finally {
  await payload.destroy();
}
