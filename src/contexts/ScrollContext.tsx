import { createContext, useContext, useRef, useEffect, useLayoutEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface ScrollContextType {
  saveScrollPosition: (key: string) => void;
  restoreScrollPosition: (key: string) => void;
  getScrollPosition: (key: string) => number | undefined;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

const PAGES_WITH_SCROLL_MEMORY = ["/home"];
/** Overlay routes: don't scroll to top, preserve current position */
const OVERLAY_ROUTES = ["/compte", "/creer-evenement", "/auth"];
const SAVE_THROTTLE_MS = 100;

export function ScrollProvider({ children }: { children: ReactNode }) {
  const scrollPositions = useRef<Record<string, number>>({});
  const location = useLocation();
  const lastSaveTime = useRef(0);
  const isRestoringRef = useRef(false);

  // Disable browser scroll restoration - we handle it manually
  useEffect(() => {
    const prev = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = prev;
    };
  }, []);

  // Save scroll position on scroll (for pages with memory)
  useEffect(() => {
    const path = location.pathname;
    if (!PAGES_WITH_SCROLL_MEMORY.includes(path)) return;

    const handleScroll = () => {
      if (isRestoringRef.current) return;
      const now = Date.now();
      if (now - lastSaveTime.current < SAVE_THROTTLE_MS) return;
      lastSaveTime.current = now;
      scrollPositions.current[path] = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Restore or reset scroll on navigation - useLayoutEffect to avoid flicker (runs before paint)
  useLayoutEffect(() => {
    const path = location.pathname;

    if (PAGES_WITH_SCROLL_MEMORY.includes(path)) {
      const savedPosition = scrollPositions.current[path];
      if (savedPosition !== undefined && savedPosition > 0) {
        isRestoringRef.current = true;
        window.scrollTo(0, savedPosition);
        // Single fallback in case layout settles late (e.g. Index switching from fixed to flow)
        const id = requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
          isRestoringRef.current = false;
        });
        return () => {
          cancelAnimationFrame(id);
          isRestoringRef.current = false;
        };
      }
    }

    // Overlay routes: preserve scroll (handled by AppShellLayout for Index container)
    if (OVERLAY_ROUTES.includes(path)) return;

    // Reset scroll for other pages
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const saveScrollPosition = (key: string) => {
    scrollPositions.current[key] = window.scrollY;
  };

  const getScrollPosition = (key: string) => scrollPositions.current[key];

  const restoreScrollPosition = (key: string) => {
    const position = scrollPositions.current[key];
    if (position !== undefined) {
      window.scrollTo(0, position);
    }
  };

  return (
    <ScrollContext.Provider value={{ saveScrollPosition, restoreScrollPosition, getScrollPosition }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error("useScroll must be used within a ScrollProvider");
  }
  return context;
}
