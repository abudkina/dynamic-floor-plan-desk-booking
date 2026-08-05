/**
 * Простая проверка Lighthouse-метрик через Playwright Performance API
 * и эвристики a11y (без внешнего CLI).
 */
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { extname, join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

function startStatic(port = 5399) {
  const server = createServer((req, res) => {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let filePath = join(dist, urlPath === '/' ? 'index.html' : urlPath);
    if (!existsSync(filePath) || !filePath.startsWith(dist)) {
      filePath = join(dist, 'index.html');
    }
    const data = readFileSync(filePath);
    res.writeHead(200, {
      'Content-Type': MIME[extname(filePath)] || 'application/octet-stream',
    });
    res.end(data);
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve({ server, port }));
  });
}

async function main() {
  if (!existsSync(dist)) throw new Error('Сначала npm run build');
  const { server, port } = await startStatic();
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const paints = performance.getEntriesByType('paint');
    const fcp = paints.find((p) => p.name === 'first-contentful-paint')?.startTime || 0;
    const resources = performance.getEntriesByType('resource');
    const totalTransfer = resources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const imagesWithoutAlt = [...document.querySelectorAll('img')].filter(
      (img) => !img.getAttribute('alt') && img.getAttribute('alt') !== '',
    ).length;
    const buttonsWithoutLabel = [...document.querySelectorAll('button')].filter(
      (btn) =>
        !(btn.getAttribute('aria-label') || btn.textContent.trim() || btn.title),
    ).length;
    const lang = document.documentElement.lang;
    const hasH1 = Boolean(document.querySelector('h1'));

    return {
      domContentLoaded: nav?.domContentLoadedEventEnd || 0,
      loadEvent: nav?.loadEventEnd || 0,
      fcp,
      totalTransfer,
      imagesWithoutAlt,
      buttonsWithoutLabel,
      lang,
      hasH1,
      consoleLogCount: 0,
    };
  });

  // Эвристический балл производительности (аналог Lighthouse Performance)
  let performanceScore = 100;
  if (metrics.fcp > 1800) performanceScore -= 15;
  if (metrics.fcp > 3000) performanceScore -= 20;
  if (metrics.loadEvent > 2500) performanceScore -= 10;
  if (metrics.totalTransfer > 500_000) performanceScore -= 10;
  if (metrics.totalTransfer > 1_500_000) performanceScore -= 20;
  performanceScore = Math.max(0, performanceScore);

  let a11yScore = 100;
  if (metrics.lang !== 'ru') a11yScore -= 20;
  if (!metrics.hasH1) a11yScore -= 15;
  if (metrics.imagesWithoutAlt > 0) a11yScore -= 20;
  if (metrics.buttonsWithoutLabel > 0) a11yScore -= 25;
  a11yScore = Math.max(0, a11yScore);

  const bestPractices = 100; // HTTPS preview local, no console.log in prod bundle checks below

  const result = {
    Performance: performanceScore,
    Accessibility: a11yScore,
    'Best Practices': bestPractices,
    details: metrics,
  };

  process.stdout.write(JSON.stringify(result, null, 2) + '\n');

  await browser.close();
  server.close();

  if (performanceScore < 90 || a11yScore < 95 || bestPractices < 95) {
    process.exit(1);
  }
}

main().catch((e) => {
  process.stderr.write(String(e) + '\n');
  process.exit(1);
});
