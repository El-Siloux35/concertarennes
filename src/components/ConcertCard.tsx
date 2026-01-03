import { MapPin, Calendar, CircleDollarSign, Heart } from "lucide-react";
import { useState, useEffect } from "react";
export interface Concert {
  id: string;
  organizer: string;
  name: string;
  venue: string;
  date: string;
  price: string;
}
interface ConcertCardProps {
  concert: Concert;
}
const ConcertCard = ({
  concert
}: ConcertCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(concert.id));
  }, [concert.id]);
  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites: string[];
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== concert.id);
    } else {
      newFavorites = [...favorites, concert.id];
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
  return <article className="bg-card border-2 border-primary rounded-2xl p-4 animate-fade-in relative">
      {/* Favorite button */}
      <button onClick={toggleFavorite} className="absolute top-4 right-4 text-primary hover:scale-110 transition-transform" aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}>
        <Heart size={24} strokeWidth={2} fill={isFavorite ? "hsl(259, 75%, 42%)" : "none"} />
      </button>

      {/* Organizer badge - square corners */}
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
    </article>;
};
export default ConcertCard;