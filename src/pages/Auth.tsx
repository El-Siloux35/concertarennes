import { X, AtSign, Mail, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // UI states
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
    
    try {
      if (isLogin) {
        // Login with email/password
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
        });
        
        navigate("/home");
      } else {
        // Sign up with email/password
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { pseudo },
          }
        });

        if (error) throw error;

        toast({
          title: "Compte créé",
          description: "Vous pouvez maintenant vous connecter.",
        });
        
        // Switch to login mode after successful signup
        setIsLogin(true);
        setPassword("");
      }
    } catch (error: any) {
      let message = error.message;
      
      if (error.message?.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect.";
      } else if (error.message?.includes("User already registered")) {
        message = "Un compte existe déjà avec cet email. Essayez de vous connecter.";
      } else if (error.message?.includes("Password should be at least")) {
        message = "Le mot de passe doit contenir au moins 6 caractères.";
      }
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 flex flex-col">
      {/* Close button - fixed at top */}
      <div className="max-w-[700px] w-full mx-auto pt-4">
        <div className="flex justify-end">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
            aria-label="Fermer"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-[700px] w-full">
          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-primary mb-2">
              {isLogin ? "Se connecter" : "Créer un compte"}
            </h1>
            <p className="text-primary text-sm">
              {isLogin 
                ? "Entrez vos identifiants pour continuer."
                : "Remplissez le formulaire pour créer votre compte."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Pseudo input - only for signup */}
            {!isLogin && (
              <div className="relative">
                <div className="absolute left-4 top-[50%] -translate-y-1/2 text-primary pointer-events-none">
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
              <div className="absolute left-4 top-[50%] -translate-y-1/2 text-primary pointer-events-none">
                <Mail size={20} strokeWidth={1.5} />
              </div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-14 pl-12 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
              />
            </div>

            {/* Password input */}
            <div>
              <div className="relative">
                <div className="absolute left-4 top-[50%] -translate-y-1/2 text-primary pointer-events-none">
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
              {!isLogin && (
                <p className="text-primary/60 text-xs mt-2 ml-1">
                  Minimum 6 caractères
                </p>
              )}
            </div>

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-base mt-8 hover:bg-accent"
            >
              {isLoading 
                ? (isLogin ? "Connexion..." : "Création...") 
                : (isLogin ? "Se connecter" : "Créer mon compte")}
            </Button>
          </form>

          {/* Toggle link */}
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setPassword("");
              }}
              className="text-primary underline text-sm font-medium"
            >
              {isLogin ? "créer un compte" : "j'ai déjà un compte"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
