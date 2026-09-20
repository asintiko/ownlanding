import type { CollectionConfig } from 'payload';
import path from 'node:path';
export const Media: CollectionConfig = {
  slug: 'media', labels: { singular: 'Изображение', plural: 'Медиатека' },
  admin: { group: 'Сайт', useAsTitle: 'alt', defaultColumns: ['filename', 'alt'] },
  access: { read: () => true, create: ({ req }) => Boolean(req.user), update: ({ req }) => Boolean(req.user), delete: ({ req }) => Boolean(req.user) },
  upload: { staticDir: path.resolve(process.cwd(), 'media'), mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'], imageSizes: [{ name: 'thumbnail', width: 320, height: 320, position: 'centre' }], adminThumbnail: 'thumbnail' },
  fields: [{ name: 'alt', label: 'Описание изображения', type: 'text', required: true, maxLength: 250 }],
};
