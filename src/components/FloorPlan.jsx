import { DESK_TYPE_LABELS } from '../data/constants.js';
import { ModernDeskSprite, ModernMapBackdrop } from './OfficeMap.jsx';

/**
 * SVG-план офиса в современном стиле.
 */
export function FloorPlan({
  desks,
  bookings,
  activeFilter,
  onDeskClick,
  onDeskHover,
  onDeskLeave,
}) {
  return (
    <div className="карта-обёртка">
      <svg
        className="карта-svg"
        viewBox="0 0 320 200"
        role="img"
        aria-label="План офиса со столами для бронирования"
      >
        <title>План офиса</title>
        <desc>
          Интерактивная карта: зелёные столы свободны, красные заняты. Нажмите
          на стол, чтобы забронировать или освободить.
        </desc>

        <ModernMapBackdrop />

        {desks.map((desk) => {
          const booking = bookings[desk.id];
          const occupied = Boolean(booking);
          const matchesFilter =
            !activeFilter || activeFilter === 'all' || desk.type === activeFilter;
          const statusClass = occupied ? 'стол--занято' : 'стол--свободно';
          const hiddenClass = matchesFilter ? '' : ' стол--скрыт';
          const typeLabel = DESK_TYPE_LABELS[desk.type];
          const statusLabel = occupied
            ? `занят, ${booking.name}`
            : 'свободен';

          return (
            <g
              key={desk.id}
              className={`стол ${statusClass} ${hiddenClass}`.trim()}
              role="button"
              tabIndex={matchesFilter ? 0 : -1}
              aria-label={`Стол ${desk.label}, ${typeLabel}, ${statusLabel}`}
              aria-disabled={!matchesFilter}
              data-desk-id={desk.id}
              data-testid={`стол-${desk.id}`}
              onClick={() => matchesFilter && onDeskClick(desk)}
              onKeyDown={(event) => {
                if (!matchesFilter) return;
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onDeskClick(desk);
                }
              }}
              onMouseEnter={(event) => {
                if (occupied && matchesFilter) {
                  onDeskHover(desk, booking, event);
                }
              }}
              onMouseLeave={() => onDeskLeave()}
              onFocus={(event) => {
                if (occupied && matchesFilter) {
                  onDeskHover(desk, booking, event);
                }
              }}
              onBlur={() => onDeskLeave()}
            >
              <ModernDeskSprite desk={desk} occupied={occupied} />
              <text
                className="стол__метка"
                x={desk.x + desk.width / 2}
                y={desk.y + desk.height - 3}
                textAnchor="middle"
              >
                {desk.label.replace(/^(Окно|Тихая|Перег)-/, '')}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
