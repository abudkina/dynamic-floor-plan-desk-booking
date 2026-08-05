import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearBookingsStorage,
  loadBookings,
  saveBookings,
} from '../services/storage.js';
import { STORAGE_KEY } from '../data/constants.js';

function createMemoryStorage() {
  /** @type {Record<string, string>} */
  const data = {};
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
    },
    removeItem: (key) => {
      delete data[key];
    },
  };
}

describe('storage', () => {
  /** @type {ReturnType<typeof createMemoryStorage>} */
  let storage;

  beforeEach(() => {
    storage = createMemoryStorage();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-08-05T12:00:00'));
  });

  it('сохраняет и загружает брони на сегодня', () => {
    const bookings = {
      w1: {
        deskId: 'w1',
        name: 'Мария',
        time: '10:00',
        date: '2026-08-05',
        quote: 'Я работаю!',
        avatarSeed: 3,
        createdAt: '2026-08-05T10:00:00.000Z',
      },
    };
    expect(saveBookings(bookings, storage).ok).toBe(true);
    expect(loadBookings(storage)).toEqual(bookings);
  });

  it('отбрасывает вчерашние брони', () => {
    storage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        w1: {
          deskId: 'w1',
          name: 'Мария',
          time: '10:00',
          date: '2026-08-04',
          quote: 'Я работаю!',
          avatarSeed: 3,
          createdAt: '2026-08-04T10:00:00.000Z',
        },
      }),
    );
    expect(loadBookings(storage)).toEqual({});
  });

  it('чинит повреждённый JSON', () => {
    storage.setItem(STORAGE_KEY, '{не json');
    expect(loadBookings(storage)).toEqual({});
  });

  it('очищает хранилище', () => {
    saveBookings(
      {
        w1: {
          deskId: 'w1',
          name: 'Мария',
          time: '10:00',
          date: '2026-08-05',
          quote: 'Я работаю!',
          avatarSeed: 3,
          createdAt: '2026-08-05T10:00:00.000Z',
        },
      },
      storage,
    );
    expect(clearBookingsStorage(storage).ok).toBe(true);
    expect(loadBookings(storage)).toEqual({});
  });
});
