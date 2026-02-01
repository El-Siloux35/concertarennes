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
      sessionStorage.setItem('app-loaded', 'true');
      // StatusBarProvider + useStatusBarColor(null) mettront à jour theme-color au démontage
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
