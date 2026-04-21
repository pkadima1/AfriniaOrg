import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/analytics';

/**
 * GAPageTracker — fires a GA4 page_view on every React Router navigation.
 *
 * WHY this component exists:
 * React Router swaps page components without reloading the browser. Firebase
 * Analytics fires one page_view automatically when the app first loads, but
 * knows nothing about React Router. Without this component, every navigation
 * after the initial load (home → blog → article) is invisible in GA4.
 *
 * WHY it skips the first render:
 * Firebase already tracks the initial page load automatically. Firing again
 * on mount would double-count the first page view in Analytics.
 *
 * WHERE it must be mounted:
 * Inside <BrowserRouter> (needs router context for useLocation) but outside
 * <Routes> (so it is never unmounted during navigation). See App.tsx.
 *
 * This component renders nothing — it exists only for its side effect.
 */
const GAPageTracker = () => {
  const location = useLocation();
  const hasMounted = useRef(false);

  useEffect(() => {
    // Skip the first render — Firebase handles the initial page_view.
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    // document.title is set by usePageMeta in each page component.
    // It reflects the previous page's title on the first tick after navigation,
    // then updates once the new page's usePageMeta effect runs. The page_path
    // is always correct immediately; title accuracy improves on subsequent hops.
    trackPageView(location.pathname, document.title);
  }, [location.pathname]);

  return null;
};

export default GAPageTracker;
