import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStatusBarColor } from "@/contexts/StatusBarContext";

const SPLASH_COLOR = "#4C1CBE";

const Splash = () => {
  const navigate = useNavigate();

  // Barre de statut violette pour le splash screen
  useStatusBarColor(SPLASH_COLOR);

  useEffect(() => {
    // Check if on mobile device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    const cleanupSplash = () => {
      document.documentElement.classList.remove('splash-active');

      // S'assure que la classe dark correspond au thème choisi par l'utilisateur
      const choice = localStorage.getItem('theme-choice') || localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const shouldBeDark = choice === 'dark' || (choice === 'system' && prefersDark);

      // Synchronise pour next-themes
      localStorage.setItem('theme', shouldBeDark ? 'dark' : 'light');

      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Couleur de la barre de statut selon le thème
      const themeColor = shouldBeDark ? '#0d1117' : '#ffffff';

      // Met à jour la meta tag theme-color
      const metaTag = document.querySelector('meta[name="theme-color"]');
      if (metaTag) {
        metaTag.setAttribute('content', themeColor);
      }

      // Retire les styles inline et force la couleur du thème
      document.documentElement.style.removeProperty('background-color');
      document.body.style.removeProperty('background-color');

      // Force le background avec !important pour overrider le splash
      document.documentElement.style.setProperty('background-color', themeColor, 'important');
      document.body.style.setProperty('background-color', themeColor, 'important');

      // Marque l'app comme chargée pour éviter le splash au retour
      sessionStorage.setItem('app-loaded', 'true');
    };

    if (!isMobile) {
      cleanupSplash();
      navigate("/home", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      cleanupSplash();
      navigate("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: SPLASH_COLOR, zIndex: 10000 }}
    >
      <img
        src="/splash-animation.gif"
        alt="L'agenda du 35"
        className="scale-[2]"
      />
    </div>
  );
};

export default Splash;
