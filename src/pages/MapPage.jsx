import { DESK_TYPE_LABELS } from '../data/constants.js';
import { AdminPanel } from '../components/AdminPanel.jsx';
import { FilterBar } from '../components/FilterBar.jsx';
import { FloorPlan } from '../components/FloorPlan.jsx';
import { OccupancyTooltip } from '../components/OccupancyTooltip.jsx';

/**
 * Страница: интерактивная карта офиса.
 */
export function MapPage({
  desks,
  bookings,
  filter,
  onFilterChange,
  stats,
  adminVisible,
  onAdminToggle,
  onAdminReset,
  onAdminHide,
  onDeskClick,
  onDeskHover,
  onDeskLeave,
  tooltip,
  avatarUrl,
}) {
  return (
    <section className="страница" aria-labelledby="заголовок-карта">
      <h2 id="заголовок-карта" className="страница__заголовок">
        Карта офиса
      </h2>
      <p className="страница__описание">
        Кликните по столу, чтобы забронировать место на день. Зелёный —
        свободно, красный — занято.
      </p>

      <div className="статистика-чипы" aria-live="polite">
        <span className="статистика-чип">
          Свободно <strong>{stats.свободно}</strong>
        </span>
        <span className="статистика-чип">
          Занято <strong>{stats.занято}</strong>
        </span>
        <span className="статистика-чип">
          Загрузка <strong>{stats.процент}%</strong>
        </span>
      </div>

      <button
        type="button"
        className="админ-триггер"
        aria-label="Открыть режим администратора"
        title="Режим администратора"
        onClick={onAdminToggle}
      />

      <FilterBar value={filter} onChange={onFilterChange} />

      <AdminPanel
        visible={adminVisible}
        onReset={onAdminReset}
        onHide={onAdminHide}
      />

      <div style={{ position: 'relative' }}>
        <FloorPlan
          desks={desks}
          bookings={bookings}
          activeFilter={filter}
          onDeskClick={onDeskClick}
          onDeskHover={onDeskHover}
          onDeskLeave={onDeskLeave}
        />
        {tooltip ? (
          <OccupancyTooltip
            booking={tooltip.booking}
            avatarUrl={avatarUrl}
            style={tooltip.style}
          />
        ) : null}
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
        <span className="легенда__пункт">
          Типы: {Object.values(DESK_TYPE_LABELS).join(', ')}
        </span>
      </div>
    </section>
  );
}
