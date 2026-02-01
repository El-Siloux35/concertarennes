import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useTheme } from "next-themes";

interface StatusBarContextType {
  setStatusBarColor: (color: string | null) => void;
}

const StatusBarContext = createContext<StatusBarContextType | null>(null);

const THEME_COLORS = { light: "#ffffff", dark: "#0d1117" } as const;

function applyThemeColor(color: string) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
}

export function StatusBarProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme, theme } = useTheme();
  const [customColor, setCustomColor] = useState<string | null>(null);

  // Une seule source de vérité: customColor (splash) ou resolvedTheme (next-themes)
  useEffect(() => {
    if (customColor) {
      applyThemeColor(customColor);
    } else {
      const color = resolvedTheme === "dark" ? THEME_COLORS.dark : THEME_COLORS.light;
      applyThemeColor(color);
    }
  }, [customColor, resolvedTheme]);

  // Listener sur changements de préférence système en temps réel (mode "system" uniquement)
  useEffect(() => {
    if (theme !== "system" || customColor) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      const color = e.matches ? THEME_COLORS.dark : THEME_COLORS.light;
      applyThemeColor(color);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, customColor]);

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
