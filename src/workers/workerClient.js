/**
 * Обёртка над Web Worker для статистики и фильтрации.
 */

import { logger } from '../services/logger.js';
import { filterDesksByType, occupancyStats } from '../utils/booking.js';

/**
 * @typedef {import('../utils/booking.js').BookingsMap} BookingsMap
 */

let worker = null;
let workerFailed = false;

function getWorker() {
  if (workerFailed) return null;
  if (worker) return worker;

  try {
    if (typeof Worker === 'undefined') {
      workerFailed = true;
      return null;
    }
    worker = new Worker(new URL('./bookingWorker.js', import.meta.url), {
      type: 'module',
    });
    return worker;
  } catch (error) {
    logger.warn('Web Worker недоступен, используем основной поток', error);
    workerFailed = true;
    return null;
  }
}

/**
 * Запросить статистику занятости.
 * @param {BookingsMap} bookings
 * @param {number} totalDesks
 * @returns {Promise<{ занято: number, свободно: number, процент: number }>}
 */
export function computeStatsAsync(bookings, totalDesks) {
  const w = getWorker();
  if (!w) {
    return Promise.resolve(occupancyStats(bookings, totalDesks));
  }

  return new Promise((resolve) => {
    const onMessage = (event) => {
      if (event.data?.тип !== 'статистика') return;
      w.removeEventListener('message', onMessage);
      if (event.data.ок) {
        resolve(event.data.результат);
      } else {
        resolve(occupancyStats(bookings, totalDesks));
      }
    };

    w.addEventListener('message', onMessage);
    w.postMessage({
      тип: 'статистика',
      полезнаяНагрузка: { бронирования: bookings, всегоСтолов: totalDesks },
    });
  });
}

/**
 * Отфильтровать столы через воркер (с запасным путём).
 * @param {Array<{ id: string, type: string }>} desks
 * @param {string} filter
 * @param {BookingsMap} bookings
 * @returns {Promise<Array>}
 */
export function filterDesksAsync(desks, filter, bookings) {
  const w = getWorker();
  if (!w) {
    const filtered = filterDesksByType(desks, filter);
    return Promise.resolve(
      filtered.map((desk) => ({
        ...desk,
        занят: Boolean(bookings?.[desk.id]),
      })),
    );
  }

  return new Promise((resolve) => {
    const onMessage = (event) => {
      if (event.data?.тип !== 'фильтр') return;
      w.removeEventListener('message', onMessage);
      if (event.data.ок) {
        resolve(event.data.результат);
      } else {
        const filtered = filterDesksByType(desks, filter);
        resolve(
          filtered.map((desk) => ({
            ...desk,
            занят: Boolean(bookings?.[desk.id]),
          })),
        );
      }
    };

    w.addEventListener('message', onMessage);
    w.postMessage({
      тип: 'фильтр',
      полезнаяНагрузка: {
        столы: desks,
        фильтр: filter,
        бронирования: bookings,
      },
    });
  });
}
