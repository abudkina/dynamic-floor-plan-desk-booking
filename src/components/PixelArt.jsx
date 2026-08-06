/**
 * Общий пиксельный фон офиса (пол, стены, окна, декор).
 */

/** Шахматная плитка пола 8×8. */
function PixelFloor() {
  const tiles = [];
  for (let y = 0; y < 25; y += 1) {
    for (let x = 0; x < 40; x += 1) {
      const dark = (x + y) % 2 === 0;
      tiles.push(
        <rect
          key={`п-${x}-${y}`}
          x={x * 8}
          y={y * 8}
          width={8}
          height={8}
          fill={dark ? '#121628' : '#161b30'}
        />,
      );
    }
  }
  return <g aria-hidden="true">{tiles}</g>;
}

/** Стена из «кирпичей». */
function PixelWall({ x, y, width, height }) {
  const bricks = [];
  const bh = 4;
  const bw = 8;
  for (let row = 0; row < Math.ceil(height / bh); row += 1) {
    const offset = row % 2 === 0 ? 0 : 4;
    for (let col = -1; col < Math.ceil(width / bw) + 1; col += 1) {
      const bx = x + col * bw + offset;
      const by = y + row * bh;
      if (bx + bw <= x || bx >= x + width || by >= y + height) continue;
      const clippedX = Math.max(bx, x);
      const clippedW = Math.min(bx + bw, x + width) - clippedX;
      const clippedH = Math.min(bh - 1, y + height - by);
      if (clippedW <= 0 || clippedH <= 0) continue;
      bricks.push(
        <rect
          key={`к-${x}-${y}-${row}-${col}`}
          x={clippedX}
          y={by}
          width={clippedW}
          height={clippedH}
          fill={row % 2 === 0 ? '#2a3050' : '#232844'}
        />,
      );
    }
  }
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={width} height={height} fill="#1c2038" />
      {bricks}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill="none"
        stroke="#0b0d16"
        strokeWidth="1"
      />
    </g>
  );
}

/** Окно: рама + пиксельное небо. */
function PixelWindow({ x, y, width }) {
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={width} height={10} fill="#0b0d16" />
      <rect x={x + 2} y={y + 2} width={width - 4} height={6} fill="#3cbcfc" />
      <rect x={x + 2} y={y + 2} width={width - 4} height={3} fill="#73eff7" />
      <rect x={x + Math.floor(width / 2) - 1} y={y + 2} width={2} height={6} fill="#0b0d16" />
      {/* облака */}
      <rect x={x + 6} y={y + 3} width={4} height={2} fill="#f4f4f4" opacity="0.7" />
      <rect x={x + width - 14} y={y + 4} width={6} height={2} fill="#f4f4f4" opacity="0.55" />
    </g>
  );
}

/** Кустик / вазон. */
function PixelPlant({ x, y }) {
  return (
    <g aria-hidden="true">
      <rect x={x + 2} y={y + 10} width={8} height={4} fill="#5b6ee1" />
      <rect x={x + 4} y={y + 8} width={4} height={2} fill="#3d4466" />
      <rect x={x + 2} y={y + 2} width={4} height={4} fill="#257a45" />
      <rect x={x + 6} y={y} width={4} height={6} fill="#38b764" />
      <rect x={x + 4} y={y + 4} width={4} height={4} fill="#a7f070" />
      <rect x={x + 8} y={y + 2} width={2} height={2} fill="#a7f070" />
    </g>
  );
}

/** Ковёр зоны пикселями. */
function PixelRug({ x, y, width, height, color }) {
  return (
    <g aria-hidden="true">
      <rect x={x} y={y} width={width} height={height} fill={color} />
      <rect
        x={x + 2}
        y={y + 2}
        width={width - 4}
        height={height - 4}
        fill="none"
        stroke="#0b0d16"
        strokeWidth="2"
        strokeDasharray="4 4"
        opacity="0.35"
      />
    </g>
  );
}

/**
 * Фон карты офиса.
 */
export function PixelMapBackdrop({ showLabels = true }) {
  return (
    <g>
      <PixelFloor />
      <PixelWall x={0} y={0} width={320} height={8} />
      <PixelWall x={0} y={0} width={8} height={200} />
      <PixelWall x={312} y={0} width={8} height={200} />
      <PixelWall x={0} y={192} width={320} height={8} />

      <PixelWindow x={16} y={8} width={132} />
      <PixelWindow x={172} y={8} width={108} />

      <PixelRug x={12} y={22} width={148} height={62} color="#1a2240" />
      <PixelRug x={172} y={22} width={132} height={62} color="#182038" />
      <PixelRug x={12} y={96} width={148} height={88} color="#241828" />
      <PixelRug x={172} y={100} width={132} height={84} color="#1a2438" />

      <PixelPlant x={148} y={36} />
      <PixelPlant x={292} y={36} />
      <PixelPlant x={148} y={160} />

      {/* дверь */}
      <g aria-hidden="true">
        <rect x={148} y={184} width={24} height={8} fill="#0b0d16" />
        <rect x={150} y={186} width={20} height={6} fill="#b55088" />
        <rect x={166} y={188} width={2} height={2} fill="#f9c22b" />
      </g>

      {showLabels ? (
        <g aria-hidden="true" style={{ fontFamily: "'Courier New', monospace" }}>
          <text x={20} y={80} fill="#94a1b2" fontSize="6">
            У ОКНА
          </text>
          <text x={180} y={80} fill="#94a1b2" fontSize="6">
            ТИХАЯ
          </text>
          <text x={20} y={186} fill="#94a1b2" fontSize="6">
            ПЕРЕГОВОРКИ
          </text>
          <text x={180} y={186} fill="#94a1b2" fontSize="6">
            ОТКРЫТАЯ
          </text>
        </g>
      ) : null}
    </g>
  );
}

/**
 * Пиксельный спрайт стола: корпус, монитор, клавиатура, стул.
 */
export function PixelDeskSprite({ desk, occupied, heatFill }) {
  const { x, y, width, height } = desk;
  const body = heatFill || (occupied ? '#e43b44' : '#38b764');
  const bodyDark = occupied || heatFill === '#e43b44' ? '#a32c32' : '#257a45';
  const screen = occupied ? '#f9c22b' : '#3cbcfc';
  const mx = x + Math.floor(width / 2) - 6;

  return (
    <g aria-hidden="true">
      {/* стул */}
      <rect x={x + width / 2 - 5} y={y + height + 1} width={10} height={3} fill="#3d4466" />
      <rect x={x + width / 2 - 4} y={y + height - 1} width={8} height={2} fill="#5b6ee1" />

      {/* тень */}
      <rect x={x + 2} y={y + 2} width={width} height={height} fill="#0b0d16" />

      {/* корпус стола */}
      <rect className="стол__корпус" x={x} y={y} width={width} height={height} fill={body} />
      <rect x={x} y={y + height - 3} width={width} height={3} fill={bodyDark} />
      <rect x={x} y={y} width={2} height={height} fill="#ffffff33" />

      {/* монитор */}
      <rect x={mx} y={y + 2} width={12} height={9} fill="#0b0d16" />
      <rect x={mx + 1} y={y + 3} width={10} height={7} fill={screen} />
      <rect x={mx + 3} y={y + 5} width={2} height={2} fill="#0b0d16" opacity="0.35" />
      <rect x={mx + 5} y={y + 11} width={2} height={2} fill="#0b0d16" />

      {/* клавиатура */}
      <rect x={mx - 2} y={y + height - 7} width={16} height={3} fill="#0b0d16" />
      <rect x={mx - 1} y={y + height - 6} width={2} height={1} fill="#94a1b2" />
      <rect x={mx + 2} y={y + height - 6} width={2} height={1} fill="#94a1b2" />
      <rect x={mx + 5} y={y + height - 6} width={2} height={1} fill="#94a1b2" />
      <rect x={mx + 8} y={y + height - 6} width={2} height={1} fill="#94a1b2" />
      <rect x={mx + 11} y={y + height - 6} width={2} height={1} fill="#94a1b2" />

      {/* кружка */}
      <rect x={x + 2} y={y + height - 8} width={3} height={3} fill="#b55088" />
      <rect x={x + 5} y={y + height - 7} width={1} height={1} fill="#b55088" />
    </g>
  );
}
