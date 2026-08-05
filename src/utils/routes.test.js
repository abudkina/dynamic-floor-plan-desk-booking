import { describe, expect, it } from 'vitest';
import { parseRoute, ROUTES, toHash } from '../utils/routes.js';

describe('routes', () => {
  it('разбирает hash маршруты', () => {
    expect(parseRoute('')).toBe(ROUTES.MAP);
    expect(parseRoute('#/map')).toBe(ROUTES.MAP);
    expect(parseRoute('#/bookings')).toBe(ROUTES.BOOKINGS);
    expect(parseRoute('#/analytics')).toBe(ROUTES.ANALYTICS);
    expect(parseRoute('#/бронирования')).toBe(ROUTES.BOOKINGS);
    expect(parseRoute('#/неизвестно')).toBe(ROUTES.MAP);
  });

  it('собирает hash', () => {
    expect(toHash(ROUTES.BOOKINGS)).toBe('#/bookings');
  });
});
