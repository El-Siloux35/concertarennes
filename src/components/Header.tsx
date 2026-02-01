import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Lock, HelpCircle, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import AuthDrawer from "./AuthDrawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/contexts/UserContext";

// Truncate name to max 10 chars with ellipsis
const truncateName = (name: string, maxLength: number = 10): string => {
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

  // Icon sizes based on device
  const iconSize = isMobile ? 20 : 24;
  const iconAreaClass = isMobile ? "w-10 h-10" : "w-12 h-12";
  const buttonHeightClass = isMobile ? "h-10" : "h-12";

  return (
    <>
      <header className="flex items-center justify-between">
        {/* Left side - Info, Settings, and Favorites */}
        <div className="flex items-center">
          <Link
            to="/a-propos"
            className={`text-primary ${iconAreaClass} flex items-center justify-center`}
            aria-label="À propos"
          >
            <HelpCircle size={iconSize} strokeWidth={2} />
          </Link>
          <Link
            to="/reglages"
            className={`text-primary ${iconAreaClass} flex items-center justify-center`}
            aria-label="Réglages"
          >
            <SlidersHorizontal size={iconSize} strokeWidth={2} />
          </Link>
          <Link
            to="/favoris"
            className={`text-primary relative ${iconAreaClass} flex items-center justify-center`}
            aria-label="Mes favoris"
          >
            <Heart size={iconSize} strokeWidth={2} fill={favoritesCount > 0 ? "hsl(var(--primary))" : "none"} />
            {favoritesCount > 0 && (
              <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {favoritesCount > 9 ? "9+" : favoritesCount}
              </span>
            )}
          </Link>
        </div>

        {/* Right side - Login/Account */}
        <div className="flex items-center">
          {user ? (
            <Link
              to="/compte"
              className={`bg-accent text-accent-foreground font-medium text-sm ${buttonHeightClass} flex items-center rounded-full py-1.5 pl-1.5 pr-4 gap-2`}
            >
              <Avatar className={isMobile ? "w-7 h-7 border-2 border-accent-foreground/20" : "w-9 h-9 border-2 border-accent-foreground/20"}>
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
              className={`bg-accent text-accent-foreground font-medium text-sm pl-3 pr-4 ${buttonHeightClass} flex items-center gap-2 rounded-full`}
            >
              <Lock size={isMobile ? 16 : 18} strokeWidth={2} />
              Connexion
            </button>
          )}
        </div>
      </header>
      {!isMobile && <AuthDrawer open={authOpen} onOpenChange={setAuthOpen} />}
    </>
  );
};

export default Header;