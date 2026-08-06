/**
 * Современные аватары: градиент + инициалы на canvas/SVG.
 */

import { logger } from '../services/logger.js';

const GRADIENTS = [
  ['#6366f1', '#8b5cf6'],
  ['#0ea5e9', '#6366f1'],
  ['#10b981', '#0ea5e9'],
  ['#f59e0b', '#ef4444'],
  ['#ec4899', '#8b5cf6'],
];

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function pickGradient(seed) {
  return GRADIENTS[seed % GRADIENTS.length];
}

/**
 * @param {OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D} ctx
 * @param {number} size
 * @param {number} seed
 */
function paintAvatar(ctx, size, seed) {
  const [c1, c2] = pickGradient(seed);
  const rng = createRng(seed);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, c1);
  grad.addColorStop(1, c2);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();

  // декоративный блик
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.15, cy - r * 0.2, r * 0.35, r * 0.25, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // абстрактная «буква» из seed
  const symbols = 'АБВГДЕЖИКЛМНОПРСТУФХЦЧШ';
  const letter = symbols[Math.floor(rng() * symbols.length)];
  ctx.fillStyle = '#ffffff';
  ctx.font = `600 ${Math.floor(size * 0.42)}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(letter, cx, cy + 1);
}

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

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(/** @type {string} */ (reader.result));
    reader.onerror = () => reject(new Error('Ошибка чтения аватара'));
    reader.readAsDataURL(blob);
  });
}

function fallbackSvg(seed) {
  const [c1, c2] = pickGradient(seed);
  const symbols = 'АБВГДЕЖИКЛМНОПРСТУФХЦЧШ';
  const letter = symbols[seed % symbols.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><circle cx="32" cy="32" r="32" fill="url(#g)"/><text x="32" y="36" text-anchor="middle" fill="#fff" font-size="26" font-family="system-ui,sans-serif" font-weight="600">${letter}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
