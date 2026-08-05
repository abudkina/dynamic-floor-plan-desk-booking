import { useCallback, useEffect, useState } from 'react';
import { BookingModal } from './components/BookingModal.jsx';
import { Nav } from './components/Nav.jsx';
import { DESKS } from './data/desks.js';
import { useHashRoute } from './hooks/useHashRoute.js';
import { AnalyticsPage } from './pages/AnalyticsPage.jsx';
import { BookingsPage } from './pages/BookingsPage.jsx';
import { MapPage } from './pages/MapPage.jsx';
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
import { ROUTES } from './utils/routes.js';
import { computeStatsAsync } from './workers/workerClient.js';
import './styles/app.css';

/**
 * Корневое приложение: три страницы + бронирование.
 */
export default function App() {
  const [route, navigate] = useHashRoute();
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

  const handleCancelById = (deskId) => {
    const next = cancelBooking(bookings, deskId);
    if (!persist(next)) return;
    logger.info('Бронь отменена из списка', { deskId });
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

  return (
    <div className="приложение">
      <header className="шапка">
        <h1 className="шапка__бренд">План офиса</h1>
        <p className="шапка__подзаголовок">
          Карта, список броней и аналитика загрузки — без сервера, данные в
          браузере.
        </p>
        <Nav route={route} onNavigate={navigate} />
      </header>

      <main>
        {route === ROUTES.MAP ? (
          <MapPage
            desks={DESKS}
            bookings={bookings}
            filter={filter}
            onFilterChange={setFilter}
            stats={stats}
            adminVisible={adminVisible}
            onAdminToggle={() => setAdminVisible((v) => !v)}
            onAdminReset={handleAdminReset}
            onAdminHide={() => setAdminVisible(false)}
            onDeskClick={handleDeskClick}
            onDeskHover={handleDeskHover}
            onDeskLeave={() => setTooltip(null)}
            tooltip={tooltip}
            avatarUrl={avatarUrl}
          />
        ) : null}

        {route === ROUTES.BOOKINGS ? (
          <BookingsPage
            desks={DESKS}
            bookings={bookings}
            onCancel={handleCancelById}
            onGoToMap={() => navigate(ROUTES.MAP)}
          />
        ) : null}

        {route === ROUTES.ANALYTICS ? (
          <AnalyticsPage desks={DESKS} bookings={bookings} stats={stats} />
        ) : null}
      </main>

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
