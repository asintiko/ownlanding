import type { Field, GlobalConfig } from 'payload';
import { defaultContent } from '../data/defaultContent.js';
import { ICON_CATALOG } from '../lib/iconCatalog.js';
import { BODY_FONT_OPTIONS, DISPLAY_FONT_OPTIONS } from '../lib/fontOptions.js';
import { PLATFORMS } from '../lib/platformDetect.js';
import { safeURL } from '../lib/payload-content.js';
const urlField = (name: string, label: string, image = false, required = false): Field => ({ name, label, type: 'text', maxLength: 2048, validate: (value: unknown) => ((!required && !value) || (typeof value === 'string' && value.length <= 2048 && safeURL(value, image))) ? true : 'Укажите https://, http://, mailto:, tel: или локальный путь.', admin: { description: image ? 'Загрузка из медиатеки имеет приоритет над этой ссылкой.' : 'Полный адрес, например https://example.com' } });
const links = (social: boolean): Field => ({
  name: social ? 'socialLinks' : 'contentLinks', label: social ? 'Социальные сети' : 'Кнопки',
  type: 'array', maxRows: 100, labels: { singular: social ? 'соцсеть' : 'кнопку', plural: social ? 'Соцсети' : 'Кнопки' },
  admin: { initCollapsed: true, description: 'Нажмите на название, чтобы изменить кнопку. Добавляйте ссылки и перетаскивайте их, чтобы изменить порядок.', components: { RowLabel: '/components/payload/LinkRowLabel#LinkRowLabel' } },
  fields: [
    { name: 'label', label: social ? 'Название соцсети (необязательно)' : 'Название кнопки', type: 'text', required: !social, maxLength: 120 },
    { ...urlField('url', 'Ссылка', false, true), required: true } as Field,
    social ? { name: 'icon', label: 'Иконка соцсети', type: 'select', defaultValue: 'auto', options: [{ label: 'Определять по ссылке', value: 'auto' }, { label: 'Обычная ссылка', value: 'link' }, ...PLATFORMS.map(({ key, label }) => ({ value: key, label }))] } : {
      name: 'icon', label: 'Иконка кнопки', type: 'text', defaultValue: 'link', required: true,
      validate: (value: unknown) => ICON_CATALOG.some(icon => icon.key === value) || 'Выберите иконку из каталога.',
      admin: { components: { Field: '/components/payload/IconField#IconField' } },
    },
  ],
});
const colorLabels: Record<string, string> = { sandHigh: 'Фон: верх', sandMid: 'Фон: середина', sandLow: 'Фон: низ', onPhoto: 'Основной текст', onPhotoSoft: 'Описание', onPhotoMuted: 'Подпись', buttonSurface: 'Поверхность кнопок', ink: 'Текст кнопок', terracotta: 'Акцент', scrimTop: 'Затемнение фото: верх', scrimBottom: 'Затемнение фото: низ' };
const primaryColors = ['onPhoto', 'buttonSurface', 'ink', 'terracotta'];
const colorField = (name: string): Field => ({
  name, label: colorLabels[name], type: 'text', required: true,
  defaultValue: defaultContent.theme[name as keyof typeof defaultContent.theme],
  admin: { components: { Field: '/components/payload/ColorField#ColorField' } },
  validate: (value: unknown) => typeof value === 'string' && /^#(?:[\da-f]{6}|[\da-f]{8})$/i.test(value) || 'Выберите цвет или укажите код #RRGGBB.',
});

export const Site: GlobalConfig = {
  slug: 'site', label: 'Редактор сайта', admin: { group: 'Сайт', hideAPIURL: true },
  access: { read: ({ req }) => req.user ? true : { _status: { equals: 'published' } }, update: ({ req }) => Boolean(req.user), readVersions: ({ req }) => Boolean(req.user) },
  versions: { drafts: true, max: 30 },
  fields: [
    { type: 'tabs', tabs: [
      { label: 'Профиль', fields: [{ name: 'profile', label: 'Информация на странице', type: 'group', fields: [
        { name: 'name', label: 'Имя на странице', type: 'text', required: true, maxLength: 120, validate: (value: unknown) => typeof value === 'string' && value.trim().length > 0 && value.length <= 120 || 'Укажите имя длиной от 1 до 120 символов.' },
        { name: 'bio', label: 'Коротко о себе', type: 'textarea', maxLength: 2000, admin: { description: 'Несколько слов, которые посетители увидят под вашим именем.' } },
        { name: 'footerNote', label: 'Подпись внизу', type: 'text', maxLength: 250, admin: { description: 'Можно оставить пустой, чтобы убрать подпись.' } },
        { name: 'avatar', label: 'Аватарка', type: 'upload', relationTo: 'media', admin: { components: { Field: '/components/payload/PhotoField#PhotoField' } } },
        { name: 'background', label: 'Фон сайта', type: 'upload', relationTo: 'media', admin: { components: { Field: '/components/payload/PhotoField#PhotoField' } } },
        { type: 'collapsible', label: 'Дополнительные настройки изображений', admin: { initCollapsed: true }, fields: [urlField('avatarSrc', 'Ссылка на фотографию', true), urlField('backgroundSrc', 'Ссылка на фон', true)] },
      ] }] },
      { label: 'Кнопки', fields: [links(false)] },
      { label: 'Соцсети', fields: [links(true)] },
      { label: 'Внешний вид', fields: [{ name: 'theme', label: 'Цвета и шрифты', type: 'group', fields: [
        ...primaryColors.map(colorField),
        { name: 'fontDisplay', label: 'Шрифт имени', type: 'select', defaultValue: defaultContent.theme.fontDisplay, options: DISPLAY_FONT_OPTIONS.map(({ key, label }) => ({ value: key, label })) },
        { name: 'fontBody', label: 'Шрифт текста', type: 'select', defaultValue: defaultContent.theme.fontBody, options: BODY_FONT_OPTIONS.map(({ key, label }) => ({ value: key, label })) },
        { type: 'collapsible', label: 'Дополнительные цвета и затемнение', admin: { initCollapsed: true }, fields: Object.keys(colorLabels).filter(name => !primaryColors.includes(name)).map(colorField) },
      ] }] },
    ] },
    { name: 'preview', type: 'ui', admin: { components: { Field: '/components/payload/SitePreview#SitePreview' } } },
  ],
};
