import { ChevronLeft, Sun, Moon, Monitor } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";

// Fonction pour mettre à jour la couleur de la barre de statut et du fond
function updateStatusBarColor(isDark: boolean) {
  const color = isDark ? "#0d1117" : "#ffffff";
  // Met à jour la meta tag theme-color
  const metaTag = document.querySelector('meta[name="theme-color"]');
  if (metaTag) {
    metaTag.setAttribute("content", color);
  }
  // Met à jour aussi le background du document pour iOS PWA
  document.documentElement.style.backgroundColor = color;
  document.body.style.backgroundColor = color;
}

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [themeChoice, setThemeChoice] = useState<"light" | "dark" | "system">("light");

  useEffect(() => {
    setMounted(true);
    // Check saved theme choice
    const savedChoice = localStorage.getItem("theme-choice") || "light";
    setThemeChoice(savedChoice as "light" | "dark" | "system");
    // Check if notifications are enabled
    const savedNotifications = localStorage.getItem("notifications-enabled");
    setNotificationsEnabled(savedNotifications === "true");
  }, []);

  const handleThemeChange = (choice: "light" | "dark" | "system") => {
    setThemeChoice(choice);
    localStorage.setItem("theme-choice", choice);

    let isDark: boolean;
    if (choice === "system") {
      // Apply based on system preference, but store actual theme for next-themes
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      isDark = prefersDark;
      const actualTheme = prefersDark ? "dark" : "light";
      setTheme(actualTheme);
      // Store "system" separately so our init script knows to check system preference
      localStorage.setItem("theme", "system");
    } else {
      isDark = choice === "dark";
      setTheme(choice);
      localStorage.setItem("theme", choice);
    }

    // Met à jour immédiatement la couleur de la barre de statut
    updateStatusBarColor(isDark);
  };

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      // Request notification permission
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
          localStorage.setItem("notifications-enabled", "true");
        }
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem("notifications-enabled", "false");
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background page-slide-in">
      <div className="max-w-[1000px] mx-auto">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background">
          <div className="max-w-[1000px] mx-auto p-4 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Retour"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20"></div>

        {/* Content */}
        <div className="px-4 py-4">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8">
            Réglages
          </h1>

          {/* Theme Selection */}
          <div className="bg-card rounded-2xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Apparence
            </h2>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleThemeChange("light")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                  themeChoice === "light"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Sun size={20} className="text-primary" />
                </div>
                <span className="text-primary font-medium">Clair</span>
              </button>

              <button
                onClick={() => handleThemeChange("dark")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                  themeChoice === "dark"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Moon size={20} className="text-primary" />
                </div>
                <span className="text-primary font-medium">Sombre</span>
              </button>

              <button
                onClick={() => handleThemeChange("system")}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-colors ${
                  themeChoice === "system"
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                  <Monitor size={20} className="text-primary" />
                </div>
                <span className="text-primary font-medium">Système</span>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-card-foreground mb-4">
              Notifications
            </h2>
            <div className="flex items-center justify-between">
              <span className="text-primary">Activer les notifications</span>
              <button
                onClick={handleNotificationToggle}
                className={`relative w-14 h-8 rounded-full transition-colors border-2 border-primary ${
                  notificationsEnabled ? "bg-primary" : "bg-transparent"
                }`}
                aria-label={notificationsEnabled ? "Désactiver les notifications" : "Activer les notifications"}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-accent transition-transform ${
                    notificationsEnabled ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="px-4">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Settings;
