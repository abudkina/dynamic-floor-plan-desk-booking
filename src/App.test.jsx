import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App.jsx';
import { STORAGE_KEY } from './data/constants.js';

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
    window.location.hash = '';
  });

  it('рендерит заголовок и навигацию на русском', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: 'План офиса' })).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Основные разделы' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Фильтр по типу мест' })).toBeInTheDocument();
  });

  it('открывает модалку и бронирует стол', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByTestId('стол-w1'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Ваше имя'), 'Анна');
    await user.clear(screen.getByLabelText('Время начала'));
    await user.type(screen.getByLabelText('Время начала'), '10:30');
    await user.click(screen.getByRole('button', { name: 'Подтвердить бронирование' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    expect(saved.w1.name).toBe('Анна');
  });

  it('валидирует пустое имя', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByTestId('стол-w2'));
    await user.click(screen.getByRole('button', { name: 'Подтвердить бронирование' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/короткое|Имя/i);
  });

  it('фильтрует типы мест', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Фильтр: Переговорка' }));
    expect(screen.getByRole('button', { name: 'Фильтр: Переговорка' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('переключает страницы: бронирования и аналитика', async () => {
    const user = userEvent.setup();
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        w1: {
          deskId: 'w1',
          name: 'Анна',
          time: '09:00',
          date,
          quote: 'Я работаю!',
          avatarSeed: 1,
          createdAt: today.toISOString(),
        },
      }),
    );

    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Мои бронирования' }));
    expect(screen.getByRole('heading', { name: 'Мои бронирования' })).toBeInTheDocument();
    expect(screen.getByLabelText('Список бронирований')).toBeInTheDocument();
    expect(screen.getByText('Анна', { exact: false })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Аналитика загрузки' }));
    expect(screen.getByRole('heading', { name: 'Аналитика загрузки' })).toBeInTheDocument();
    expect(screen.getByLabelText('Тепловая карта столов')).toBeInTheDocument();
  });

  it('открывает админ-режим и сбрасывает брони', async () => {
    const user = userEvent.setup();
    const today = new Date();
    const date = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        w1: {
          deskId: 'w1',
          name: 'Тест',
          time: '09:00',
          date,
          quote: 'Я работаю!',
          avatarSeed: 1,
          createdAt: today.toISOString(),
        },
      }),
    );

    window.confirm = () => true;
    render(<App />);
    await user.click(screen.getByLabelText('Открыть режим администратора'));
    expect(screen.getByLabelText('Режим администратора')).toBeInTheDocument();
    await user.click(screen.getByLabelText('Сбросить все бронирования'));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
