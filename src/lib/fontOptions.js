/**
 * Typeface options for the public page.
 *
 * System font stacks only — no font CDN, no downloaded webfont files, no
 * `@import`. Every family offered carries Cyrillic, so a Cyrillic name, bio or
 * caption renders in the chosen face instead of silently falling back to a
 * different-looking one, and every stack ends in a generic family.
 *
 * Changing an option changes ONLY the family. Size, weight, line height,
 * tracking and colour stay with the slot's own typography token.
 */

export const DISPLAY_FONT_OPTIONS = [
  {
    key: 'font-display-georgia',
    label: '«Джорджия»',
    character: 'Тёплая журнальная антиква — текущий вид страницы.',
    stack: 'Georgia, "Times New Roman", "Songti SC", serif',
  },
  {
    key: 'font-display-times',
    label: '«Таймс»',
    character: 'Строгая классическая антиква, официальный тон.',
    stack: '"Times New Roman", Times, "Songti SC", serif',
  },
  {
    key: 'font-display-palatino',
    label: '«Палатино»',
    character: 'Гуманистическая антиква с широкими пропорциями.',
    stack: '"Palatino Linotype", Palatino, "Book Antiqua", Georgia, "Songti SC", serif',
  },
  {
    key: 'font-display-trebuchet',
    label: '«Требюше»',
    character: 'Дружелюбный гуманистический гротеск.',
    stack: '"Trebuchet MS", "Segoe UI", Tahoma, sans-serif',
  },
  {
    key: 'font-display-segoe',
    label: '«Сего»',
    character: 'Нейтральный интерфейсный гротеск, деловой вид.',
    stack: '"Segoe UI", "Helvetica Neue", Helvetica, Arial, sans-serif',
  },
  {
    key: 'font-display-verdana',
    label: '«Вердана»',
    character: 'Широкий гротеск с крупным очком, максимальная читаемость.',
    stack: 'Verdana, Tahoma, "Segoe UI", Arial, sans-serif',
  },
];

export const BODY_FONT_OPTIONS = [
  {
    key: 'font-body-system',
    label: '«Системный»',
    character: 'Родной шрифт платформы — текущий вид страницы.',
    stack: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  {
    key: 'font-body-arial',
    label: '«Ариал»',
    character: 'Универсальный нейтральный гротеск.',
    stack: 'Arial, "Helvetica Neue", Helvetica, "Segoe UI", sans-serif',
  },
  {
    key: 'font-body-verdana',
    label: '«Вердана»',
    character: 'Широкий и просторный, лучше всего в мелком кегле.',
    stack: 'Verdana, Tahoma, "Segoe UI", Arial, sans-serif',
  },
  {
    key: 'font-body-trebuchet',
    label: '«Требюше»',
    character: 'Мягкий гуманистический гротеск.',
    stack: '"Trebuchet MS", "Segoe UI", Tahoma, Arial, sans-serif',
  },
  {
    key: 'font-body-tahoma',
    label: '«Тахома»',
    character: 'Плотный и компактный интерфейсный гротеск.',
    stack: 'Tahoma, Verdana, "Segoe UI", Arial, sans-serif',
  },
  {
    key: 'font-body-georgia',
    label: '«Джорджия (антиква)»',
    character: 'Антиква в основном тексте — журнальная подача.',
    stack: 'Georgia, "Times New Roman", "Songti SC", serif',
  },
];

export const DEFAULT_DISPLAY_FONT = 'font-display-georgia';
export const DEFAULT_BODY_FONT = 'font-body-system';

function stackFor(options, key, fallbackKey) {
  const chosen = options.find((option) => option.key === key) ?? options.find((option) => option.key === fallbackKey);
  return chosen.stack;
}

/** Resolve a stored display key to a font stack; unknown keys fall back, never to nothing. */
export function resolveDisplayFont(key) {
  return stackFor(DISPLAY_FONT_OPTIONS, key, DEFAULT_DISPLAY_FONT);
}

/** Resolve a stored body key to a font stack. */
export function resolveBodyFont(key) {
  return stackFor(BODY_FONT_OPTIONS, key, DEFAULT_BODY_FONT);
}
