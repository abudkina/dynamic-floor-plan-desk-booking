import { DESK_TYPE_LABELS } from '../data/constants.js';

/**
 * SVG-план офиса в 8-bit стиле.
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

        {/* Пол */}
        <rect x="0" y="0" width="320" height="200" fill="#15192b" />

        {/* Стены и окна */}
        <rect x="4" y="4" width="312" height="192" fill="none" stroke="#3d4466" strokeWidth="4" />
        <rect x="12" y="8" width="140" height="6" fill="#73eff7" opacity="0.85" />
        <rect x="172" y="8" width="120" height="6" fill="#73eff7" opacity="0.55" />

        {/* Зоны */}
        <rect x="12" y="18" width="148" height="70" fill="#1e2440" />
        <rect x="172" y="18" width="136" height="70" fill="#182038" />
        <rect x="12" y="92" width="148" height="96" fill="#221a2e" />
        <rect x="172" y="100" width="136" height="88" fill="#1a2438" />

        {/* Пиксельный декор: растения у окна */}
        <g aria-hidden="true">
          <rect x="148" y="40" width="8" height="8" fill="#38b764" />
          <rect x="150" y="36" width="4" height="4" fill="#a7f070" />
          <rect x="148" y="48" width="8" height="4" fill="#5b6ee1" />
          <rect x="292" y="40" width="8" height="8" fill="#38b764" />
          <rect x="294" y="36" width="4" height="4" fill="#a7f070" />
        </g>

        {/* Подписи зон */}
        <text x="20" y="88" fill="#94a1b2" fontSize="5" fontFamily="Courier New, monospace">
          У ОКНА
        </text>
        <text x="180" y="88" fill="#94a1b2" fontSize="5" fontFamily="Courier New, monospace">
          ТИХАЯ
        </text>
        <text x="20" y="190" fill="#94a1b2" fontSize="5" fontFamily="Courier New, monospace">
          ПЕРЕГОВОРКИ
        </text>
        <text x="180" y="190" fill="#94a1b2" fontSize="5" fontFamily="Courier New, monospace">
          ОТКРЫТАЯ
        </text>

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
              {/* Тень пикселя */}
              <rect
                x={desk.x + 2}
                y={desk.y + 2}
                width={desk.width}
                height={desk.height}
                fill="#0b0d16"
                opacity="0.45"
              />
              <rect
                className="стол__корпус"
                x={desk.x}
                y={desk.y}
                width={desk.width}
                height={desk.height}
              />
              {/* Монитор */}
              <rect
                x={desk.x + desk.width / 2 - 6}
                y={desk.y + 3}
                width={12}
                height={8}
                fill="#0b0d16"
              />
              <rect
                x={desk.x + desk.width / 2 - 5}
                y={desk.y + 4}
                width={10}
                height={6}
                fill={occupied ? '#f9c22b' : '#3cbcfc'}
              />
              <text
                className="стол__метка"
                x={desk.x + desk.width / 2}
                y={desk.y + desk.height - 4}
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
