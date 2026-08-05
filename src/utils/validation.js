/**
 * Валидация пользовательского ввода для бронирований.
 */

import { MAX_NAME_LENGTH, MIN_NAME_LENGTH } from '../data/constants.js';

/**
 * Результат проверки.
 * @typedef {{ ok: true, value: string } | { ok: false, error: string }} ValidationResult
 */

/**
 * Проверка имени сотрудника.
 * @param {unknown} raw
 * @returns {ValidationResult}
 */
export function validateName(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Имя должно быть текстом.' };
  }

  const name = raw.trim().replace(/\s+/g, ' ');

  if (name.length < MIN_NAME_LENGTH) {
    return {
      ok: false,
      error: `Имя слишком короткое. Минимум ${MIN_NAME_LENGTH} символа.`,
    };
  }

  if (name.length > MAX_NAME_LENGTH) {
    return {
      ok: false,
      error: `Имя слишком длинное. Максимум ${MAX_NAME_LENGTH} символов.`,
    };
  }

  if (!/^[\p{L}\p{N}\s.\-']+$/u.test(name)) {
    return {
      ok: false,
      error: 'Имя может содержать только буквы, цифры, пробелы, точку, дефис и апостроф.',
    };
  }

  return { ok: true, value: name };
}

/**
 * Проверка времени брони (формат ЧЧ:ММ).
 * @param {unknown} raw
 * @returns {ValidationResult}
 */
export function validateTime(raw) {
  if (typeof raw !== 'string') {
    return { ok: false, error: 'Время должно быть текстом.' };
  }

  const time = raw.trim();

  if (!/^\d{2}:\d{2}$/.test(time)) {
    return {
      ok: false,
      error: 'Укажите время в формате ЧЧ:ММ, например 09:30.',
    };
  }

  const [hoursStr, minutesStr] = time.split(':');
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return { ok: false, error: 'Некорректное время. Часы: 00–23, минуты: 00–59.' };
  }

  return { ok: true, value: time };
}

/**
 * Дата брони — только сегодня (календарный день).
 * @param {Date} [now]
 * @returns {string} YYYY-MM-DD
 */
export function todayKey(now = new Date()) {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Проверка идентификатора стола.
 * @param {unknown} id
 * @param {string[]} allowedIds
 * @returns {ValidationResult}
 */
export function validateDeskId(id, allowedIds) {
  if (typeof id !== 'string' || !id.trim()) {
    return { ok: false, error: 'Не указан стол для бронирования.' };
  }

  if (!allowedIds.includes(id)) {
    return { ok: false, error: 'Выбранный стол не найден на плане.' };
  }

  return { ok: true, value: id };
}
