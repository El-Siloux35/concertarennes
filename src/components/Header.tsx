import { Link } from "react-router-dom";
import { SlidersHorizontal, Heart } from "lucide-react";
const Header = () => {
  return <header className="py-4 px-px gap-[16px] flex items-center justify-end pl-0 pr-[32px]">
      <Link to="/auth" className="bg-primary text-primary-foreground font-medium text-sm px-4 h-14 flex items-center rounded-full hover:opacity-90 transition-opacity">
        [connexion]
      </Link>
      <button className="text-primary hover:opacity-70 transition-opacity" aria-label="Filtres">
        <SlidersHorizontal size={24} strokeWidth={2} />
      </button>
      <Link to="/favoris" className="text-primary hover:opacity-70 transition-opacity" aria-label="Mes favoris">
        <Heart size={24} strokeWidth={2} />
      </Link>
    </header>;
};
export default Header;