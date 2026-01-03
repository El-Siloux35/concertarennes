import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingAddButton = () => {
  return (
    <Link
      to="/auth"
      className="fixed bottom-6 right-6 bg-accent text-accent-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-50"
      aria-label="Ajouter un concert"
    >
      <Plus size={28} strokeWidth={2} />
    </Link>
  );
};

export default FloatingAddButton;
