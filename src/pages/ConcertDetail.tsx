import { ChevronLeft, MapPin, Calendar, CircleDollarSign, Send, Heart } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Mock data - in real app would fetch based on id
const mockConcert = {
  id: "1",
  organizer: "Capital Taboulé",
  name: "Culture Emotion - Toujours l'été - Nuage Noir",
  description: "Lorem ipsum dolor sit amet consectetur. Enim dui venenatis ac massa scelerisque gravida sed quis. Porta posuere cum at scelerisque massa risus enim feugiat. Ultrices scelerisque ut nec consequat eu in. In a faucibus aliquam proin. Tristique malesuada blandit vitae odio vulputate mattis nulla.",
  venue: "Le bois Harel",
  date: "2025-12-13",
  price: "Prix Libre",
  createdBy: "@colin",
  image: "/placeholder.svg"
};

const ConcertDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites: string[];
    if (isFavorite) {
      newFavorites = favorites.filter((favId: string) => favId !== id);
    } else {
      newFavorites = [...favorites, id];
    }
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header with back and favorite buttons */}
      <div className="p-4 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
          aria-label="Retour"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <button
          onClick={toggleFavorite}
          className="text-primary"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart size={24} strokeWidth={2} fill={isFavorite ? "hsl(259, 75%, 42%)" : "none"} />
        </button>
      </div>

      {/* Concert image */}
      <div className="px-4 mb-4">
        <div className="w-full aspect-[4/5] rounded-2xl overflow-hidden border-2 border-primary bg-muted">
          <img
            src={mockConcert.image}
            alt={mockConcert.name}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {/* Organizer badge */}
        <div className="inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 mb-3">
          {mockConcert.organizer}
        </div>

        {/* Concert title */}
        <h1 className="text-xl font-semibold text-primary leading-tight mb-6">
          {mockConcert.name}
        </h1>

        {/* Description */}
        <p className="text-primary text-sm leading-relaxed mb-6">
          {mockConcert.description}
        </p>

        {/* Venue */}
        <div className="flex items-center text-primary text-sm gap-2 mb-2">
          <MapPin size={16} strokeWidth={1.5} className="flex-shrink-0" />
          <span>{mockConcert.venue}</span>
        </div>

        {/* Date and price */}
        <div className="flex items-center gap-4 text-primary text-sm mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} strokeWidth={1.5} className="flex-shrink-0" />
            <span>{formatDate(mockConcert.date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleDollarSign size={16} strokeWidth={1.5} className="flex-shrink-0" />
            <span>{mockConcert.price}</span>
          </div>
        </div>

        {/* Created by */}
        <p className="text-primary text-sm mb-8">
          Crée par <span className="underline">{mockConcert.createdBy}</span>
        </p>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-base gap-2 hover:bg-accent"
          >
            <Send size={20} strokeWidth={2} />
            Envoyer le lien
          </Button>

          <Button
            variant="ghost"
            className="w-full h-14 rounded-full bg-secondary text-secondary-foreground font-medium text-base hover:bg-secondary"
          >
            Obtenir plus d'infos
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConcertDetail;
