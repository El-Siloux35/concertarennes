import { X, AtSign, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (!isLogin && !pseudo)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      setIsLoading(false);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
      });
      navigate("/home");
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            pseudo: pseudo,
          }
        }
      });

      setIsLoading(false);

      if (error) {
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Compte créé",
        description: "Vous êtes maintenant connecté !",
      });
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-4">
      {/* Close button */}
      <div className="flex justify-end mb-12">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
          aria-label="Fermer"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold text-primary mb-2">
          {isLogin ? "Se connecter" : "Créer un compte"}
        </h1>
        <p className="text-primary text-sm">
          {isLogin 
            ? "Connectez-vous pour gérer vos évènements."
            : "pour pouvoir ajouter ou modifier un évènement."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pseudo input - only for signup */}
        {!isLogin && (
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
              <AtSign size={20} strokeWidth={1.5} />
            </div>
            <Input
              type="text"
              placeholder="Pseudo ou Prénom"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="h-14 pl-12 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
            />
          </div>
        )}

        {/* Email input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
            <Mail size={20} strokeWidth={1.5} />
          </div>
          <Input
            type="email"
            placeholder="Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-14 pl-12 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
          />
        </div>

        {/* Password input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
            <Lock size={20} strokeWidth={1.5} />
          </div>
          <Input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-14 pl-12 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-base mt-8 hover:bg-accent"
        >
          {isLoading 
            ? (isLogin ? "Connexion..." : "Création...") 
            : (isLogin ? "Se connecter" : "Créer un compte")}
        </Button>
      </form>

      {/* Toggle link */}
      <div className="text-center mt-12">
        <button
          type="button"
          onClick={() => setIsLogin(!isLogin)}
          className="text-primary underline text-sm font-medium"
        >
          {isLogin ? "créer un compte" : "j'ai déjà un compte"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
