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

  // Couleur par défaut selon le thème choisi par l'utilisateur
  const getDefaultColor = useCallback(() => {
    if (typeof document !== "undefined" && typeof localStorage !== "undefined") {
      // Utiliser le choix explicite de l'utilisateur
      const choice = localStorage.getItem("theme-choice") || localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

      // Seulement dark si explicitement choisi ou si système ET préférence dark
      const isDark = choice === "dark" || (choice === "system" && prefersDark);
      return isDark ? "#0d1117" : "#ffffff";
    }
    // Fallback sur resolvedTheme si disponible
    if (resolvedTheme) {
      return resolvedTheme === "dark" ? "#0d1117" : "#ffffff";
    }
    return "#ffffff"; // Défaut: clair
  }, [resolvedTheme]);

  // Met à jour la meta tag quand la couleur change
  useEffect(() => {
    if (customColor) {
      updateMetaTags(customColor);
    } else {
      // Toujours mettre à jour avec la couleur par défaut
      updateMetaTags(getDefaultColor());
    }
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
