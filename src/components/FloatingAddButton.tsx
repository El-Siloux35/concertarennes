import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

const FloatingAddButton = () => {
  return (
    <Link
      to="/auth"
      className="fixed bottom-6 right-6 bg-accent text-accent-foreground rounded-full w-20 h-20 flex items-center justify-center shadow-lg z-50"
      aria-label="Ajouter un concert"
    >
      <Plus size={32} strokeWidth={2.5} />
    </Link>
  );
};

export default FloatingAddButton;
