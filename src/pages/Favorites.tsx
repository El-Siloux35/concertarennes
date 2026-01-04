import { ChevronLeft, MapPin, Calendar, CircleDollarSign, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Mock concerts data - same as in other components
const mockConcerts = [
  {
    id: "1",
    organizer: "Capital Taboulé",
    name: "Culture Emotion - Toujours l'été - Nuage Noir",
    venue: "Le bois Harel",
    date: "2025-12-13",
    price: "Prix Libre"
  },
  {
    id: "2",
    organizer: "La Sirène",
    name: "Jazz sous les étoiles",
    venue: "Parc du Thabor",
    date: "2025-12-14",
    price: "15€"
  },
  {
    id: "3",
    organizer: "Ubu",
    name: "Electro Night",
    venue: "L'Ubu",
    date: "2025-12-15",
    price: "20€"
  },
  {
    id: "4",
    organizer: "Le Liberté",
    name: "Rock Festival",
    venue: "Le Liberté",
    date: "2025-12-20",
    price: "25€"
  }
];

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(storedFavorites);
  }, []);

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((favId) => favId !== id);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const favoriteConcerts = mockConcerts.filter((concert) => favorites.includes(concert.id));

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="p-4 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
          aria-label="Retour"
        >
          <ChevronLeft size={24} strokeWidth={2} />
        </button>
        <h1 className="text-xl font-bold text-primary">Mes favoris</h1>
      </div>

      {/* Favorites list */}
      <div className="px-4 space-y-4">
        {favoriteConcerts.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-primary/30 mb-4" />
            <p className="text-primary/60">Aucun favori pour le moment</p>
          </div>
        ) : (
          favoriteConcerts.map((concert) => (
            <article
              key={concert.id}
              onClick={() => navigate(`/concert/${concert.id}`)}
              className="bg-card border-2 border-primary rounded-2xl p-4 cursor-pointer relative"
            >
              {/* Remove favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(concert.id);
                }}
                className="absolute top-4 right-4 text-primary"
                aria-label="Retirer des favoris"
              >
                <Heart size={24} strokeWidth={2} fill="hsl(259, 75%, 42%)" />
              </button>

              {/* Organizer badge */}
              <div className="inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 mb-3">
                {concert.organizer}
              </div>

              {/* Concert name */}
              <h2 className="font-semibold text-lg text-primary leading-tight mb-4 pr-8">
                {concert.name}
              </h2>

              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex items-center text-primary text-sm gap-[4px]">
                  <MapPin size={14} strokeWidth={1.5} className="flex-shrink-0" />
                  <span>{concert.venue}</span>
                </div>

                <div className="flex items-center gap-4 text-primary text-sm">
                  <div className="flex items-center gap-[4px]">
                    <Calendar size={14} strokeWidth={1.5} className="flex-shrink-0" />
                    <span>{formatDate(concert.date)}</span>
                  </div>
                  <div className="flex items-center gap-[4px]">
                    <CircleDollarSign size={14} strokeWidth={1.5} className="flex-shrink-0" />
                    <span>{concert.price}</span>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  );
};

export default Favorites;