import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
  });
});

test('главный сценарий: бронь и освобождение стола', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'План офиса' })).toBeVisible();

  await page.getByTestId('стол-w1').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByLabel('Ваше имя').fill('Сергей');
  await page.getByLabel('Время начала').fill('11:00');
  await page.getByRole('button', { name: 'Подтвердить бронирование' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByTestId('стол-w1').click();
  await expect(page.getByText(/Стол занят/)).toBeVisible();
  await page.getByRole('button', { name: 'Отменить бронирование этого стола' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('фильтры и валидация на русском', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Фильтр: Тихая зона' }).click();
  await expect(page.getByRole('button', { name: 'Фильтр: Тихая зона' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await page.getByTestId('стол-q1').click();
  await page.getByRole('button', { name: 'Подтвердить бронирование' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText(/Имя|короткое/);
});

test('админ сбрасывает бронирования', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('стол-w3').click();
  await page.getByLabel('Ваше имя').fill('Ольга');
  await page.getByLabel('Время начала').fill('12:00');
  await page.getByRole('button', { name: 'Подтвердить бронирование' }).click();

  page.on('dialog', (dialog) => dialog.accept());
  await page.getByLabel('Открыть режим администратора').click();
  await page.getByLabel('Сбросить все бронирования').click();

  await page.getByTestId('стол-w3').click();
  await expect(page.getByRole('heading', { name: 'Забронировать стол' })).toBeVisible();
});

test('мобильная ширина 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'План офиса' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Фильтр по типу мест' })).toBeVisible();
  await page.getByTestId('стол-m1').click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('страницы: мои бронирования и аналитика', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('стол-w1').click();
  await page.getByLabel('Ваше имя').fill('Ирина');
  await page.getByLabel('Время начала').fill('14:00');
  await page.getByRole('button', { name: 'Подтвердить бронирование' }).click();

  await page.getByRole('button', { name: 'Мои бронирования' }).click();
  await expect(page.getByRole('heading', { name: 'Мои бронирования' })).toBeVisible();
  await expect(page.getByLabel('Список бронирований')).toContainText('Ирина');

  await page.getByRole('button', { name: 'Аналитика загрузки' }).click();
  await expect(page.getByRole('heading', { name: 'Аналитика загрузки' })).toBeVisible();
  await expect(page.getByLabel('Тепловая карта столов')).toBeVisible();
  await expect(page.getByTestId('тепло-w1')).toBeVisible();

  await page.getByRole('button', { name: 'Мои бронирования' }).click();
  await page.getByRole('button', { name: 'Освободить стол Окно-1' }).click();
  await expect(page.getByText('Пока нет бронирований на сегодня.')).toBeVisible();
});
