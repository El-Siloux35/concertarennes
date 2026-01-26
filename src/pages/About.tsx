import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[1000px] mx-auto flex-1 flex flex-col w-full">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background">
          <div className="max-w-[1000px] mx-auto p-4 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Retour"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20"></div>

        {/* Content */}
        <div className="px-4 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
            L'agenda du 35
          </h1>
          <p className="text-sm md:text-base text-primary/70 mb-6">
            L'agenda des musiques alternatives à Rennes et aux alentours
          </p>

          {/* PWA Installation Instructions */}
          <div className="bg-card rounded-2xl p-5 mb-6">
            <h2 className="text-base font-semibold text-primary mb-4">
              Ajouter le lien du site sur mon écran d'accueil de smartphone pour l'ouvrir comme une application.
            </h2>

            {/* iPhone Instructions */}
            <div className="mb-5">
              <h3 className="text-sm font-semibold text-accent mb-2">Sur iPhone (Safari)</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-primary text-sm">
                <li>Ouvrez le site dans le navigateur Safari.</li>
                <li>Appuyez sur l'icône <strong>Partager</strong> (le carré avec une flèche vers le haut en bas de l'écran).</li>
                <li>Faites défiler vers le bas et appuyez sur <strong>Sur l'écran d'accueil</strong>.</li>
                <li>Appuyez sur <strong>Ajouter</strong>. C'est fini !</li>
              </ol>
            </div>

            {/* Android Instructions */}
            <div>
              <h3 className="text-sm font-semibold text-accent mb-2">Sur Android (Chrome)</h3>
              <ol className="list-decimal list-inside space-y-1.5 text-primary text-sm">
                <li>Ouvrez le site dans le navigateur Chrome.</li>
                <li>Appuyez sur les <strong>3 petits points</strong> en haut à droite.</li>
                <li>Appuyez sur <strong>Installer l'application</strong> (ou "Ajouter à l'écran d'accueil").</li>
                <li>Confirmez en appuyant sur <strong>Installer</strong>.</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="px-4">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default About;
