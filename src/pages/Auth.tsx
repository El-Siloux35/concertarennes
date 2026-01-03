import { X, AtSign, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Auth = () => {
  const navigate = useNavigate();
  const [pseudo, setPseudo] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle signup logic
    console.log({ pseudo, email });
  };

  return (
    <div className="min-h-screen bg-background px-4 pt-4">
      {/* Close button */}
      <div className="flex justify-end mb-12">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
          aria-label="Fermer"
        >
          <X size={20} strokeWidth={2} />
        </button>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Compte orga
        </h1>
        <p className="text-foreground text-sm">
          Pour pouvoir ajouter, modifier et{"\n"}supprimer des évènements.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pseudo input */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
            <AtSign size={20} strokeWidth={1.5} />
          </div>
          <Input
            type="text"
            placeholder="Pseudo ou Prénom"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            className="h-14 pl-12 rounded-full border-2 border-primary bg-transparent text-foreground placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
          />
        </div>

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
            className="h-14 pl-12 rounded-full border-2 border-primary bg-transparent text-foreground placeholder:text-primary/60 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-primary"
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-14 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground font-medium text-base mt-8"
        >
          Créer un compte
        </Button>
      </form>

      {/* Login link */}
      <div className="text-center mt-12">
        <button
          type="button"
          onClick={() => {/* TODO: Navigate to login */}}
          className="text-primary underline text-sm font-medium"
        >
          j'ai déjà un compte
        </button>
      </div>
    </div>
  );
};

export default Auth;
