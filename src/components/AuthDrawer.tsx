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

const AuthDrawer = ({ open, onOpenChange }: AuthDrawerProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [isLogin, setIsLogin] = useState(true);
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when drawer closes
  useEffect(() => {
    if (!open) {
      setIsLogin(true);
      setPseudo("");
      setEmail("");
      setPassword("");
      setShowPassword(false);
    }
  }, [open]);

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

  const content = (
    <div className="px-5 pb-6">
      {/* Icon + Title */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-3">
          <Lock size={18} className="text-accent-foreground" />
        </div>
        <h2 className="text-lg font-bold text-primary">Espace orga</h2>
        <p className="text-primary/70 text-xs text-center mt-1.5 max-w-[280px] leading-relaxed">
          Te donne le droit d'ajouter et modifier tes évènements, une modération pourra être appliqué par les admins !
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <h3 className="text-primary font-semibold text-sm">
          {isLogin ? "Connexion orga" : "Créer un compte orga"}
        </h3>

        {/* Pseudo input - only for signup */}
        {!isLogin && (
          <Input
            type="text"
            placeholder="Pseudo ou Prénom"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            className="h-11 text-sm rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
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
            className="h-11 text-sm pl-10 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
          />
        </div>

        {/* Password input */}
        <div>
          <div className="relative">
            <div className="absolute left-3 top-[50%] -translate-y-1/2 text-primary pointer-events-none">
              <Lock size={18} strokeWidth={1.5} />
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 text-sm pl-10 pr-10 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[50%] -translate-y-1/2 text-primary"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {!isLogin && (
            <p className="text-primary/60 text-[11px] mt-1.5 ml-1">
              Minimum 6 caractères
            </p>
          )}
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-full bg-accent text-accent-foreground font-medium text-sm hover:bg-accent/90"
        >
          {isLoading
            ? isLogin
              ? "Connexion..."
              : "Création..."
            : isLogin
            ? "Se connecter"
            : "Créer mon compte"}
        </Button>
      </form>

      {/* Toggle link as button */}
      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setIsLogin(!isLogin);
            setPassword("");
          }}
          className="w-full h-10 rounded-full border-2 border-primary text-primary text-sm font-medium hover:bg-primary hover:text-primary-foreground"
        >
          {isLogin ? "Créer un compte orga" : "J'ai déjà un compte orga"}
        </Button>
      </div>
    </div>
  );

  // Mobile: Drawer from bottom
  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="flex justify-start pt-3 pb-1">
            <button
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Fermer"
            >
              <X size={18} strokeWidth={2} />
            </button>
          </DrawerHeader>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop: Centered dialog with scale animation
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[380px] p-0 gap-0">
        <div className="flex justify-start p-3">
          <button
            onClick={() => onOpenChange(false)}
            className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
            aria-label="Fermer"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>
        {content}
      </DialogContent>
    </Dialog>
  );
};

export default AuthDrawer;
