import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import ThemeToggle from "./ThemeToggle";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const updateFavoritesCount = () => {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavoritesCount(favorites.length);
    };

    updateFavoritesCount();

    // Listen for storage changes (from other tabs or components)
    window.addEventListener('storage', updateFavoritesCount);
    
    // Custom event for same-tab updates
    window.addEventListener('favoritesUpdated', updateFavoritesCount);

    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      window.removeEventListener('favoritesUpdated', updateFavoritesCount);
    };
  }, []);

  const displayName = user?.user_metadata?.pseudo || user?.email?.split('@')[0] || 'Compte';

  return (
    <header className="py-4 px-px gap-[16px] flex items-center justify-end pl-0 pr-[32px]">
      <Link 
        to={user ? "/compte" : "/auth"}
        className="bg-primary text-primary-foreground font-medium text-sm px-4 h-14 flex items-center rounded-full"
      >
        {user ? `@${displayName}` : "[connexion]"}
      </Link>
      <ThemeToggle />
      <Link to="/favoris" className="text-primary relative" aria-label="Mes favoris">
        <Heart size={24} strokeWidth={2} />
        {favoritesCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {favoritesCount > 9 ? "9+" : favoritesCount}
          </span>
        )}
      </Link>
    </header>
  );
};

export default Header;
