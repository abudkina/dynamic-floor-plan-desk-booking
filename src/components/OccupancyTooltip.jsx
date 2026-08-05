/**
 * Всплывающая подсказка для занятого стола.
 */
export function OccupancyTooltip({ booking, avatarUrl, style }) {
  if (!booking) return null;

  return (
    <div
      className="подсказка"
      style={style}
      role="tooltip"
      aria-live="polite"
    >
      {avatarUrl ? (
        <img
          className="подсказка__аватар"
          src={avatarUrl}
          alt={`Аватар сотрудника ${booking.name}`}
          width={40}
          height={40}
        />
      ) : (
        <div
          className="подсказка__аватар"
          aria-hidden="true"
          style={{ background: '#262b44' }}
        />
      )}
      <div>
        <p className="подсказка__имя">{booking.name}</p>
        <p className="подсказка__цитата">«{booking.quote || 'Я работаю!'}»</p>
        <p className="подсказка__время">с {booking.time}</p>
      </div>
    </div>
  );
}
