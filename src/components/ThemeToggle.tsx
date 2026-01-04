import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="text-primary w-8 h-8 flex items-center justify-center" aria-label="Changer le thème">
        <Sun size={24} strokeWidth={2} />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="text-primary w-8 h-8 flex items-center justify-center"
      aria-label={isDark ? "Mode clair" : "Mode sombre"}
    >
      {isDark ? <Sun size={24} strokeWidth={2} /> : <Moon size={24} strokeWidth={2} />}
    </button>
  );
};

export default ThemeToggle;
