import { useCallback, useEffect, useState } from 'react';
import { AdminPanel } from './components/AdminPanel.jsx';
import { BookingModal } from './components/BookingModal.jsx';
import { FilterBar } from './components/FilterBar.jsx';
import { FloorPlan } from './components/FloorPlan.jsx';
import { OccupancyTooltip } from './components/OccupancyTooltip.jsx';
import { DESKS } from './data/desks.js';
import { logger } from './services/logger.js';
import {
  clearBookingsStorage,
  loadBookings,
  saveBookings,
} from './services/storage.js';
import { generateAvatarDataUrl } from './utils/avatar.js';
import {
  cancelBooking,
  clearAllBookings,
  createBooking,
  occupancyStats,
} from './utils/booking.js';
import { computeStatsAsync } from './workers/workerClient.js';
import './styles/app.css';

/**
 * Корневое приложение: карта офиса и бронирование столов.
 */
export default function App() {
  const [bookings, setBookings] = useState(() => loadBookings());
  const [filter, setFilter] = useState('all');
  const [selectedDesk, setSelectedDesk] = useState(null);
  const [adminVisible, setAdminVisible] = useState(false);
  const [toast, setToast] = useState('');
  const [stats, setStats] = useState(() =>
    occupancyStats(loadBookings(), DESKS.length),
  );
  const [tooltip, setTooltip] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    let cancelled = false;
    computeStatsAsync(bookings, DESKS.length).then((result) => {
      if (!cancelled) setStats(result);
    });
    return () => {
      cancelled = true;
    };
  }, [bookings]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showError = useCallback((message) => {
    setToast(message);
    logger.warn(message);
  }, []);

  const persist = useCallback(
    (next) => {
      const result = saveBookings(next);
      if (!result.ok) {
        showError(result.error);
        return false;
      }
      setBookings(next);
      return true;
    },
    [showError],
  );

  const handleDeskClick = (desk) => {
    setTooltip(null);
    setSelectedDesk(desk);
  };

  const handleBook = async ({ name, time }) => {
    if (!selectedDesk) {
      return { ok: false, error: 'Стол не выбран.' };
    }

    const result = createBooking({
      deskId: selectedDesk.id,
      name,
      time,
      allowedDeskIds: DESKS.map((d) => d.id),
      existing: bookings,
    });

    if (!result.ok) return result;

    const next = { ...bookings, [selectedDesk.id]: result.booking };
    if (!persist(next)) {
      return { ok: false, error: 'Не удалось сохранить бронь.' };
    }

    logger.info('Стол забронирован', { deskId: selectedDesk.id });
    setSelectedDesk(null);
    return { ok: true };
  };

  const handleCancelBooking = async () => {
    if (!selectedDesk) {
      return { ok: false, error: 'Стол не выбран.' };
    }
    const next = cancelBooking(bookings, selectedDesk.id);
    if (!persist(next)) {
      return { ok: false, error: 'Не удалось освободить стол.' };
    }
    logger.info('Бронь отменена', { deskId: selectedDesk.id });
    setSelectedDesk(null);
    return { ok: true };
  };

  const handleAdminReset = () => {
    const confirmed = window.confirm(
      'Сбросить все бронирования на сегодня? Это действие нельзя отменить.',
    );
    if (!confirmed) return;

    const cleared = clearBookingsStorage();
    if (!cleared.ok) {
      showError(cleared.error);
      return;
    }
    setBookings(clearAllBookings());
    setSelectedDesk(null);
    setTooltip(null);
    logger.info('Все бронирования сброшены администратором');
  };

  const handleDeskHover = async (desk, booking, event) => {
    const wrapper = event.currentTarget.closest('.карта-обёртка');
    const bounds = wrapper?.getBoundingClientRect();
    const point = event.currentTarget.getBoundingClientRect();

    const left = Math.min(
      Math.max(8, point.left - (bounds?.left || 0) + point.width / 2 - 90),
      (bounds?.width || 300) - 230,
    );
    const top = Math.max(8, point.top - (bounds?.top || 0) - 88);

    setTooltip({ booking, style: { left, top } });

    try {
      const url = await generateAvatarDataUrl(booking.avatarSeed || 1);
      setAvatarUrl(url);
    } catch {
      setAvatarUrl('');
    }
  };

  const handleDeskLeave = () => {
    setTooltip(null);
  };

  return (
    <div className="приложение">
      <header className="шапка">
        <h1 className="шапка__бренд">План офиса</h1>
        <p className="шапка__подзаголовок">
          Интерактивная карта: кликните по столу, чтобы забронировать место на
          день. Зелёный — свободно, красный — занято.
        </p>
        <div className="статистика" aria-live="polite">
          <span>
            Свободно: <strong>{stats.свободно}</strong>
          </span>
          <span>
            Занято: <strong>{stats.занято}</strong>
          </span>
          <span>
            Загрузка: <strong>{stats.процент}%</strong>
          </span>
        </div>
        <button
          type="button"
          className="админ-триггер"
          aria-label="Открыть режим администратора"
          title="Режим администратора"
          onClick={() => setAdminVisible((v) => !v)}
        />
      </header>

      <FilterBar value={filter} onChange={setFilter} />

      <AdminPanel
        visible={adminVisible}
        onReset={handleAdminReset}
        onHide={() => setAdminVisible(false)}
      />

      <main>
        <h2 className="визуально-скрыто">Карта рабочих мест</h2>
        <div style={{ position: 'relative' }}>
          <FloorPlan
            desks={DESKS}
            bookings={bookings}
            activeFilter={filter}
            onDeskClick={handleDeskClick}
            onDeskHover={handleDeskHover}
            onDeskLeave={handleDeskLeave}
          />
          {tooltip ? (
            <OccupancyTooltip
              booking={tooltip.booking}
              avatarUrl={avatarUrl}
              style={tooltip.style}
            />
          ) : null}
        </div>
      </main>

      <div className="легенда" aria-hidden="true">
        <span className="легенда__пункт">
          <span className="легенда__цвет легенда__цвет--свободно" />
          Свободно
        </span>
        <span className="легенда__пункт">
          <span className="легенда__цвет легенда__цвет--занято" />
          Занято
        </span>
      </div>

      <footer className="подвал">
        Данные хранятся только в вашем браузере · брони на один день
      </footer>

      {selectedDesk ? (
        <BookingModal
          desk={selectedDesk}
          booking={bookings[selectedDesk.id]}
          onClose={() => setSelectedDesk(null)}
          onSubmit={handleBook}
          onCancelBooking={handleCancelBooking}
        />
      ) : null}

      {toast ? (
        <div className="тост" role="alert">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
