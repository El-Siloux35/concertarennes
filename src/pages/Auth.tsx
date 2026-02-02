import { X, Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useState, useEffect, useCallback } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type AuthMode = "login" | "signup" | "forgot-password" | "verify-email";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const from = (location.state as { from?: string } | null)?.from;

  const [mode, setMode] = useState<AuthMode>("login");
  const [isClosing, setIsClosing] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  // Gérer la confirmation d'email (lien legacy) et la connexion automatique
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const isEmailConfirmation = hashParams.get("type") === "signup" || hashParams.get("type") === "email";

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        if (isEmailConfirmation) {
          toast({
            title: "✅ Email confirmé !",
            description: "Redirection en cours...",
            duration: 2000,
          });
          setTimeout(() => navigate("/home"), 1500);
        } else if (mode !== "verify-email") {
          toast({
            title: "Connexion réussie",
            description: "Bienvenue !",
            duration: 2500,
          });
          navigate(from ?? "/home");
        }
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, [navigate, from, toast, mode]);

  const OTP_LENGTH = 8;

  const verifyOtpCode = useCallback(async () => {
    if (!email || otpValue.length !== OTP_LENGTH || isVerifying) return;
    setIsVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otpValue,
        type: "email",
      });
      if (error) throw error;
      toast({
        title: "Connexion réussie",
        description: "Bienvenue !",
        duration: 2500,
      });
      navigate(from ?? "/home");
    } catch (err: unknown) {
      toast({
        title: "Code invalide",
        description: (err as Error)?.message || "Vérifiez le code et réessayez.",
        variant: "destructive",
      });
      setOtpValue("");
    } finally {
      setIsVerifying(false);
    }
  }, [email, otpValue, isVerifying, navigate, from, toast, OTP_LENGTH]);

  useEffect(() => {
    if (otpValue.length === OTP_LENGTH && mode === "verify-email") {
      verifyOtpCode();
    }
  }, [otpValue, mode, verifyOtpCode, OTP_LENGTH]);

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
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Impossible d'envoyer l'email de réinitialisation.";
        toast({
          title: "Erreur",
          description: message,
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
            data: { pseudo },
          },
        });

        if (error) throw error;

        if (data?.user && !data.session) {
          setMode("verify-email");
        } else {
          toast({
            title: "Compte créé",
            description: "Vous êtes maintenant connecté !",
          });
          navigate(from ?? "/home");
          setEmail("");
          setPassword("");
          setPseudo("");
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Une erreur est survenue.";
      let message = errorMessage;

      if (errorMessage.includes("Invalid login credentials")) {
        message = "Email ou mot de passe incorrect.";
      } else if (errorMessage.includes("User already registered")) {
        message = "Un compte existe déjà avec cet email. Essayez de vous connecter.";
      } else if (errorMessage.includes("Password should be at least")) {
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
      case "verify-email":
        return "Vérifier votre compte";
    }
  };

  const handleClose = () => {
    if (isMobile) {
      setIsClosing(true);
      setTimeout(() => {
        navigate(from || "/home");
      }, 300);
    } else {
      navigate(from || "/home");
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login":
        return "Connexion à mon espace orga";
      case "forgot-password":
        return "Entrez votre email pour recevoir un lien de réinitialisation";
      case "verify-email":
        return `Nous vous avons envoyé un mail à : ${email} avec un code.`;
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-0 bg-background flex flex-col z-50 overflow-y-auto ${
        isMobile ? (isClosing ? "animate-slide-out-right" : "animate-slide-in-right") : ""
      }`}
    >
      <div className="max-w-[900px] mx-auto flex-1 flex flex-col w-full pt-[env(safe-area-inset-top)]">
        {/* Close button - same as profile: w-10 h-10, pt-4 pl-4 */}
        <header className="pt-4 pl-4 pb-4">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
            aria-label="Fermer"
          >
            <X size={24} strokeWidth={1.75} className="text-primary-foreground" />
          </button>
        </header>

      {/* Content - centered */}
      <main className="flex-1 flex flex-col justify-center px-8 pb-10 max-w-md mx-auto w-full">
        {/* Icon + Title */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center mb-3">
            <Lock size={18} strokeWidth={1.75} className="text-accent-foreground" />
          </div>
          <h1 className="text-[20px] font-bold text-primary">{getTitle()}</h1>
          {getSubtitle() && (
            <p className="text-primary/70 text-[14px] text-center mt-2 max-w-[300px] leading-relaxed">
              {getSubtitle()}
            </p>
          )}
        </div>

        {/* Verify email - OTP : 8 traits en pilule (comme la ref) */}
        {mode === "verify-email" ? (
          <div className="flex flex-col items-center gap-6 w-full">
            <InputOTP
              maxLength={OTP_LENGTH}
              value={otpValue}
              onChange={setOtpValue}
              disabled={isVerifying}
              containerClassName="justify-center gap-3"
            >
              <InputOTPGroup className="gap-3">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                  <InputOTPSlot key={i} index={i} variant="pill" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            {isVerifying && (
              <div className="flex items-center gap-2 text-primary/70 text-sm">
                <Loader2 size={16} className="animate-spin" />
                <span>Vérification...</span>
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setOtpValue("");
              }}
              className="text-primary/70 text-sm underline"
            >
              Modifier l'email
            </button>
          </div>
        ) : (
        /* Form */
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
              <Mail size={18} strokeWidth={1.75} />
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
                  {showPassword ? <EyeOff size={18} strokeWidth={1.75} /> : <Eye size={18} strokeWidth={1.75} />}
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
        )}
      </main>
      </div>
    </div>
  );
};

export default Auth;
