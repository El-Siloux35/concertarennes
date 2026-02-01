import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const About = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const handleSendEmail = () => {
    const subject = encodeURIComponent("Contact - L'agenda du 35");
    const body = encodeURIComponent(message);
    window.location.href = `mailto:hugon.cecile@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[1000px] mx-auto flex-1 flex flex-col w-full">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background pt-[env(safe-area-inset-top)]">
          <div className="max-w-[1000px] mx-auto pt-4 pl-4 pb-4 pr-4 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Retour"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-[calc(4rem+env(safe-area-inset-top,0px))]"></div>

        {/* Content */}
        <div className="px-6 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-8">Infos</h1>

          {/* Purple block from homepage - at top */}
          <div className="bg-primary rounded-2xl p-6 text-primary-foreground mb-6">
            <h2 className="font-semibold text-lg mb-1">L'agenda du 35</h2>
            <p className="text-sm opacity-90">
              L'agenda des évènements qui étaient avant sur whatsapp, avant sur signal, avant par texto…
            </p>
          </div>

          {/* PWA Installation Instructions - orange like home */}
          <div className="bg-accent rounded-2xl p-6 text-accent-foreground mb-6">
            <h2 className="font-semibold text-lg mb-4">
              Ajouter l'agenda du 35 à l'écran d'accueil de mon smartphone
            </h2>

            {/* iPhone Instructions */}
            <div className="mb-5">
              <h3 className="text-sm font-medium opacity-90 mb-2">Sur iPhone (Safari)</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-sm font-normal opacity-90">
                <li>Ouvrez le site dans le navigateur Safari.</li>
                <li>Appuyez sur l'icône <strong>Partager</strong> (le carré avec une flèche vers le haut en bas de l'écran).</li>
                <li>Faites défiler vers le bas et appuyez sur <strong>Sur l'écran d'accueil</strong>.</li>
                <li>Appuyez sur <strong>Ajouter</strong>. C'est fini !</li>
              </ol>
            </div>

            {/* Android Instructions */}
            <div>
              <h3 className="text-sm font-medium opacity-90 mb-2">Sur Android (Chrome)</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-sm font-normal opacity-90">
                <li>Ouvrez le site dans le navigateur Chrome.</li>
                <li>Appuyez sur les <strong>3 petits points</strong> en haut à droite.</li>
                <li>Appuyez sur <strong>Installer l'application</strong> (ou "Ajouter à l'écran d'accueil").</li>
                <li>Confirmez en appuyant sur <strong>Installer</strong>.</li>
              </ol>
            </div>
          </div>

          {/* Email contact form */}
          <div className="bg-card rounded-2xl p-6 mb-6">
            <h2 className="text-base font-medium text-primary mb-4">Envoyer un message</h2>
            <Textarea
              placeholder="Votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px] rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 px-4 py-3 resize-none mb-4"
            />
            <Button
              onClick={handleSendEmail}
              className="w-full h-12 rounded-full bg-primary text-primary-foreground font-medium"
            >
              Envoyer l'email
            </Button>
          </div>
        </div>

        <div className="px-6 mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default About;
