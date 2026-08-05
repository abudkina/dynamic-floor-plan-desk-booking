import { useEffect, useId, useRef, useState } from 'react';
import { DESK_TYPE_LABELS } from '../data/constants.js';

/**
 * Модальное окно бронирования / отмены.
 */
export function BookingModal({
  desk,
  booking,
  onClose,
  onSubmit,
  onCancelBooking,
}) {
  const titleId = useId();
  const nameRef = useRef(null);
  const [name, setName] = useState('');
  const [time, setTime] = useState('09:00');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isOccupied = Boolean(booking);

  useEffect(() => {
    if (!isOccupied && nameRef.current) {
      nameRef.current.focus();
    }

    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOccupied, onClose]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await onSubmit({ name, time });
      if (!result.ok) {
        setError(result.error);
      }
    } catch {
      setError('Не удалось сохранить бронь. Попробуйте ещё раз.');
    } finally {
      setBusy(false);
    }
  };

  const handleCancel = async () => {
    setError('');
    setBusy(true);
    try {
      const result = await onCancelBooking();
      if (!result?.ok && result?.error) {
        setError(result.error);
      }
    } catch {
      setError('Не удалось отменить бронь.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="оверлей"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="модалка"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className="модалка__заголовок">
          {isOccupied ? 'Стол занят' : 'Забронировать стол'}
        </h2>
        <p className="модалка__описание">
          {desk.label} · {DESK_TYPE_LABELS[desk.type]}
          {isOccupied
            ? ` · ${booking.name} с ${booking.time}`
            : ' · укажите имя и время начала'}
        </p>

        {isOccupied ? (
          <>
            {error ? (
              <p className="ошибка" role="alert">
                {error}
              </p>
            ) : null}
            <div className="модалка__действия">
              <button
                type="button"
                className="кнопка кнопка--опасная"
                onClick={handleCancel}
                disabled={busy}
                aria-label="Отменить бронирование этого стола"
              >
                Освободить стол
              </button>
              <button
                type="button"
                className="кнопка"
                onClick={onClose}
                aria-label="Закрыть окно"
              >
                Закрыть
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <div className="поле">
              <label htmlFor="имя-брони">Ваше имя</label>
              <input
                id="имя-брони"
                ref={nameRef}
                type="text"
                name="name"
                autoComplete="name"
                placeholder="Например, Анна"
                maxLength={40}
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'ошибка-брони' : undefined}
                required
              />
            </div>
            <div className="поле">
              <label htmlFor="время-брони">Время начала</label>
              <input
                id="время-брони"
                type="time"
                name="time"
                value={time}
                onChange={(event) => setTime(event.target.value)}
                required
              />
            </div>
            {error ? (
              <p id="ошибка-брони" className="ошибка" role="alert">
                {error}
              </p>
            ) : null}
            <div className="модалка__действия">
              <button
                type="submit"
                className="кнопка кнопка--главная"
                disabled={busy}
                aria-label="Подтвердить бронирование"
              >
                Забронировать
              </button>
              <button
                type="button"
                className="кнопка"
                onClick={onClose}
                aria-label="Отменить и закрыть"
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
