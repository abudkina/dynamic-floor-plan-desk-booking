import { DESK_TYPE_LABELS } from '../data/constants.js';
import { bookingsList } from '../utils/booking.js';

/**
 * Страница: список бронирований на сегодня.
 */
export function BookingsPage({ desks, bookings, onCancel, onGoToMap }) {
  const list = bookingsList(bookings, desks);

  return (
    <section className="страница" aria-labelledby="заголовок-брони">
      <h2 id="заголовок-брони" className="страница__заголовок">
        Мои бронирования
      </h2>
      <p className="страница__описание">
        Все брони на сегодня в этом браузере. Можно освободить стол из списка.
      </p>

      {list.length === 0 ? (
        <div className="пустой-блок">
          <p>Пока нет бронирований на сегодня.</p>
          <button
            type="button"
            className="кнопка кнопка--главная"
            aria-label="Перейти к карте офиса"
            onClick={onGoToMap}
          >
            Открыть карту
          </button>
        </div>
      ) : (
        <ul className="список-броней" aria-label="Список бронирований">
          {list.map((item) => (
            <li key={item.deskId} className="список-броней__пункт">
              <div>
                <p className="список-броней__стол">{item.deskLabel}</p>
                <p className="список-броней__мета">
                  {DESK_TYPE_LABELS[item.deskType] || 'Место'} · {item.name} · с{' '}
                  {item.time}
                </p>
              </div>
              <button
                type="button"
                className="кнопка кнопка--опасная"
                aria-label={`Освободить стол ${item.deskLabel}`}
                onClick={() => onCancel(item.deskId)}
              >
                Освободить
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
