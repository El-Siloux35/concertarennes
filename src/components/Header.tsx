import { Link } from "react-router-dom";
import { SlidersHorizontal, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const displayName = user?.user_metadata?.pseudo || user?.email?.split('@')[0] || 'Compte';

  return (
    <header className="py-4 px-px gap-[16px] flex items-center justify-end pl-0 pr-[32px]">
      <Link 
        to={user ? "/compte" : "/auth"}
        className="bg-primary text-primary-foreground font-medium text-sm px-4 h-14 flex items-center rounded-full"
      >
        {user ? `@${displayName}` : "[connexion]"}
      </Link>
      <button className="text-primary" aria-label="Filtres">
        <SlidersHorizontal size={24} strokeWidth={2} />
      </button>
      <Link to="/favoris" className="text-primary" aria-label="Mes favoris">
        <Heart size={24} strokeWidth={2} />
      </Link>
    </header>
  );
};

export default Header;
