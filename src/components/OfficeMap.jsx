/**
 * Современная SVG-карта офиса: мягкие формы, градиенты, скругления.
 */

/** Фон: пол, зоны, окна. */
export function ModernMapBackdrop({ showLabels = true }) {
  return (
    <g>
      <defs>
        <linearGradient id="пол" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="окно" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <filter id="map-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.08" />
        </filter>
      </defs>

      <rect x="0" y="0" width="320" height="200" fill="url(#пол)" rx="12" />

      {/* стены */}
      <rect
        x="8"
        y="8"
        width="304"
        height="184"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
        rx="10"
      />

      {/* окна */}
      <rect x="20" y="12" width="120" height="8" fill="url(#окно)" rx="4" />
      <rect x="180" y="12" width="100" height="8" fill="url(#окно)" rx="4" opacity="0.85" />

      {/* зоны */}
      <rect x="16" y="28" width="140" height="58" fill="#ffffff" rx="8" opacity="0.7" />
      <rect x="168" y="28" width="136" height="58" fill="#ffffff" rx="8" opacity="0.55" />
      <rect x="16" y="96" width="140" height="84" fill="#ffffff" rx="8" opacity="0.5" />
      <rect x="168" y="100" width="136" height="80" fill="#ffffff" rx="8" opacity="0.45" />

      {/* декор */}
      <circle cx="158" cy="48" r="6" fill="#86efac" opacity="0.9" />
      <circle cx="298" cy="48" r="6" fill="#86efac" opacity="0.9" />
      <rect x="150" y="178" width="20" height="6" fill="#c4b5fd" rx="3" />

      {showLabels ? (
        <g fill="#64748b" fontSize="7" fontFamily="system-ui, sans-serif" fontWeight="600">
          <text x="24" y="82">У окна</text>
          <text x="176" y="82">Тихая зона</text>
          <text x="24" y="184">Переговорки</text>
          <text x="176" y="184">Открытая зона</text>
        </g>
      ) : null}
    </g>
  );
}

/**
 * Современный стол: скруглённый, с монитором.
 */
export function ModernDeskSprite({ desk, occupied, heatFill }) {
  const { x, y, width, height } = desk;
  const free = '#22c55e';
  const busy = '#ef4444';
  const fill = heatFill || (occupied ? busy : free);
  const fillDark = occupied || heatFill === busy ? '#dc2626' : '#16a34a';
  const mx = x + width / 2 - 5;

  return (
    <g filter="url(#map-shadow)" aria-hidden="true">
      <rect
        className="стол__корпус"
        x={x}
        y={y}
        width={width}
        height={height}
        rx={5}
        fill={fill}
        stroke={fillDark}
        strokeWidth="1"
      />
      <rect
        x={mx}
        y={y + 3}
        width={10}
        height={7}
        rx={2}
        fill="#ffffff"
        opacity="0.92"
      />
      <rect
        x={mx + 1}
        y={y + 4}
        width={8}
        height={5}
        rx={1}
        fill={occupied ? '#fef3c7' : '#dbeafe'}
      />
    </g>
  );
}
