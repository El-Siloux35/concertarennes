import { createContext, useContext, useRef, useEffect, ReactNode } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

interface ScrollContextType {
  saveScrollPosition: (key: string) => void;
  restoreScrollPosition: (key: string) => void;
}

const ScrollContext = createContext<ScrollContextType | null>(null);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const scrollPositions = useRef<Record<string, number>>({});
  const location = useLocation();
  const navigationType = useNavigationType();

  // Reset scroll on navigation, sauf si on revient en arrière (POP)
  useEffect(() => {
    // Si c'est un retour en arrière (bouton back) et qu'on va vers /home ou /favoris
    // depuis une page concert, on restaure la position
    const isBackNavigation = navigationType === "POP";
    const isListPage = location.pathname === "/home" || location.pathname === "/favoris";

    if (isBackNavigation && isListPage) {
      const savedPosition = scrollPositions.current[location.pathname];
      if (savedPosition !== undefined) {
        // Petit délai pour laisser le contenu se charger
        setTimeout(() => {
          window.scrollTo(0, savedPosition);
        }, 100);
        return;
      }
    }

    // Sinon, reset le scroll en haut
    window.scrollTo(0, 0);
  }, [location.pathname, navigationType]);

  const saveScrollPosition = (key: string) => {
    scrollPositions.current[key] = window.scrollY;
  };

  const restoreScrollPosition = (key: string) => {
    const position = scrollPositions.current[key];
    if (position !== undefined) {
      window.scrollTo(0, position);
    }
  };

  return (
    <ScrollContext.Provider value={{ saveScrollPosition, restoreScrollPosition }}>
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
