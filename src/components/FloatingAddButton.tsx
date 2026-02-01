import { Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useScroll } from "@/contexts/ScrollContext";

const FloatingAddButton = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();
  const { saveScrollPosition } = useScroll();

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
    <div className="fixed bottom-[18px] md:bottom-8 right-4 md:right-8 z-50 pointer-events-none">
      <Link
        to="/creer-evenement"
        onClick={() => location.pathname === "/home" && saveScrollPosition("/home")}
        className="bg-accent text-accent-foreground rounded-full w-16 h-16 md:w-20 md:h-20 flex items-center justify-center pointer-events-auto"
        aria-label="Ajouter un concert"
      >
        <Plus size={28} strokeWidth={2.5} className="md:w-8 md:h-8" />
      </Link>
    </div>
  );
};

export default FloatingAddButton;
