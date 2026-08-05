import { ROUTE_LABELS, ROUTES } from '../utils/routes.js';

const ITEMS = [ROUTES.MAP, ROUTES.BOOKINGS, ROUTES.ANALYTICS];

/**
 * Главная навигация по страницам.
 */
export function Nav({ route, onNavigate }) {
  return (
    <nav className="навигация" aria-label="Основные разделы">
      {ITEMS.map((id) => (
        <button
          key={id}
          type="button"
          className="навигация__пункт"
          aria-current={route === id ? 'page' : undefined}
          aria-label={ROUTE_LABELS[id]}
          onClick={() => onNavigate(id)}
        >
          {ROUTE_LABELS[id]}
        </button>
      ))}
    </nav>
  );
}
