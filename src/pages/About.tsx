import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="p-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
            aria-label="Retour"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2">
            L'agenda du 35
          </h1>
          <p className="text-lg md:text-xl text-primary/70 mb-8">
            L'agenda des musiques alternatives à Rennes et aux alentours
          </p>
        </div>

        <div className="px-4">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default About;
