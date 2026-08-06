import { DESK_TYPE_LABELS } from '../data/constants.js';
import { ModernDeskSprite, ModernMapBackdrop } from '../components/OfficeMap.jsx';
import { heatIntensity, zoneOccupancy } from '../utils/booking.js';

function heatColor(intensity) {
  if (intensity >= 1) return '#ef4444';
  if (intensity >= 0.66) return '#f59e0b';
  if (intensity >= 0.33) return '#3b82f6';
  return '#22c55e';
}

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

      <div className="статистика-чипы" aria-live="polite">
        <span className="статистика-чип">
          Загрузка <strong>{stats.процент}%</strong>
        </span>
        <span className="статистика-чип">
          Занято <strong>{stats.занято}</strong> / {desks.length}
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
          <ModernMapBackdrop showLabels={false} />
          {desks.map((desk) => {
            const intensity = heatIntensity(bookings, desk.id);
            const booking = bookings[desk.id];
            const fill = heatColor(intensity);
            return (
              <g key={desk.id} data-testid={`тепло-${desk.id}`}>
                <title>
                  {desk.label}: {booking ? `занят (${booking.name})` : 'свободен'}
                </title>
                <ModernDeskSprite
                  desk={desk}
                  occupied={Boolean(booking)}
                  heatFill={fill}
                />
              </g>
            );
          })}
        </svg>
      </div>

      <div className="легенда" aria-hidden="true">
        <span className="легенда__пункт">
          <span className="легенда__цвет легенда__цвет--свободно" />
          Свободно
        </span>
        <span className="легенда__пункт">
          <span className="легенда__цвет легенда__цвет--занято" />
          Занято
        </span>
      </div>
    </section>
  );
}
