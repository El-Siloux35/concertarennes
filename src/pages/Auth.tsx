import { X, AtSign, Mail, Phone, ArrowLeft, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

type AuthStep = 'choose-method' | 'enter-identifier' | 'verify-otp';
type AuthMode = 'email' | 'phone';

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Flow states
  const [step, setStep] = useState<AuthStep>('choose-method');
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [isLogin, setIsLogin] = useState(true);
  
  // Form states
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  // Timer for resend button
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'verify-otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleChooseMethod = (mode: AuthMode) => {
    setAuthMode(mode);
    setStep('enter-identifier');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const identifier = authMode === 'email' ? email : phone;
    
    if (!identifier || (!isLogin && !pseudo)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (authMode === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: !isLogin,
            data: !isLogin ? { pseudo } : undefined,
          }
        });

        if (error) throw error;
      } else {
        // Format phone number with country code if not present
        const formattedPhone = phone.startsWith('+') ? phone : `+33${phone.replace(/^0/, '')}`;
        
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            shouldCreateUser: !isLogin,
            data: !isLogin ? { pseudo } : undefined,
          }
        });

        if (error) throw error;
      }

      toast({
        title: "Code envoyé",
        description: authMode === 'email' 
          ? `Un code a été envoyé à ${email}`
          : `Un code a été envoyé au ${phone}`,
      });
      
      setStep('verify-otp');
      setResendTimer(60);
      setCanResend(false);
      
    } catch (error: any) {
      let message = error.message;
      
      if (error.message?.includes("User already registered")) {
        message = "Un compte existe déjà avec cet identifiant. Essayez de vous connecter.";
      } else if (error.message?.includes("Phone") && error.message?.includes("provider")) {
        message = "L'authentification par téléphone n'est pas encore configurée.";
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

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer le code à 6 chiffres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      if (authMode === 'email') {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: otpCode,
          type: 'email',
        });

        if (error) throw error;
      } else {
        const formattedPhone = phone.startsWith('+') ? phone : `+33${phone.replace(/^0/, '')}`;
        
        const { error } = await supabase.auth.verifyOtp({
          phone: formattedPhone,
          token: otpCode,
          type: 'sms',
        });

        if (error) throw error;
      }

      toast({
        title: isLogin ? "Connexion réussie" : "Compte créé",
        description: "Bienvenue !",
      });
      
      navigate("/home");
      
    } catch (error: any) {
      let message = error.message;
      
      if (error.message?.includes("Invalid") || error.message?.includes("expired")) {
        message = "Code invalide ou expiré. Veuillez réessayer.";
      }
      
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
      setOtpCode("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    setOtpCode("");
    
    try {
      if (authMode === 'email') {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            shouldCreateUser: !isLogin,
            data: !isLogin ? { pseudo } : undefined,
          }
        });

        if (error) throw error;
      } else {
        const formattedPhone = phone.startsWith('+') ? phone : `+33${phone.replace(/^0/, '')}`;
        
        const { error } = await supabase.auth.signInWithOtp({
          phone: formattedPhone,
          options: {
            shouldCreateUser: !isLogin,
            data: !isLogin ? { pseudo } : undefined,
          }
        });

        if (error) throw error;
      }

      toast({
        title: "Code renvoyé",
        description: "Un nouveau code a été envoyé",
      });
      
      setResendTimer(60);
      setCanResend(false);
      
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'verify-otp') {
      setStep('enter-identifier');
      setOtpCode("");
    } else if (step === 'enter-identifier') {
      setStep('choose-method');
    }
  };

  const resetForm = () => {
    setStep('choose-method');
    setPseudo("");
    setEmail("");
    setPhone("");
    setOtpCode("");
  };

  // Step 1: Choose authentication method
  if (step === 'choose-method') {
    return (
      <div className="min-h-screen bg-background px-4 pt-4">
        <div className="max-w-[700px] mx-auto">
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
                ? "Choisissez votre méthode de connexion."
                : "Choisissez comment créer votre compte."}
            </p>
          </div>

          {/* Method buttons */}
          <div className="space-y-4">
            <Button
              onClick={() => handleChooseMethod('email')}
              className="w-full h-14 rounded-[8px] border-2 border-primary bg-transparent text-primary font-medium text-base hover:bg-primary hover:text-primary-foreground transition-colors"
              variant="outline"
            >
              <Mail className="mr-3" size={20} strokeWidth={1.5} />
              Continuer avec Email
            </Button>
            
            <Button
              onClick={() => handleChooseMethod('phone')}
              className="w-full h-14 rounded-[8px] border-2 border-primary bg-transparent text-primary font-medium text-base hover:bg-primary hover:text-primary-foreground transition-colors"
              variant="outline"
            >
              <Phone className="mr-3" size={20} strokeWidth={1.5} />
              Continuer avec Téléphone
            </Button>
          </div>

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
      </div>
    );
  }

  // Step 2: Enter identifier (email or phone)
  if (step === 'enter-identifier') {
    return (
      <div className="min-h-screen bg-background px-4 pt-4">
        <div className="max-w-[700px] mx-auto">
          {/* Back button */}
          <div className="mb-12">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-primary font-medium"
              aria-label="Retour"
            >
              <ArrowLeft size={20} strokeWidth={2} />
              <span>Retour</span>
            </button>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-bold text-primary mb-2">
              {isLogin ? "Se connecter" : "Créer un compte"}
            </h1>
            <p className="text-primary text-sm">
              {authMode === 'email' 
                ? "Entrez votre email pour recevoir un code."
                : "Entrez votre numéro pour recevoir un code SMS."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSendOtp} className="space-y-4">
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

            {/* Email or Phone input */}
            {authMode === 'email' ? (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
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
            ) : (
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                  <Phone size={20} strokeWidth={1.5} />
                </div>
                <Input
                  type="tel"
                  placeholder="Numéro de téléphone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-14 pl-12 rounded-[8px] border-2 border-primary bg-transparent text-primary placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
                />
                <p className="text-primary/60 text-xs mt-2 ml-1">
                  Format: 0612345678 ou +33612345678
                </p>
              </div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-base mt-8 hover:bg-accent"
            >
              {isLoading ? "Envoi..." : "Recevoir le code"}
            </Button>
          </form>

          {/* Toggle link */}
          <div className="text-center mt-12">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                resetForm();
              }}
              className="text-primary underline text-sm font-medium"
            >
              {isLogin ? "créer un compte" : "j'ai déjà un compte"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Verify OTP code
  return (
    <div className="min-h-screen bg-background px-4 pt-4">
      <div className="max-w-[700px] mx-auto">
        {/* Back button */}
        <div className="mb-12">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-primary font-medium"
            aria-label="Retour"
          >
            <ArrowLeft size={20} strokeWidth={2} />
            <span>Modifier</span>
          </button>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-2xl font-bold text-primary mb-2">
            Vérification
          </h1>
          <p className="text-primary text-sm">
            Entrez le code à 6 chiffres envoyé à
          </p>
          <p className="text-primary font-medium mt-1">
            {authMode === 'email' ? email : phone}
          </p>
        </div>

        {/* OTP Input */}
        <div className="flex justify-center mb-8">
          <InputOTP
            value={otpCode}
            onChange={setOtpCode}
            maxLength={6}
            onComplete={handleVerifyOtp}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} className="w-12 h-14 text-xl border-2 border-primary text-primary" />
              <InputOTPSlot index={1} className="w-12 h-14 text-xl border-2 border-primary text-primary" />
              <InputOTPSlot index={2} className="w-12 h-14 text-xl border-2 border-primary text-primary" />
              <InputOTPSlot index={3} className="w-12 h-14 text-xl border-2 border-primary text-primary" />
              <InputOTPSlot index={4} className="w-12 h-14 text-xl border-2 border-primary text-primary" />
              <InputOTPSlot index={5} className="w-12 h-14 text-xl border-2 border-primary text-primary" />
            </InputOTPGroup>
          </InputOTP>
        </div>

        {/* Verify button */}
        <Button
          onClick={handleVerifyOtp}
          disabled={isLoading || otpCode.length !== 6}
          className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-base hover:bg-accent"
        >
          {isLoading ? "Vérification..." : "Vérifier"}
        </Button>

        {/* Resend button */}
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!canResend || isLoading}
            className={`flex items-center justify-center gap-2 mx-auto ${
              canResend ? 'text-primary' : 'text-primary/40'
            }`}
          >
            <RefreshCw size={16} strokeWidth={2} />
            {canResend 
              ? "Renvoyer le code" 
              : `Renvoyer dans ${resendTimer}s`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
