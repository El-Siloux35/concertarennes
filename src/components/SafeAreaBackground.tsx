import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Composant qui ajoute un fond coloré dans la zone de la safe-area (barre de statut iOS)
 * pour s'assurer que la couleur correspond au thème
 */
const SafeAreaBackground = () => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const bgColor = resolvedTheme === "dark" ? "#0d1117" : "#ffffff";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "env(safe-area-inset-top)",
        backgroundColor: bgColor,
        zIndex: 9999,
      }}
      aria-hidden="true"
    />
  );
};

export default SafeAreaBackground;
