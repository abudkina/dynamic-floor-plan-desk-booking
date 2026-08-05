import { DESK_TYPES, DESK_TYPE_LABELS } from '../data/constants.js';

const FILTERS = [
  { id: 'all', label: 'Все места' },
  { id: DESK_TYPES.WINDOW, label: DESK_TYPE_LABELS[DESK_TYPES.WINDOW] },
  { id: DESK_TYPES.MEETING, label: DESK_TYPE_LABELS[DESK_TYPES.MEETING] },
  { id: DESK_TYPES.QUIET, label: DESK_TYPE_LABELS[DESK_TYPES.QUIET] },
];

/**
 * Панель фильтров по типу мест.
 */
export function FilterBar({ value, onChange }) {
  return (
    <div className="панель-фильтров" role="group" aria-label="Фильтр по типу мест">
      <span className="панель-фильтров__метка">Тип места:</span>
      {FILTERS.map((item) => (
        <button
          key={item.id}
          type="button"
          className="чип"
          aria-pressed={value === item.id}
          aria-label={`Фильтр: ${item.label}`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
