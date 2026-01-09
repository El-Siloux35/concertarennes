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
      // Skip splash screen on web
      navigate("/home", { replace: true });
      return;
    }

    const timer = setTimeout(() => {
      navigate("/home");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary" />
  );
};

export default Splash;
