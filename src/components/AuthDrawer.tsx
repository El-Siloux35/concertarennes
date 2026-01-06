import { useState, useEffect } from "react";
import { X, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

interface AuthDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type AuthMode = "login" | "signup" | "forgot-password";

const AuthDrawer = ({ open, onOpenChange }: AuthDrawerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [mode, setMode] = useState<AuthMode>("login");
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [visualViewportHeight, setVisualViewportHeight] = useState<number | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      setMode("login");
      setPseudo("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
      setVisualViewportHeight(null);
      setKeyboardOffset(0);
    }
  }, [open]);

  // Mobile keyboard avoidance: shrink the drawer to the visible viewport height
  useEffect(() => {
    if (!isMobile || !open) return;

    const vv = window.visualViewport;
    if (!vv) return;

    const update = () => {
      setVisualViewportHeight(vv.height);
      const bottom = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(bottom);
    };
    update();

    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);

    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [isMobile, open]);

  const handleFieldFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // iOS: defer until after keyboard animation
    window.setTimeout(() => {
      e.currentTarget.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 50);
  };
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

        onOpenChange(false);
        navigate("/home");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { pseudo },
          },
        });

        if (error) throw error;

        toast({
          title: "Compte créé",
          description: "Vous pouvez maintenant vous connecter.",
        });

        setMode("login");
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

  const content = (
    <div className="px-8 pb-[38px] pt-14">
      {/* Icon + Title */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-3">
          <Lock size={18} className="text-accent-foreground" />
        </div>
        <h2 className="text-[20px] font-bold text-primary">
          {getTitle()}
        </h2>
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
            onFocus={handleFieldFocus}
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
            onFocus={handleFieldFocus}
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
                onFocus={handleFieldFocus}
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
          {/* Submit button */}
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

          {/* Toggle buttons */}
          {mode === "login" && (
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
    </div>
  );

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent
          className="overflow-y-auto transition-[bottom] duration-200"
          style={
            visualViewportHeight || keyboardOffset
              ? {
                  maxHeight: visualViewportHeight ? `${visualViewportHeight}px` : undefined,
                  bottom: keyboardOffset ? `${keyboardOffset}px` : undefined,
                }
              : undefined
          }
        >
          <DrawerHeader className="flex justify-start pt-3 pb-1">
            <button
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Fermer"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </DrawerHeader>
          <div className="pb-8">
            {content}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Centered dialog
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDrawer;
