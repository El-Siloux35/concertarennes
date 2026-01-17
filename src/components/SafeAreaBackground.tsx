import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Composant qui ajoute un fond coloré dans la zone de la safe-area (barre de statut iOS)
 * pour s'assurer que la couleur correspond au thème
 */
const SafeAreaBackground = () => {
  const { resolvedTheme } = useTheme();
  const [bgColor, setBgColor] = useState<string>("#4C1CBE"); // Violet initial pour le splash

  // Fonction pour calculer la couleur selon le thème
  const getThemeColor = () => {
    // Utilise la classe dark du DOM comme source de vérité
    const isDark = document.documentElement.classList.contains("dark");
    return isDark ? "#0d1117" : "#ffffff";
  };

  // Met à jour la couleur quand le thème change
  useEffect(() => {
    // Si splash actif, garder le violet
    if (document.documentElement.classList.contains("splash-active")) {
      setBgColor("#4C1CBE");
      return;
    }

    // Sinon, utiliser la couleur du thème
    setBgColor(getThemeColor());
  }, [resolvedTheme]);

  // Observer les changements de classe sur le document pour détecter la fin du splash
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Si splash n'est plus actif, mettre à jour la couleur
      if (!document.documentElement.classList.contains("splash-active")) {
        setBgColor(getThemeColor());
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

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
