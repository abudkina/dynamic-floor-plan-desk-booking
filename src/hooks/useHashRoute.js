import { useEffect, useState } from 'react';
import { parseRoute, toHash } from '../utils/routes.js';

/**
 * Навигация через URL hash.
 * @returns {[string, (route: string) => void]}
 */
export function useHashRoute() {
  const [route, setRouteState] = useState(() =>
    parseRoute(typeof window !== 'undefined' ? window.location.hash : ''),
  );

  useEffect(() => {
    const onHash = () => setRouteState(parseRoute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const navigate = (next) => {
    const hash = toHash(next);
    setRouteState(parseRoute(hash));
    if (typeof window !== 'undefined' && window.location.hash !== hash) {
      window.location.hash = hash;
    }
  };

  return [route, navigate];
}
