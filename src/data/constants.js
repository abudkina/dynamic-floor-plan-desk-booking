/**
 * Константы типов мест и ключей хранилища.
 */

/** @typedef {'window' | 'meeting' | 'quiet'} DeskType */

export const DESK_TYPES = /** @type {const} */ ({
  WINDOW: 'window',
  MEETING: 'meeting',
  QUIET: 'quiet',
});

/** Подписи типов мест для интерфейса (только русский). */
export const DESK_TYPE_LABELS = {
  [DESK_TYPES.WINDOW]: 'У окна',
  [DESK_TYPES.MEETING]: 'Переговорка',
  [DESK_TYPES.QUIET]: 'Тихая зона',
};

export const STORAGE_KEY = 'office-desk-bookings-v1';
export const ADMIN_UNLOCK_KEY = 'office-admin-unlocked';

/** Цитаты для занятых мест (вайб-фишка). */
export const WORK_QUOTES = [
  'Я работаю!',
  'Не беспокоить — дедлайн!',
  'В потоке. Вернусь позже.',
  'Код пишется, магия творится!',
  'Сейчас важный созвон.',
];

export const MAX_NAME_LENGTH = 40;
export const MIN_NAME_LENGTH = 2;
