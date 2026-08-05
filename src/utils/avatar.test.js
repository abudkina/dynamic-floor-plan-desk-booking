import { describe, expect, it } from 'vitest';
import { generateAvatarDataUrl } from '../utils/avatar.js';

describe('avatar', () => {
  it('генерирует data URL аватара', async () => {
    const url = await generateAvatarDataUrl(42, 32);
    expect(url.startsWith('data:image/')).toBe(true);
  });

  it('разные seed дают разные изображения', async () => {
    const a = await generateAvatarDataUrl(1, 32);
    const b = await generateAvatarDataUrl(999, 32);
    expect(a).not.toBe(b);
  });
});
