/**
 * Маршруты приложения (URL hash, без бэкенда).
 * Идентификаторы в hash — латиница (надёжнее для браузеров/тестов).
 * Подписи UI — только на русском.
 */

export const ROUTES = {
  MAP: 'map',
  BOOKINGS: 'bookings',
  ANALYTICS: 'analytics',
};

export const ROUTE_LABELS = {
  [ROUTES.MAP]: 'Карта офиса',
  [ROUTES.BOOKINGS]: 'Мои бронирования',
  [ROUTES.ANALYTICS]: 'Аналитика загрузки',
};

/**
 * Разобрать hash в идентификатор маршрута.
 * @param {string} [hash]
 * @returns {string}
 */
export function parseRoute(hash = '') {
  let raw = String(hash || '').replace(/^#\/?/, '').trim();
  try {
    raw = decodeURIComponent(raw);
  } catch {
    /* оставляем как есть */
  }
  raw = raw.toLowerCase();

  if (!raw || raw === 'карта' || raw === ROUTES.MAP) return ROUTES.MAP;
  if (raw === 'бронирования' || raw === ROUTES.BOOKINGS) return ROUTES.BOOKINGS;
  if (raw === 'аналитика' || raw === ROUTES.ANALYTICS) return ROUTES.ANALYTICS;
  return ROUTES.MAP;
}

/**
 * Собрать hash для маршрута.
 * @param {string} route
 * @returns {string}
 */
export function toHash(route) {
  return `#/${route}`;
}
