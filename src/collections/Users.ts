import { APIError, type CollectionConfig } from 'payload';
export const Users: CollectionConfig = {
  slug: 'users', labels: { singular: 'Администратор', plural: 'Администраторы' },
  admin: { useAsTitle: 'email', group: 'Настройки' },
  auth: { tokenExpiration: 7200, maxLoginAttempts: 5, lockTime: 600000 },
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    beforeChange: [({ operation, req, data }) => {
      const databaseURI = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URI;
      const cloud = Boolean(process.env.VERCEL) || Boolean(databaseURI && !databaseURI.startsWith('file:'));
      if (cloud && operation === 'create' && !req.user && req.context?.bootstrapAdmin !== true) {
        throw new APIError('Administrator registration is disabled. Use the private bootstrap command.', 403);
      }
      return data;
    }],
  },
  fields: [{ name: 'name', type: 'text', label: 'Имя', maxLength: 120 }],
};
