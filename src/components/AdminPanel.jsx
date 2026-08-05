/**
 * Скрытая админ-панель для сброса бронирований.
 */
export function AdminPanel({ visible, onReset, onHide }) {
  if (!visible) return null;

  return (
    <section className="админ-панель" aria-label="Режим администратора">
      <p>
        Режим администратора: можно сбросить все бронирования на сегодня.
      </p>
      <button
        type="button"
        className="кнопка кнопка--опасная"
        aria-label="Сбросить все бронирования"
        onClick={onReset}
      >
        Сбросить все брони
      </button>
      <button
        type="button"
        className="кнопка"
        aria-label="Скрыть панель администратора"
        onClick={onHide}
      >
        Скрыть
      </button>
    </section>
  );
}
