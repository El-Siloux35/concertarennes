import { useTheme } from "next-themes";

const COLORS = { light: "#ffffff", dark: "#0d1117", splash: "#4C1CBE" } as const;

/**
 * Zone safe-area (barre de statut iOS) - synchronisée avec StatusBarProvider
 */
const SafeAreaBackground = () => {
  const { resolvedTheme } = useTheme();
  const isSplash = typeof document !== "undefined" && document.documentElement.classList.contains("splash-active");
  const color = isSplash ? COLORS.splash : (resolvedTheme === "dark" ? COLORS.dark : COLORS.light);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "env(safe-area-inset-top)",
        backgroundColor: color,
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
};

export default SafeAreaBackground;
