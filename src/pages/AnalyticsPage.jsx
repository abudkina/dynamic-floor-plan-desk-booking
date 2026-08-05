import { DESK_TYPE_LABELS } from '../data/constants.js';
import { heatIntensity, zoneOccupancy } from '../utils/booking.js';

/**
 * Цвет тепловой карты: холодно → горячо.
 * @param {number} intensity 0..1
 * @returns {string}
 */
function heatColor(intensity) {
  if (intensity >= 1) return '#e43b44';
  if (intensity >= 0.66) return '#f9c22b';
  if (intensity >= 0.33) return '#3cbcfc';
  return '#38b764';
}

/**
 * Страница аналитики: зоны + тепловая карта.
 */
export function AnalyticsPage({ desks, bookings, stats }) {
  const zones = zoneOccupancy(bookings, desks);

  return (
    <section className="страница" aria-labelledby="заголовок-аналитика">
      <h2 id="заголовок-аналитика" className="страница__заголовок">
        Аналитика загрузки
      </h2>
      <p className="страница__описание">
        Тепловая карта на сегодня: зелёный — свободно, красный — занято.
      </p>

      <div className="статистика" aria-live="polite">
        <span>
          Общая загрузка: <strong>{stats.процент}%</strong>
        </span>
        <span>
          Занято: <strong>{stats.занято}</strong> / {desks.length}
        </span>
      </div>

      <ul className="зоны-статистика" aria-label="Загрузка по зонам">
        {zones.map((zone) => (
          <li key={zone.type} className="зоны-статистика__пункт">
            <div className="зоны-статистика__шапка">
              <strong>{DESK_TYPE_LABELS[zone.type] || zone.type}</strong>
              <span>{zone.процент}%</span>
            </div>
            <div
              className="зоны-статистика__полоса"
              role="meter"
              aria-label={`Загрузка зоны ${DESK_TYPE_LABELS[zone.type] || zone.type}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={zone.процент}
            >
              <span style={{ width: `${zone.процент}%` }} />
            </div>
            <p className="зоны-статистика__мета">
              Занято {zone.занято} из {zone.всего}
            </p>
          </li>
        ))}
      </ul>

      <div className="карта-обёртка" aria-label="Тепловая карта столов">
        <svg
          className="карта-svg"
          viewBox="0 0 320 200"
          role="img"
          aria-label="Тепловая карта занятости столов"
        >
          <title>Тепловая карта</title>
          <rect x="0" y="0" width="320" height="200" fill="#15192b" />
          <rect
            x="4"
            y="4"
            width="312"
            height="192"
            fill="none"
            stroke="#3d4466"
            strokeWidth="4"
          />
          {desks.map((desk) => {
            const intensity = heatIntensity(bookings, desk.id);
            const booking = bookings[desk.id];
            return (
              <g key={desk.id} data-testid={`тепло-${desk.id}`}>
                <rect
                  x={desk.x}
                  y={desk.y}
                  width={desk.width}
                  height={desk.height}
                  fill={heatColor(intensity)}
                  stroke="#0b0d16"
                  strokeWidth="1"
                >
                  <title>
                    {desk.label}:{' '}
                    {booking ? `занят (${booking.name})` : 'свободен'}
                  </title>
                </rect>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="легенда" aria-hidden="true">
        <span className="легенда__пункт">
          <span className="легенда__цвет" style={{ background: '#38b764' }} />
          Свободно
        </span>
        <span className="легенда__пункт">
          <span className="легенда__цвет" style={{ background: '#e43b44' }} />
          Занято
        </span>
      </div>
    </section>
  );
}
