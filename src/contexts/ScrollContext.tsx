import { createContext, useContext, useRef, useEffect, ReactNode } from "react";
import { useLocation } from "react-router-dom";

interface ScrollContextType {
  saveScrollPosition: (key: string) => void;
  restoreScrollPosition: (key: string) => void;
  getScrollPosition: (key: string) => number | undefined;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

const PAGES_WITH_SCROLL_MEMORY = ["/home", "/favoris", "/reglages", "/a-propos"];
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

  // Restore or reset scroll on navigation
  useEffect(() => {
    const path = location.pathname;

    if (PAGES_WITH_SCROLL_MEMORY.includes(path)) {
      const savedPosition = scrollPositions.current[path];
      if (savedPosition !== undefined && savedPosition > 0) {
        isRestoringRef.current = true;
        const ids: ReturnType<typeof setTimeout>[] = [];
        const restore = () => window.scrollTo(0, savedPosition);
        ids.push(setTimeout(restore, 50));
        ids.push(setTimeout(restore, 150));
        ids.push(setTimeout(() => {
          restore();
          isRestoringRef.current = false;
        }, 250));
        return () => {
          ids.forEach((id) => clearTimeout(id));
          isRestoringRef.current = false;
        };
      }
    }

    // Overlay routes: preserve scroll - restore home position to prevent layout reset
    if (OVERLAY_ROUTES.includes(path)) {
      const homePosition = scrollPositions.current["/home"];
      if (homePosition !== undefined && homePosition > 0) {
        const id = requestAnimationFrame(() => {
          window.scrollTo(0, homePosition);
        });
        return () => cancelAnimationFrame(id);
      }
      return;
    }

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
