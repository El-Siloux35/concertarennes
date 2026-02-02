import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useTheme } from "next-themes";

interface StatusBarContextType {
  setStatusBarColor: (color: string | null) => void;
}

const StatusBarContext = createContext<StatusBarContextType | null>(null);

const THEME_COLORS = { light: "#ffffff", dark: "#0d1117" } as const;

function applyThemeColor(color: string, isLight: boolean) {
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", color);
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
  // PWA: color-scheme force le navigateur à respecter notre thème pour la status bar
  // (évite que le système dark override quand l'app est en mode clair)
  document.documentElement.style.colorScheme = isLight ? "light" : "dark";
  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
  if (colorSchemeMeta) {
    colorSchemeMeta.setAttribute("content", isLight ? "light dark" : "dark light");
  } else {
    const m = document.createElement("meta");
    m.name = "color-scheme";
    m.content = isLight ? "light dark" : "dark light";
    document.head.appendChild(m);
  }
}

function getThemeFromDOM(): { color: string; isLight: boolean } {
  const isDark = document.documentElement.classList.contains("dark");
  return {
    color: isDark ? THEME_COLORS.dark : THEME_COLORS.light,
    isLight: !isDark,
  };
}

export function StatusBarProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme, theme } = useTheme();
  const [customColor, setCustomColor] = useState<string | null>(null);

  const statusBarTheme =
    theme === "light" || theme === "dark" ? theme : (resolvedTheme ?? "light");

  useEffect(() => {
    if (customColor) {
      const isLight = customColor === THEME_COLORS.light;
      applyThemeColor(customColor, isLight);
    } else {
      const isDark = statusBarTheme === "dark";
      const color = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
      applyThemeColor(color, !isDark);
    }
  }, [customColor, statusBarTheme]);

  // PWA: sync theme-color + color-scheme avec le DOM (next-themes modifie classList).
  // color-scheme évite que le système (dark) override la status bar quand l'app est en light.
  useEffect(() => {
    if (customColor) return;

    const applyFromDOM = () => {
      const { color, isLight } = getThemeFromDOM();
      applyThemeColor(color, isLight);
    };
    applyFromDOM();

    const observer = new MutationObserver(applyFromDOM);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, [customColor]);

  useEffect(() => {
    if (theme !== "system" || customColor) return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      const { color, isLight } = getThemeFromDOM();
      applyThemeColor(color, isLight);
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
