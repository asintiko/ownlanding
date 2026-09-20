/**
 * The icon database for content buttons.
 *
 * Pure data, dependency-free: the browser maps each key to a glyph component in
 * `components/icons/glyphs.jsx`; validation only needs the key list. Keys are
 * stored with the content, so they must never be renamed once shipped — the
 * original five (`journal`, `compass`, `tent`, `camera`, `link`) stay as they are.
 */

export const ICON_GROUPS = [
  {
    id: 'travel',
    label: 'Путешествия',
    icons: [
      { key: 'compass', label: 'Компас' },
      { key: 'map', label: 'Карта' },
      { key: 'map-pin', label: 'Метка на карте' },
      { key: 'globe', label: 'Глобус' },
      { key: 'plane', label: 'Самолёт' },
      { key: 'tent', label: 'Палатка' },
      { key: 'mountain', label: 'Горы' },
      { key: 'backpack', label: 'Рюкзак' },
      { key: 'route', label: 'Маршрут' },
      { key: 'luggage', label: 'Чемодан' },
      { key: 'binoculars', label: 'Бинокль' },
      { key: 'signpost', label: 'Указатель' },
      { key: 'ship', label: 'Корабль' },
      { key: 'car', label: 'Автомобиль' },
      { key: 'bike', label: 'Велосипед' },
      { key: 'footprints', label: 'Следы' },
      { key: 'hotel', label: 'Отель' },
      { key: 'landmark', label: 'Достопримечательность' },
    ],
  },
  {
    id: 'nature',
    label: 'Природа',
    icons: [
      { key: 'sun', label: 'Солнце' },
      { key: 'sunrise', label: 'Рассвет' },
      { key: 'waves', label: 'Волны' },
      { key: 'palm', label: 'Пальма' },
      { key: 'snowflake', label: 'Снежинка' },
      { key: 'leaf', label: 'Лист' },
      { key: 'trees', label: 'Лес' },
      { key: 'flower', label: 'Цветок' },
      { key: 'cloud', label: 'Облако' },
      { key: 'moon', label: 'Луна' },
      { key: 'flame', label: 'Костёр' },
      { key: 'fish', label: 'Рыба' },
    ],
  },
  {
    id: 'content',
    label: 'Контент',
    icons: [
      { key: 'camera', label: 'Камера' },
      { key: 'video', label: 'Видео' },
      { key: 'film', label: 'Кино' },
      { key: 'image', label: 'Фотография' },
      { key: 'music', label: 'Музыка' },
      { key: 'mic', label: 'Микрофон' },
      { key: 'headphones', label: 'Наушники' },
      { key: 'podcast', label: 'Подкаст' },
      { key: 'pen', label: 'Перо' },
      { key: 'palette', label: 'Палитра' },
      { key: 'book', label: 'Книга' },
      { key: 'journal', label: 'Журнал' },
      { key: 'newspaper', label: 'Газета' },
      { key: 'feather', label: 'Пёрышко' },
      { key: 'file', label: 'Документ' },
      { key: 'tv', label: 'Телевизор' },
      { key: 'radio', label: 'Радио' },
      { key: 'play', label: 'Воспроизвести' },
    ],
  },
  {
    id: 'shop',
    label: 'Покупки',
    icons: [
      { key: 'bag', label: 'Сумка' },
      { key: 'cart', label: 'Корзина' },
      { key: 'tag', label: 'Ценник' },
      { key: 'gift', label: 'Подарок' },
      { key: 'percent', label: 'Скидка' },
      { key: 'store', label: 'Магазин' },
      { key: 'package', label: 'Посылка' },
      { key: 'wallet', label: 'Кошелёк' },
      { key: 'ticket', label: 'Билет' },
      { key: 'shirt', label: 'Одежда' },
    ],
  },
  {
    id: 'contact',
    label: 'Связь',
    icons: [
      { key: 'mail', label: 'Почта' },
      { key: 'message', label: 'Сообщение' },
      { key: 'phone', label: 'Телефон' },
      { key: 'send', label: 'Отправить' },
      { key: 'calendar', label: 'Календарь' },
      { key: 'clock', label: 'Часы' },
      { key: 'bell', label: 'Колокольчик' },
      { key: 'users', label: 'Сообщество' },
      { key: 'handshake', label: 'Партнёрство' },
      { key: 'megaphone', label: 'Анонс' },
    ],
  },
  {
    id: 'general',
    label: 'Общее',
    icons: [
      { key: 'link', label: 'Нейтральная ссылка' },
      { key: 'external', label: 'Внешняя ссылка' },
      { key: 'download', label: 'Скачать' },
      { key: 'sparkles', label: 'Искры' },
      { key: 'zap', label: 'Молния' },
      { key: 'heart', label: 'Сердце' },
      { key: 'star', label: 'Звезда' },
      { key: 'award', label: 'Награда' },
      { key: 'trophy', label: 'Кубок' },
      { key: 'rocket', label: 'Ракета' },
      { key: 'lightbulb', label: 'Идея' },
      { key: 'bookmark', label: 'Закладка' },
      { key: 'home', label: 'Дом' },
      { key: 'briefcase', label: 'Портфель' },
      { key: 'graduation', label: 'Обучение' },
      { key: 'coffee', label: 'Кофе' },
      { key: 'utensils', label: 'Еда' },
      { key: 'dumbbell', label: 'Спорт' },
      { key: 'shield', label: 'Защита' },
      { key: 'crown', label: 'Корона' },
      { key: 'gem', label: 'Драгоценность' },
      { key: 'key', label: 'Ключ' },
      { key: 'flag', label: 'Флаг' },
      { key: 'pin', label: 'Кнопка' },
    ],
  },
];

/** Every icon in catalogue order. */
export const ICON_CATALOG = ICON_GROUPS.flatMap((group) =>
  group.icons.map((icon) => ({ ...icon, group: group.id }))
);

/** Every stored key. */
export const CONTENT_ICON_KEYS = ICON_CATALOG.map((icon) => icon.key);

/** Russian label of a key, or `null` for an unknown key. */
export function iconLabel(key) {
  return ICON_CATALOG.find((icon) => icon.key === key)?.label ?? null;
}

export function isKnownIcon(key) {
  return CONTENT_ICON_KEYS.includes(key);
}

/** Case-insensitive filter by Russian label, key or group name. */
export function searchIcons(query) {
  const needle = String(query ?? '').trim().toLowerCase();
  if (!needle) return ICON_CATALOG;
  return ICON_CATALOG.filter((icon) => {
    const group = ICON_GROUPS.find((item) => item.id === icon.group);
    return (
      icon.label.toLowerCase().includes(needle) ||
      icon.key.includes(needle) ||
      (group?.label.toLowerCase().includes(needle) ?? false)
    );
  });
}
