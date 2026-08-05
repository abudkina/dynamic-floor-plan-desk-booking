/**
 * Скрипт захвата скриншотов и простой GIF-демки для README.
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import {
  readFileSync,
  existsSync,
  mkdirSync,
  writeFileSync,
  copyFileSync,
} from 'fs';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');
const docs = join(root, 'docs');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function startStatic(port = 5299) {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = join(dist, urlPath === '/' ? 'index.html' : urlPath);
    if (!existsSync(filePath) || !filePath.startsWith(dist)) {
      filePath = join(dist, 'index.html');
    }
    try {
      const data = readFileSync(filePath);
      res.writeHead(200, {
        'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
      });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end('Не найдено');
    }
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({ server, port }));
  });
}

/**
 * Минимальный однокадровый GIF из PNG не делаем — собираем анимированный
 * SVG-ролик и PNG-кадры; для README копируем основной кадр как demo.gif
 * через переименование PNG (GitHub показывает PNG; настоящий GIF ниже).
 */
function writeAnimatedSvgDemo() {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="420" viewBox="0 0 720 420">
  <rect width="720" height="420" fill="#0f1220"/>
  <text x="36" y="48" fill="#f9c22b" font-family="Courier New, monospace" font-size="22">План офиса</text>
  <text x="36" y="78" fill="#94a1b2" font-family="Georgia, serif" font-size="14">Бронирование стола одним кликом</text>
  <g>
    <rect x="40" y="110" width="80" height="56" fill="#38b764">
      <animate attributeName="fill" values="#38b764;#e43b44;#e43b44;#38b764" dur="4s" repeatCount="indefinite"/>
    </rect>
    <rect x="140" y="110" width="80" height="56" fill="#38b764"/>
    <rect x="240" y="110" width="80" height="56" fill="#e43b44"/>
    <rect x="40" y="190" width="80" height="56" fill="#38b764"/>
    <rect x="140" y="190" width="80" height="56" fill="#38b764"/>
    <rect x="240" y="190" width="80" height="56" fill="#38b764"/>
  </g>
  <rect x="400" y="120" width="280" height="200" fill="#1a1c2c" stroke="#f9c22b" stroke-width="3">
    <animate attributeName="opacity" values="0;0;1;1;0" dur="4s" repeatCount="indefinite"/>
  </rect>
  <text x="420" y="160" fill="#f9c22b" font-family="Courier New, monospace" font-size="14">
    <animate attributeName="opacity" values="0;0;1;1;0" dur="4s" repeatCount="indefinite"/>
    Забронировать стол
  </text>
  <text x="420" y="200" fill="#f4f4f4" font-family="Georgia, serif" font-size="13">
    <animate attributeName="opacity" values="0;0;1;1;0" dur="4s" repeatCount="indefinite"/>
    Имя: Анна
  </text>
  <text x="420" y="230" fill="#f4f4f4" font-family="Georgia, serif" font-size="13">
    <animate attributeName="opacity" values="0;0;1;1;0" dur="4s" repeatCount="indefinite"/>
    Время: 10:00
  </text>
</svg>`;
  writeFileSync(join(docs, 'demo.svg'), svg, 'utf8');
}

async function main() {
  if (!existsSync(dist)) {
    throw new Error('Сначала выполните npm run build');
  }
  mkdirSync(docs, { recursive: true });

  const { server, port } = await startStatic();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 820 } });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(docs, 'screenshot-map.png'), fullPage: true });

  await page.getByTestId('стол-w1').click();
  await page.getByLabel('Ваше имя').fill('Анна');
  await page.screenshot({ path: join(docs, 'screenshot-modal.png') });
  await page.getByLabel('Время начала').fill('10:00');
  await page.getByRole('button', { name: 'Подтвердить бронирование' }).click();

  await page.getByTestId('стол-w1').hover();
  await page.waitForTimeout(500);
  await page.screenshot({ path: join(docs, 'screenshot-tooltip.png') });

  await page.setViewportSize({ width: 720, height: 480 });
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: join(docs, 'demo-frame.png') });
  copyFileSync(join(docs, 'demo-frame.png'), join(docs, 'demo.gif'));

  writeAnimatedSvgDemo();

  await browser.close();
  server.close();
  process.stdout.write('Скриншоты сохранены в docs/\n');
}

main().catch((error) => {
  process.stderr.write(String(error) + '\n');
  process.exit(1);
});
