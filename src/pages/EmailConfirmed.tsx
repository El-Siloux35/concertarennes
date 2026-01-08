import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmailConfirmed = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Rediriger automatiquement après 3 secondes
    const timer = setTimeout(() => {
      navigate("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleClose = () => {
    // Essayer de fermer l'onglet
    window.close();

    // Si ça ne fonctionne pas (restrictions navigateur), rediriger
    setTimeout(() => {
      navigate("/home");
    }, 100);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icône de succès */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 size={48} className="text-green-600 dark:text-green-500" />
          </div>
        </div>

        {/* Titre */}
        <div>
          <h1 className="text-2xl font-bold text-primary mb-2">
            Email confirmé !
          </h1>
          <p className="text-muted-foreground">
            Votre compte est maintenant actif. Vous êtes connecté automatiquement.
          </p>
        </div>

        {/* Message d'instruction */}
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            Vous pouvez fermer cet onglet et retourner sur l'onglet précédent,
            ou cliquer sur le bouton ci-dessous.
          </p>
        </div>

        {/* Boutons */}
        <div className="space-y-3">
          <Button
            onClick={handleClose}
            className="w-full h-12 rounded-full bg-accent text-accent-foreground"
          >
            Fermer cet onglet
          </Button>

          <Button
            onClick={() => navigate("/home")}
            variant="secondary"
            className="w-full h-12 rounded-full"
          >
            Aller à l'accueil
          </Button>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-xs text-muted-foreground">
          Redirection automatique dans 3 secondes...
        </p>
      </div>
    </div>
  );
};

export default EmailConfirmed;
