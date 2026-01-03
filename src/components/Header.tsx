import { Link } from "react-router-dom";
import { User, Heart } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-center gap-3 py-4 px-4">
      <Link
        to="/auth"
        className="bg-primary text-primary-foreground font-medium text-sm px-4 py-2 rounded-full hover:opacity-90 transition-opacity"
      >
        [connexion]
      </Link>
      <button
        className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-secondary transition-colors"
        aria-label="Mon compte"
      >
        <User size={20} strokeWidth={1.5} />
      </button>
      <Link
        to="/favoris"
        className="w-10 h-10 rounded-full border-2 border-primary flex items-center justify-center text-primary hover:bg-secondary transition-colors"
        aria-label="Mes favoris"
      >
        <Heart size={20} strokeWidth={1.5} />
      </Link>
    </header>
  );
};

export default Header;
