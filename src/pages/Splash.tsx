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

    if (!isMobile) {
      // Retire le style splash et navigue
      document.documentElement.classList.remove('splash-active');
      navigate("/home", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      // Retire le style splash avant de naviguer
      document.documentElement.classList.remove('splash-active');
      navigate("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: SPLASH_COLOR }}
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
