/**
 * Генерация 8-bit аватаров: рисуем 8×8, увеличиваем без сглаживания.
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
 * Матрица 8×8 пикселей персонажа.
 * @param {number} seed
 * @returns {string[][]}
 */
function buildPixelGrid(seed) {
  const rng = createRng(seed || 1);
  const skin = PALETTE[Math.floor(rng() * PALETTE.length)];
  const hair = PALETTE[Math.floor(rng() * PALETTE.length)];
  const shirt = PALETTE[Math.floor(rng() * PALETTE.length)];
  const bg = '#1a1c2c';
  const eye = '#f4f4f4';
  const pupil = '#0b0d16';

  /** @type {string[][]} */
  const grid = Array.from({ length: 8 }, () => Array.from({ length: 8 }, () => bg));

  // волосы
  for (let x = 1; x <= 6; x += 1) grid[0][x] = hair;
  for (let x = 1; x <= 6; x += 1) grid[1][x] = hair;
  if (rng() > 0.4) grid[1][0] = hair;
  if (rng() > 0.4) grid[1][7] = hair;

  // лицо
  for (let y = 2; y <= 4; y += 1) {
    for (let x = 2; x <= 5; x += 1) grid[y][x] = skin;
  }

  // глаза: белок сверху, зрачок снизу
  grid[2][2] = eye;
  grid[2][5] = eye;
  grid[3][2] = pupil;
  grid[3][5] = pupil;

  // рот
  if (rng() > 0.5) {
    grid[4][3] = '#a32c32';
    grid[4][4] = '#a32c32';
  } else {
    grid[4][3] = pupil;
    grid[4][4] = pupil;
  }

  // шея / плечи
  grid[5][3] = skin;
  grid[5][4] = skin;
  for (let x = 1; x <= 6; x += 1) grid[6][x] = shirt;
  for (let x = 2; x <= 5; x += 1) grid[7][x] = shirt;
  if (rng() > 0.5) grid[6][3] = '#f4f4f4';
  if (rng() > 0.5) grid[6][4] = '#f4f4f4';

  return grid;
}

/**
 * @param {OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} seed
 */
function paintAvatar(ctx, size, seed) {
  const grid = buildPixelGrid(seed);
  const tiny =
    typeof OffscreenCanvas !== 'undefined'
      ? new OffscreenCanvas(8, 8)
      : (() => {
          const c = document.createElement('canvas');
          c.width = 8;
          c.height = 8;
          return c;
        })();

  const tinyCtx = tiny.getContext('2d');
  if (!tinyCtx) throw new Error('Контекст аватара недоступен');

  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      tinyCtx.fillStyle = grid[y][x];
      tinyCtx.fillRect(x, y, 1, 1);
    }
  }

  ctx.imageSmoothingEnabled = false;
  // @ts-expect-error совместимость
  if ('mozImageSmoothingEnabled' in ctx) ctx.mozImageSmoothingEnabled = false;
  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(tiny, 0, 0, 8, 8, 0, 0, size, size);
}

/**
 * @param {number} seed
 * @param {number} [size=64]
 * @returns {Promise<string>}
 */
export async function generateAvatarDataUrl(seed, size = 64) {
  try {
    if (typeof process !== 'undefined' && process.env?.VITEST) {
      return fallbackSvg(seed);
    }

    if (typeof OffscreenCanvas !== 'undefined') {
      const canvas = new OffscreenCanvas(size, size);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Контекст OffscreenCanvas недоступен');
      paintAvatar(ctx, size, seed);
      const blob = await canvas.convertToBlob({ type: 'image/png' });
      return await blobToDataUrl(blob);
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
        /* запасной SVG */
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
 * @param {number} seed
 * @returns {string}
 */
function fallbackSvg(seed) {
  const grid = buildPixelGrid(seed);
  const rects = [];
  for (let y = 0; y < 8; y += 1) {
    for (let x = 0; x < 8; x += 1) {
      rects.push(
        `<rect x="${x}" y="${y}" width="1" height="1" fill="${grid[y][x]}"/>`,
      );
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 8 8" shape-rendering="crispEdges">${rects.join('')}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
