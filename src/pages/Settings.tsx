import { ChevronLeft, Sun, Moon, Monitor, Bell, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import Footer from "@/components/Footer";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const { setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeChoice, setThemeChoice] = useState<"light" | "dark" | "system">("light");

  const {
    isSupported,
    isSubscribed,
    isLoading: isPushLoading,
    error: pushError,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  useEffect(() => {
    setMounted(true);
    // Check saved theme choice
    const savedChoice = localStorage.getItem("theme-choice") || "light";
    setThemeChoice(savedChoice as "light" | "dark" | "system");
  }, []);

  useEffect(() => {
    if (pushError) {
      toast({
        title: "Erreur",
        description: pushError,
        variant: "destructive",
      });
    }
  }, [pushError, toast]);

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
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        toast({
          title: "Notifications désactivées",
          description: "Vous ne recevrez plus de notifications.",
        });
      }
    } else {
      const success = await subscribe();
      if (success) {
        toast({
          title: "Notifications activées",
          description: "Vous recevrez des notifications pour les nouveaux événements.",
        });
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[1000px] mx-auto flex-1 flex flex-col w-full">
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
        <div className="px-6 py-4">
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

            {!isSupported ? (
              <p className="text-primary/60 text-sm">
                Les notifications push ne sont pas supportées sur ce navigateur.
              </p>
            ) : (
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    <Bell size={20} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-primary font-medium block truncate">Nouveaux événements</span>
                    <p className="text-primary/60 text-xs">
                      Notification lors d'un nouvel événement
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleNotificationToggle}
                  disabled={isPushLoading}
                  className={`relative w-14 h-8 rounded-full transition-colors duration-200 border-2 border-primary flex-shrink-0 ${
                    isSubscribed ? "bg-primary" : "bg-transparent"
                  } ${isPushLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  aria-label={isSubscribed ? "Désactiver les notifications" : "Activer les notifications"}
                >
                  {isPushLoading ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Loader2 size={16} className="animate-spin text-primary" />
                    </span>
                  ) : (
                    <span
                      className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full transition-all duration-200 ${
                        isSubscribed ? "left-[calc(100%-1.5rem)] bg-accent" : "left-1 bg-primary/50"
                      }`}
                    />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Settings;
