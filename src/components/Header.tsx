import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Lock, HelpCircle, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AuthDrawer from "./AuthDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";

// Truncate name to max 12 chars with ellipsis
const truncateName = (name: string, maxLength: number = 12): string => {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength) + "…";
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user, profile } = useUser();

  const [favoritesCount, setFavoritesCount] = useState(0);
  const [authOpen, setAuthOpen] = useState(false);

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
      <header className="gap-0 md:gap-1 pt-2 pr-0 flex items-center justify-end py-0">
        <Link
          to="/a-propos"
          className="text-primary w-12 h-12 flex items-center justify-center"
          aria-label="À propos"
        >
          <HelpCircle size={24} strokeWidth={2} />
        </Link>
        <Link
          to="/reglages"
          className="text-primary w-12 h-12 flex items-center justify-center"
          aria-label="Réglages"
        >
          <SlidersHorizontal size={24} strokeWidth={2} />
        </Link>
        <Link
          to="/favoris"
          className="text-primary relative w-12 h-12 flex items-center justify-center"
          aria-label="Mes favoris"
        >
          <Heart size={24} strokeWidth={2} fill={favoritesCount > 0 ? "hsl(var(--primary))" : "none"} />
          {favoritesCount > 0 && (
            <span className="absolute top-1 right-0 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {favoritesCount > 9 ? "9+" : favoritesCount}
            </span>
          )}
        </Link>
        {user ? (
          <Link
            to="/compte"
            className="bg-accent text-accent-foreground font-medium text-sm h-12 flex items-center rounded-full py-1.5 pl-1.5 pr-4 gap-2 ml-2 md:ml-3"
          >
            <Avatar className="w-9 h-9 border-2 border-accent-foreground/20">
              <AvatarImage
                src={profile?.avatar_url || undefined}
                alt={displayName}
                className="object-cover"
              />
              <AvatarFallback className="bg-accent-foreground/10 text-accent-foreground text-sm">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span>@{truncateName(displayName)}</span>
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
            className="bg-accent text-accent-foreground font-medium text-sm pl-3 pr-4 h-12 flex items-center gap-2 rounded-full ml-2 md:ml-3"
          >
            <Lock size={18} strokeWidth={2} />
            Connexion
          </button>
        )}
      </header>
      {!isMobile && <AuthDrawer open={authOpen} onOpenChange={setAuthOpen} />}
    </>
  );
};

export default Header;