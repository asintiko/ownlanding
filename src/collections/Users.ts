import type { CollectionConfig } from 'payload';
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
  fields: [{ name: 'name', type: 'text', label: 'Имя', maxLength: 120 }],
};
