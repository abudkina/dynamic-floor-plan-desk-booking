/**
 * Работа с LocalStorage для бронирований.
 */

import { STORAGE_KEY } from '../data/constants.js';
import { logger } from './logger.js';
import { filterTodayBookings } from '../utils/booking.js';

/**
 * Безопасное чтение JSON из LocalStorage.
 * @param {Storage} [storage]
 * @returns {import('../utils/booking.js').BookingsMap}
 */
export function loadBookings(storage = getStorage()) {
  if (!storage) return {};

  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      logger.warn('Повреждённые данные бронирований — сброс.');
      storage.removeItem(STORAGE_KEY);
      return {};
    }

    /** @type {import('../utils/booking.js').BookingsMap} */
    const sanitized = {};
    for (const [deskId, booking] of Object.entries(parsed)) {
      if (
        booking &&
        typeof booking === 'object' &&
        typeof booking.deskId === 'string' &&
        typeof booking.name === 'string' &&
        typeof booking.time === 'string' &&
        typeof booking.date === 'string'
      ) {
        sanitized[deskId] = /** @type {import('../utils/booking.js').Booking} */ (
          booking
        );
      }
    }

    return filterTodayBookings(sanitized);
  } catch (error) {
    logger.error('Не удалось прочитать бронирования', error);
    try {
      storage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    return {};
  }
}

/**
 * Сохранить бронирования.
 * @param {import('../utils/booking.js').BookingsMap} bookings
 * @param {Storage} [storage]
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function saveBookings(bookings, storage = getStorage()) {
  if (!storage) {
    return {
      ok: false,
      error: 'Хранилище браузера недоступно. Бронирование не сохранено.',
    };
  }

  try {
    const payload = JSON.stringify(bookings || {});
    storage.setItem(STORAGE_KEY, payload);
    return { ok: true };
  } catch (error) {
    logger.error('Не удалось сохранить бронирования', error);
    const message =
      error instanceof DOMException && error.name === 'QuotaExceededError'
        ? 'Недостаточно места в хранилище браузера.'
        : 'Ошибка сохранения. Попробуйте ещё раз.';
    return { ok: false, error: message };
  }
}

/**
 * Очистить все бронирования.
 * @param {Storage} [storage]
 * @returns {{ ok: true } | { ok: false, error: string }}
 */
export function clearBookingsStorage(storage = getStorage()) {
  if (!storage) {
    return { ok: false, error: 'Хранилище браузера недоступно.' };
  }

  try {
    storage.removeItem(STORAGE_KEY);
    return { ok: true };
  } catch (error) {
    logger.error('Не удалось очистить хранилище', error);
    return { ok: false, error: 'Не удалось сбросить бронирования.' };
  }
}

/**
 * @returns {Storage | null}
 */
function getStorage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = '__probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}
