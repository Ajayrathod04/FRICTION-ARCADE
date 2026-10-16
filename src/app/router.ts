import { useState, useEffect } from 'react';

export type AppRoute = 'landing' | 'game';

export interface RouteState {
  route: AppRoute;
  params: {
    mode?: '2d' | '3d';
  };
}

function parseCurrentLocation(): RouteState {
  if (typeof window === 'undefined') {
    return { route: 'landing', params: {} };
  }

  // Support both hash-based routing (#/play) and path-based routing (/play)
  const hash = window.location.hash;
  const pathname = window.location.pathname;
  const search = window.location.search;

  const isPlay = hash.startsWith('#/play') || hash.startsWith('#play') || pathname === '/play';
  const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : search);
  const mode = urlParams.get('mode') === '2d' ? '2d' : '3d';

  if (isPlay) {
    return {
      route: 'game',
      params: { mode },
    };
  }

  return {
    route: 'landing',
    params: {},
  };
}

export function useRouter() {
  const [routeState, setRouteState] = useState<RouteState>(parseCurrentLocation);

  useEffect(() => {
    const handleLocationChange = () => {
      setRouteState(parseCurrentLocation());
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const navigateTo = (route: AppRoute, params?: { mode?: '2d' | '3d' }) => {
    if (route === 'game') {
      const modeParam = params?.mode === '2d' ? '?mode=2d' : '';
      window.location.hash = `/play${modeParam}`;
    } else {
      window.location.hash = '/';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return {
    route: routeState.route,
    params: routeState.params,
    navigateTo,
  };
}
