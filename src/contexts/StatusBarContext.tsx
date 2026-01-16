import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useTheme } from "next-themes";

interface StatusBarContextType {
  setStatusBarColor: (color: string | null) => void;
}

const StatusBarContext = createContext<StatusBarContextType | null>(null);

// Couleur initiale violette (doit correspondre à index.html)
const INITIAL_COLOR = "#4C1CBE";

function updateMetaTags(color: string) {
  const metaTags = document.querySelectorAll('meta[name="theme-color"]');
  metaTags.forEach((tag) => {
    tag.setAttribute("content", color);
  });
}

export function StatusBarProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [customColor, setCustomColor] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Marque le composant comme monté après l'hydratation
  useEffect(() => {
    setMounted(true);
  }, []);

  // Couleur par défaut selon le thème (ou violette si pas encore hydraté)
  const getDefaultColor = useCallback(() => {
    // Avant l'hydratation, garder la couleur initiale violette
    if (!mounted || !resolvedTheme) {
      return INITIAL_COLOR;
    }
    // Après l'hydratation, utiliser la couleur du thème
    return resolvedTheme === "dark" ? "#0d1117" : "#ffffff";
  }, [mounted, resolvedTheme]);

  // Met à jour la meta tag quand la couleur change
  useEffect(() => {
    // Ne met à jour que si le composant est monté et le thème résolu
    // OU si une couleur custom est définie
    if (customColor) {
      updateMetaTags(customColor);
    } else if (mounted && resolvedTheme) {
      updateMetaTags(getDefaultColor());
    }
    // Si pas monté et pas de customColor, on garde la couleur du HTML (violette)
  }, [customColor, mounted, resolvedTheme, getDefaultColor]);

  const setStatusBarColor = useCallback((color: string | null) => {
    setCustomColor(color);
  }, []);

  return (
    <StatusBarContext.Provider value={{ setStatusBarColor }}>
      {children}
    </StatusBarContext.Provider>
  );
}

/**
 * Hook pour changer la couleur de la barre de statut
 * @param color - La couleur à appliquer (ex: "#4C1CBE"). Si null, utilise la couleur du thème.
 */
export function useStatusBarColor(color?: string | null) {
  const context = useContext(StatusBarContext);

  if (!context) {
    throw new Error("useStatusBarColor must be used within a StatusBarProvider");
  }

  useEffect(() => {
    if (color !== undefined) {
      context.setStatusBarColor(color);

      // Remet la couleur par défaut quand le composant est démonté
      return () => {
        context.setStatusBarColor(null);
      };
    }
  }, [color, context]);

  return context.setStatusBarColor;
}
