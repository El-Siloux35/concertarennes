import { X, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "forgot-password";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = (location.state as any)?.from as string | undefined;

  const [mode, setMode] = useState<AuthMode>("login");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Gérer la confirmation d'email et la connexion automatique
  useEffect(() => {
    // Vérifier si on arrive via un lien de confirmation d'email
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const isEmailConfirmation = hashParams.get('type') === 'signup' || hashParams.get('type') === 'email';

    // Écouter les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Si c'est une confirmation d'email
        if (isEmailConfirmation) {
          toast({
            title: "✅ Email confirmé !",
            description: "Redirection en cours...",
            duration: 2000,
          });

          // Attendre un peu puis rediriger
          setTimeout(() => {
            navigate("/home");

            // Essayer de fermer l'onglet si c'est un nouvel onglet
            // (fonctionne seulement si l'onglet a été ouvert par window.open)
            setTimeout(() => {
              window.close();
            }, 500);
          }, 1500);
        } else {
          // Connexion normale (login)
          toast({
            title: "Connexion réussie",
            description: "Bienvenue !",
            duration: 2500,
          });
          navigate(from ?? "/home");
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, from, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "forgot-password") {
      if (!email) {
        toast({
          title: "Erreur",
          description: "Veuillez entrer votre email",
          variant: "destructive",
        });
        return;
      }

      setIsLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/home`,
        });

        if (error) throw error;

        toast({
          title: "Email envoyé",
          description: "Vérifiez votre boîte mail pour réinitialiser votre mot de passe.",
        });
        setMode("login");
        setEmail("");
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.message || "Impossible d'envoyer l'email de réinitialisation.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!email || !password || (mode === "signup" && !pseudo)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Connexion réussie",
          description: "Bienvenue !",
          duration: 2500,
        });

        navigate(from ?? "/home");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/email-confirmed`,
            data: { pseudo },
          },
        });

        if (error) throw error;

        // Si l'email doit être confirmé, afficher le message approprié
        if (data?.user && !data.session) {
          toast({
            title: "Compte créé !",
            description: "Vérifiez votre email pour confirmer votre compte. Vous serez automatiquement connecté après confirmation.",
            duration: 8000,
          });
        } else {
          // Si la confirmation email est désactivée, connexion directe
          toast({
            title: "Compte créé",
            description: "Vous êtes maintenant connecté !",
          });
          navigate(from ?? "/home");
        }

        setEmail("");
        setPassword("");
        setPseudo("");
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

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Connexion";
      case "signup":
        return "Créer un compte";
      case "forgot-password":
        return "Mot de passe oublié";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login":
        return "Connexion à mon espace orga";
      case "forgot-password":
        return "Entrez votre email pour recevoir un lien de réinitialisation";
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Close button */}
      <header className="px-6 pt-4 flex justify-start shrink-0">
        <button
          onClick={() => (from ? navigate(from) : navigate(-1))}
          className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
          aria-label="Fermer"
        >
          <X size={24} strokeWidth={2} />
        </button>
      </header>

      {/* Content - centered */}
      <main className="flex-1 flex flex-col justify-center px-8 pb-10 max-w-md mx-auto w-full overflow-y-auto">
        {/* Icon + Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-3">
            <Lock size={18} className="text-accent-foreground" />
          </div>
          <h1 className="text-[20px] font-bold text-primary">{getTitle()}</h1>
          {getSubtitle() && (
            <p className="text-primary/70 text-[14px] text-center mt-2 max-w-[300px] leading-relaxed">
              {getSubtitle()}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Pseudo input - only for signup */}
          {mode === "signup" && (
            <Input
              type="text"
              placeholder="Pseudo ou Prénom"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="h-14 text-sm rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary mb-3"
            />
          )}

          {/* Email input */}
          <div className="relative">
            <div className="absolute left-3 top-[50%] -translate-y-1/2 text-primary pointer-events-none">
              <Mail size={18} strokeWidth={1.5} />
            </div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 text-sm pl-10 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
            />
          </div>

          {/* Password input - hide for forgot password */}
          {mode !== "forgot-password" && (
            <div className="mt-3">
              <div className="relative">
                <div className="absolute left-3 top-[50%] -translate-y-1/2 text-primary pointer-events-none">
                  <Lock size={18} strokeWidth={1.5} />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 text-sm pl-10 pr-10 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[50%] -translate-y-1/2 text-primary"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-primary/60 text-[11px] mt-1.5 ml-1">
                  Minimum 6 caractères
                </p>
              )}
            </div>
          )}

          {/* Forgot password link - only for login */}
          {mode === "login" && (
            <button
              type="button"
              onClick={() => setMode("forgot-password")}
              className="text-primary/70 text-[13px] mt-2 text-right hover:text-primary transition-colors"
            >
              Mot de passe oublié ?
            </button>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3 mt-6">
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-[14px] hover:bg-accent"
            >
              {isLoading
                ? mode === "forgot-password"
                  ? "Envoi..."
                  : mode === "login"
                    ? "Connexion..."
                    : "Création..."
                : mode === "forgot-password"
                  ? "Envoyer le lien"
                  : mode === "login"
                    ? "Connexion"
                    : "Créer mon compte"}
            </Button>

            {mode === "login" && (
              <>
                <p className="text-primary/70 text-[13px] text-center">
                  Pas encore de compte ?
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setMode("signup");
                    setPassword("");
                  }}
                  className="w-full h-14 rounded-full bg-secondary text-secondary-foreground font-medium text-[14px] hover:bg-secondary"
                >
                  Créer un compte
                </Button>
              </>
            )}

            {mode === "signup" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setPassword("");
                }}
                className="flex items-center justify-center text-primary font-medium text-sm mt-6"
              >
                J'ai déjà un compte
              </button>
            )}

            {mode === "forgot-password" && (
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setEmail("");
                }}
                className="flex items-center justify-center text-primary font-medium text-sm mt-2"
              >
                Retour à la connexion
              </button>
            )}
          </div>
        </form>
      </main>
    </div>
  );
};

export default Auth;
