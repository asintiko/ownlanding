import { withPayload } from '@payloadcms/next/withPayload';
export default withPayload({
  distDir: process.env.NEXT_DIST_DIR || '.next',
  turbopack: { root: process.cwd() },
  serverExternalPackages: ['node:sqlite'],
  experimental: { serverActions: { bodySizeLimit: '12mb' } },
});
