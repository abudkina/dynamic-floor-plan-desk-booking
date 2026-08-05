/**
 * Данные плана офиса: расположение и типы столов (8-bit карта).
 * Координаты в пикселях SVG viewBox 0 0 320 200.
 */

import { DESK_TYPES } from './constants.js';

/**
 * @typedef {Object} Desk
 * @property {string} id
 * @property {string} label
 * @property {import('./constants.js').DeskType} type
 * @property {number} x
 * @property {number} y
 * @property {number} width
 * @property {number} height
 */

/** @type {Desk[]} */
export const DESKS = [
  { id: 'w1', label: 'Окно-1', type: DESK_TYPES.WINDOW, x: 16, y: 24, width: 28, height: 20 },
  { id: 'w2', label: 'Окно-2', type: DESK_TYPES.WINDOW, x: 52, y: 24, width: 28, height: 20 },
  { id: 'w3', label: 'Окно-3', type: DESK_TYPES.WINDOW, x: 88, y: 24, width: 28, height: 20 },
  { id: 'w4', label: 'Окно-4', type: DESK_TYPES.WINDOW, x: 124, y: 24, width: 28, height: 20 },

  { id: 'q1', label: 'Тихая-1', type: DESK_TYPES.QUIET, x: 180, y: 24, width: 28, height: 20 },
  { id: 'q2', label: 'Тихая-2', type: DESK_TYPES.QUIET, x: 216, y: 24, width: 28, height: 20 },
  { id: 'q3', label: 'Тихая-3', type: DESK_TYPES.QUIET, x: 252, y: 24, width: 28, height: 20 },
  { id: 'q4', label: 'Тихая-4', type: DESK_TYPES.QUIET, x: 180, y: 56, width: 28, height: 20 },
  { id: 'q5', label: 'Тихая-5', type: DESK_TYPES.QUIET, x: 216, y: 56, width: 28, height: 20 },

  { id: 'm1', label: 'Перег-1', type: DESK_TYPES.MEETING, x: 16, y: 100, width: 40, height: 28 },
  { id: 'm2', label: 'Перег-2', type: DESK_TYPES.MEETING, x: 68, y: 100, width: 40, height: 28 },
  { id: 'm3', label: 'Перег-3', type: DESK_TYPES.MEETING, x: 16, y: 144, width: 40, height: 28 },
  { id: 'm4', label: 'Перег-4', type: DESK_TYPES.MEETING, x: 68, y: 144, width: 40, height: 28 },

  { id: 'w5', label: 'Окно-5', type: DESK_TYPES.WINDOW, x: 180, y: 120, width: 28, height: 20 },
  { id: 'w6', label: 'Окно-6', type: DESK_TYPES.WINDOW, x: 216, y: 120, width: 28, height: 20 },
  { id: 'w7', label: 'Окно-7', type: DESK_TYPES.WINDOW, x: 252, y: 120, width: 28, height: 20 },
  { id: 'q6', label: 'Тихая-6', type: DESK_TYPES.QUIET, x: 180, y: 152, width: 28, height: 20 },
  { id: 'q7', label: 'Тихая-7', type: DESK_TYPES.QUIET, x: 216, y: 152, width: 28, height: 20 },
  { id: 'q8', label: 'Тихая-8', type: DESK_TYPES.QUIET, x: 252, y: 152, width: 28, height: 20 },
];

/**
 * Найти стол по идентификатору.
 * @param {string} id
 * @returns {Desk | undefined}
 */
export function findDeskById(id) {
  return DESKS.find((desk) => desk.id === id);
}
