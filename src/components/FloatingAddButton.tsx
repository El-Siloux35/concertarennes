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

  // Hide button if not logged in
  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="fixed bottom-[18px] md:bottom-8 right-6 md:right-8 z-50 pointer-events-none">
      <Link
        to="/creer-evenement"
        className="bg-accent text-accent-foreground rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center pointer-events-auto shadow-lg"
        aria-label="Ajouter un concert"
      >
        <Plus size={28} strokeWidth={2.5} className="md:w-8 md:h-8" />
      </Link>
    </div>
  );
};

export default FloatingAddButton;
