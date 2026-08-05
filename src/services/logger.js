/**
 * Логгер приложения — вместо console.log.
 * Уровни: отладка, информация, предупреждение, ошибка.
 */

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel =
  typeof import.meta !== 'undefined' && import.meta.env?.DEV
    ? LEVELS.debug
    : LEVELS.warn;

/**
 * @param {'debug'|'info'|'warn'|'error'} level
 * @param {string} message
 * @param {unknown} [payload]
 */
function write(level, message, payload) {
  if (LEVELS[level] < currentLevel) return;

  const entry = {
    время: new Date().toISOString(),
    уровень: level,
    сообщение: message,
    данные: payload ?? null,
  };

  if (level === 'error') {
    // eslint-disable-next-line no-console
    console.error('[логгер]', entry);
  } else if (level === 'warn') {
    // eslint-disable-next-line no-console
    console.warn('[логгер]', entry);
  } else if (typeof console !== 'undefined' && console.info) {
    // eslint-disable-next-line no-console
    console.info('[логгер]', entry);
  }
}

export const logger = {
  /** @param {string} message @param {unknown} [payload] */
  debug(message, payload) {
    write('debug', message, payload);
  },
  /** @param {string} message @param {unknown} [payload] */
  info(message, payload) {
    write('info', message, payload);
  },
  /** @param {string} message @param {unknown} [payload] */
  warn(message, payload) {
    write('warn', message, payload);
  },
  /** @param {string} message @param {unknown} [payload] */
  error(message, payload) {
    write('error', message, payload);
  },
};
