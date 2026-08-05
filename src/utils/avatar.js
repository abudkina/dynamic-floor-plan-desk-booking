/**
 * Генерация 8-bit аватаров через OffscreenCanvas (с запасным путём на Canvas).
 */

import { logger } from '../services/logger.js';

const PALETTE = [
  '#38b764',
  '#3cbcfc',
  '#f9c22b',
  '#e43b44',
  '#b55088',
  '#5b6ee1',
  '#73eff7',
  '#a7f070',
];

/**
 * Псевдослучайный генератор на основе seed.
 * @param {number} seed
 * @returns {() => number}
 */
function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

/**
 * Нарисовать пиксельный аватар на контексте.
 * @param {OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} seed
 */
function paintAvatar(ctx, size, seed) {
  const rng = createRng(seed || 1);
  const cell = Math.max(1, Math.floor(size / 8));
  const bg = '#1a1c2c';
  const skin = PALETTE[Math.floor(rng() * PALETTE.length)];
  const accent = PALETTE[Math.floor(rng() * PALETTE.length)];

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Симметричное лицо 8×8
  for (let y = 1; y < 7; y += 1) {
    for (let x = 1; x < 4; x += 1) {
      if (rng() > 0.35) {
        ctx.fillStyle = rng() > 0.7 ? accent : skin;
        ctx.fillRect(x * cell, y * cell, cell, cell);
        ctx.fillRect((7 - x) * cell, y * cell, cell, cell);
      }
    }
  }

  // Глаза
  ctx.fillStyle = '#f4f4f4';
  ctx.fillRect(2 * cell, 3 * cell, cell, cell);
  ctx.fillRect(5 * cell, 3 * cell, cell, cell);
  ctx.fillStyle = '#1a1c2c';
  ctx.fillRect(2 * cell + cell / 3, 3 * cell + cell / 3, cell / 3, cell / 3);
  ctx.fillRect(5 * cell + cell / 3, 3 * cell + cell / 3, cell / 3, cell / 3);
}

/**
 * Создать data URL аватара.
 * @param {number} seed
 * @param {number} [size=64]
 * @returns {Promise<string>}
 */
export async function generateAvatarDataUrl(seed, size = 64) {
  try {
    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Контекст OffscreenCanvas недоступен');
      paintAvatar(ctx, size, seed);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return await blobToDataUrl(blob);
    }

    // В тестах (jsdom) canvas недоступен — сразу запасной SVG
    if (typeof process !== 'undefined' && process.env?.VITEST) {
      return fallbackSvg(seed);
    }

    if (typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          paintAvatar(ctx, size, seed);
          return canvas.toDataURL('image/png');
        }
      } catch {
        /* jsdom / старые браузеры — запасной SVG */
      }
    }

    return fallbackSvg(seed);
  } catch (error) {
    logger.warn('Не удалось сгенерировать аватар, используем запасной SVG', error);
    return fallbackSvg(seed);
  }
}

/**
 * @param {Blob} blob
 * @returns {Promise<string>}
 */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(/** @type {string} */ (reader.result));
    reader.onerror = () => reject(new Error('Ошибка чтения аватара'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Запасной SVG-аватар без canvas.
 * @param {number} seed
 * @returns {string}
 */
function fallbackSvg(seed) {
  const color = PALETTE[seed % PALETTE.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges"><rect width="8" height="8" fill="#1a1c2c"/><rect x="2" y="1" width="4" height="5" fill="${color}"/><rect x="2" y="3" width="1" height="1" fill="#f4f4f4"/><rect x="5" y="3" width="1" height="1" fill="#f4f4f4"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
