import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, User, Lock } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import ThemeToggle from "./ThemeToggle";
import AuthDrawer from "./AuthDrawer";
import { useIsMobile } from "@/hooks/use-mobile";

// Truncate name to max 12 chars with ellipsis
const truncateName = (name: string, maxLength: number = 12): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "…";
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<{ pseudo: string | null } | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("pseudo")
      .eq("id", userId)
      .maybeSingle();
    setProfile(data);
  };

  useEffect(() => {
    const updateFavoritesCount = () => {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      setFavoritesCount(favorites.length);
    };
    updateFavoritesCount();

    window.addEventListener('storage', updateFavoritesCount);
    window.addEventListener('favoritesUpdated', updateFavoritesCount);

    return () => {
      window.removeEventListener('storage', updateFavoritesCount);
      window.removeEventListener('favoritesUpdated', updateFavoritesCount);
    };
  }, []);

  const displayName = profile?.pseudo || user?.user_metadata?.pseudo || user?.email?.split('@')[0] || 'Compte';

  return (
    <>
      <header className="gap-4 pt-2 pr-[10px] flex items-center justify-end py-0">
        {user ? (
          <Link
            to="/compte"
            className="bg-accent text-accent-foreground font-medium text-sm px-4 h-14 flex items-center gap-2 rounded-full"
          >
            <User size={18} strokeWidth={2} />
            @{truncateName(displayName)}
          </Link>
        ) : (
          <button
            onClick={() => {
              if (isMobile) {
                navigate("/auth", { state: { from: location.pathname } });
                return;
              }
              setAuthOpen(true);
            }}
            className="bg-accent text-accent-foreground font-medium text-sm px-4 h-14 flex items-center gap-2 rounded-full"
          >
            <Lock size={18} strokeWidth={2} />
            Connexion orga
          </button>
        )}
        <ThemeToggle />
        <Link
          to="/favoris"
          className={`text-primary relative w-8 h-8 flex items-center justify-center ${user ? 'mr-1' : ''}`}
          aria-label="Mes favoris"
        >
          <Heart size={24} strokeWidth={2} fill={favoritesCount > 0 ? "hsl(var(--primary))" : "none"} />
          {favoritesCount > 0 && (
            <span className="absolute top-0 -right-2 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {favoritesCount > 9 ? "9+" : favoritesCount}
            </span>
          )}
        </Link>
      </header>
      {!isMobile && <AuthDrawer open={authOpen} onOpenChange={setAuthOpen} />}
    </>
  );
};

export default Header;