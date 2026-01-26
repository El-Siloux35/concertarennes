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
    <div className="fixed bottom-[10px] md:bottom-8 md:right-8 left-0 right-0 md:left-auto z-50 pointer-events-none">
      <div className="max-w-[900px] mx-auto px-4 flex justify-end pointer-events-none md:max-w-none md:mx-0 md:px-0">
        <Link
          to="/creer-evenement"
          className="bg-accent text-accent-foreground rounded-full w-14 h-14 md:w-20 md:h-20 flex items-center justify-center pointer-events-auto"
          aria-label="Ajouter un concert"
        >
          <Plus size={24} strokeWidth={2.5} className="md:w-8 md:h-8" />
        </Link>
      </div>
    </div>
  );
};

export default FloatingAddButton;
