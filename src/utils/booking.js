/**
 * Бизнес-логика бронирований столов.
 */

import { WORK_QUOTES } from '../data/constants.js';
import { todayKey, validateDeskId, validateName, validateTime } from './validation.js';

/**
 * @typedef {Object} Booking
 * @property {string} deskId
 * @property {string} name
 * @property {string} time
 * @property {string} date
 * @property {string} quote
 * @property {number} avatarSeed
 * @property {string} createdAt
 */

/**
 * @typedef {Record<string, Booking>} BookingsMap
 */

/**
 * Стабильный хеш строки → число (для цитат и аватаров).
 * @param {string} input
 * @returns {number}
 */
export function hashString(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Выбрать цитату по имени и столу.
 * @param {string} name
 * @param {string} deskId
 * @returns {string}
 */
export function pickQuote(name, deskId) {
  const index = hashString(`${name}:${deskId}`) % WORK_QUOTES.length;
  return WORK_QUOTES[index];
}

/**
 * Оставить только брони на сегодня.
 * @param {BookingsMap} bookings
 * @param {Date} [now]
 * @returns {BookingsMap}
 */
export function filterTodayBookings(bookings, now = new Date()) {
  const key = todayKey(now);
  /** @type {BookingsMap} */
  const result = {};

  for (const [deskId, booking] of Object.entries(bookings || {})) {
    if (booking && booking.date === key) {
      result[deskId] = booking;
    }
  }

  return result;
}

/**
 * Создать новую бронь после валидации.
 * @param {{ deskId: string, name: string, time: string, allowedDeskIds: string[], existing: BookingsMap, now?: Date }} params
 * @returns {{ ok: true, booking: Booking } | { ok: false, error: string }}
 */
export function createBooking({
  deskId,
  name,
  time,
  allowedDeskIds,
  existing,
  now = new Date(),
}) {
  const deskCheck = validateDeskId(deskId, allowedDeskIds);
  if (!deskCheck.ok) return deskCheck;

  const nameCheck = validateName(name);
  if (!nameCheck.ok) return nameCheck;

  const timeCheck = validateTime(time);
  if (!timeCheck.ok) return timeCheck;

  const today = todayKey(now);
  const current = filterTodayBookings(existing, now);

  if (current[deskId]) {
    return {
      ok: false,
      error: 'Этот стол уже занят на сегодня. Выберите другое место.',
    };
  }

  const booking = {
    deskId,
    name: nameCheck.value,
    time: timeCheck.value,
    date: today,
    quote: pickQuote(nameCheck.value, deskId),
    avatarSeed: hashString(`${nameCheck.value}:${deskId}:${today}`),
    createdAt: now.toISOString(),
  };

  return { ok: true, booking };
}

/**
 * Отменить бронь стола.
 * @param {BookingsMap} bookings
 * @param {string} deskId
 * @returns {BookingsMap}
 */
export function cancelBooking(bookings, deskId) {
  const next = { ...bookings };
  delete next[deskId];
  return next;
}

/**
 * Полный сброс бронирований.
 * @returns {BookingsMap}
 */
export function clearAllBookings() {
  return {};
}

/**
 * Статистика занятости.
 * @param {BookingsMap} bookings
 * @param {number} totalDesks
 * @returns {{ занято: number, свободно: number, процент: number }}
 */
export function occupancyStats(bookings, totalDesks) {
  const занято = Object.keys(bookings || {}).length;
  const свободно = Math.max(0, totalDesks - занято);
  const процент =
    totalDesks === 0 ? 0 : Math.round((занято / totalDesks) * 100);
  return { занято, свободно, процент };
}

/**
 * Фильтрация столов по типу.
 * @template {{ type: string }} T
 * @param {T[]} desks
 * @param {string | 'all'} filter
 * @returns {T[]}
 */
export function filterDesksByType(desks, filter) {
  if (!filter || filter === 'all') return desks;
  return desks.filter((desk) => desk.type === filter);
}
