import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useStatusBarColor } from "@/contexts/StatusBarContext";

const Splash = () => {
  const navigate = useNavigate();
  const { resolvedTheme } = useTheme();

  // Barre de statut violette pour le splash screen
  const primaryColor = resolvedTheme === "dark" ? "#8B6DC4" : "#4C1CBE";
  useStatusBarColor(primaryColor);

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
    <div className="fixed inset-0 flex items-center justify-center bg-primary">
      <img
        src="/pwa-512x512.png"
        alt="Concerts à Rennes"
        className="w-32 h-32"
      />
    </div>
  );
};

export default Splash;
