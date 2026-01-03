import { Link } from "react-router-dom";
import { User, Heart } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-center gap-4 py-4 px-4">
      <Link
        to="/auth"
        className="bg-primary text-primary-foreground font-mono font-medium text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
      >
        [connexion]
      </Link>
      <button
        className="text-primary hover:opacity-70 transition-opacity"
        aria-label="Mon compte"
      >
        <User size={24} strokeWidth={1.5} />
      </button>
      <Link
        to="/favoris"
        className="text-primary hover:opacity-70 transition-opacity"
        aria-label="Mes favoris"
      >
        <Heart size={24} strokeWidth={1.5} />
      </Link>
    </header>
  );
};

export default Header;
