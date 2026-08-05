import { describe, expect, it } from 'vitest';
import {
  cancelBooking,
  clearAllBookings,
  createBooking,
  filterDesksByType,
  filterTodayBookings,
  hashString,
  occupancyStats,
  pickQuote,
} from '../utils/booking.js';
import {
  todayKey,
  validateDeskId,
  validateName,
  validateTime,
} from '../utils/validation.js';
import { DESK_TYPES } from '../data/constants.js';

describe('validateName', () => {
  it('принимает корректное имя', () => {
    const result = validateName('  Анна  Петрова ');
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value).toBe('Анна Петрова');
  });

  it('отклоняет слишком короткое имя', () => {
    const result = validateName('А');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/короткое/i);
  });

  it('отклоняет недопустимые символы', () => {
    const result = validateName('Анна<script>');
    expect(result.ok).toBe(false);
  });
});

describe('validateTime', () => {
  it('принимает корректное время', () => {
    expect(validateTime('09:30').ok).toBe(true);
    expect(validateTime('23:59').ok).toBe(true);
  });

  it('отклоняет неверный формат', () => {
    const result = validateTime('9:30');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/ЧЧ:ММ/);
  });

  it('отклоняет невозможное время', () => {
    expect(validateTime('24:00').ok).toBe(false);
    expect(validateTime('12:60').ok).toBe(false);
  });
});

describe('validateDeskId', () => {
  it('проверяет наличие стола', () => {
    expect(validateDeskId('w1', ['w1', 'w2']).ok).toBe(true);
    expect(validateDeskId('нет', ['w1']).ok).toBe(false);
  });
});

describe('booking logic', () => {
  const allowed = ['w1', 'w2', 'q1'];
  const now = new Date('2026-08-05T10:00:00');

  it('создаёт бронь', () => {
    const result = createBooking({
      deskId: 'w1',
      name: 'Игорь',
      time: '10:15',
      allowedDeskIds: allowed,
      existing: {},
      now,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.booking.deskId).toBe('w1');
      expect(result.booking.date).toBe('2026-08-05');
      expect(result.booking.quote).toBeTruthy();
      expect(typeof result.booking.avatarSeed).toBe('number');
    }
  });

  it('не даёт забронировать занятый стол', () => {
    const existing = {
      w1: {
        deskId: 'w1',
        name: 'Оля',
        time: '09:00',
        date: '2026-08-05',
        quote: 'Я работаю!',
        avatarSeed: 1,
        createdAt: now.toISOString(),
      },
    };
    const result = createBooking({
      deskId: 'w1',
      name: 'Игорь',
      time: '11:00',
      allowedDeskIds: allowed,
      existing,
      now,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/уже занят/);
  });

  it('отменяет и сбрасывает брони', () => {
    const map = {
      w1: {
        deskId: 'w1',
        name: 'Оля',
        time: '09:00',
        date: '2026-08-05',
        quote: 'Я работаю!',
        avatarSeed: 1,
        createdAt: now.toISOString(),
      },
    };
    expect(cancelBooking(map, 'w1')).toEqual({});
    expect(clearAllBookings()).toEqual({});
  });

  it('фильтрует брони только на сегодня', () => {
    const map = {
      w1: {
        deskId: 'w1',
        name: 'Оля',
        time: '09:00',
        date: '2026-08-05',
        quote: 'Я работаю!',
        avatarSeed: 1,
        createdAt: now.toISOString(),
      },
      w2: {
        deskId: 'w2',
        name: 'Игорь',
        time: '09:00',
        date: '2026-08-04',
        quote: 'Я работаю!',
        avatarSeed: 2,
        createdAt: now.toISOString(),
      },
    };
    const today = filterTodayBookings(map, now);
    expect(Object.keys(today)).toEqual(['w1']);
  });

  it('считает статистику и фильтрует типы', () => {
    expect(occupancyStats({ w1: {} }, 10)).toEqual({
      занято: 1,
      свободно: 9,
      процент: 10,
    });
    const desks = [
      { id: '1', type: DESK_TYPES.WINDOW },
      { id: '2', type: DESK_TYPES.QUIET },
    ];
    expect(filterDesksByType(desks, DESK_TYPES.WINDOW)).toHaveLength(1);
    expect(filterDesksByType(desks, 'all')).toHaveLength(2);
  });

  it('hash и цитата стабильны', () => {
    expect(hashString('тест')).toBe(hashString('тест'));
    expect(pickQuote('Анна', 'w1')).toBe(pickQuote('Анна', 'w1'));
  });

  it('todayKey форматирует дату', () => {
    expect(todayKey(new Date('2026-08-05T23:00:00'))).toBe('2026-08-05');
  });
});
