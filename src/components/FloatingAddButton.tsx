import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const FloatingAddButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session?.user);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Link
      to={isLoggedIn ? "/creer-evenement" : "/auth"}
      className="fixed bottom-6 right-6 bg-accent text-accent-foreground rounded-full w-20 h-20 flex items-center justify-center z-50"
      aria-label="Ajouter un concert"
    >
      <Plus size={32} strokeWidth={2.5} />
    </Link>
  );
};

export default FloatingAddButton;
