import { MapPin, Calendar, CircleDollarSign, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Concert {
  id: string;
  organizer: string;
  name: string;
  venue: string;
  date: string;
  price: string;
  imageUrl?: string | null;
  style?: string | null;
}

interface ConcertCardProps {
  concert: Concert;
  onNavigate?: () => void;
}

const ConcertCard = ({ concert, onNavigate }: ConcertCardProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setIsFavorite(favorites.includes(concert.id));
  }, [concert.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    let newFavorites: string[];
    if (isFavorite) {
      newFavorites = favorites.filter((id: string) => id !== concert.id);
    } else {
      newFavorites = [...favorites, concert.id];
    }
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);

    // Dispatch event to update header counter immediately
    window.dispatchEvent(new Event("favoritesUpdated"));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStyleLabel = (style: string) => {
    const styles: Record<string, string> = {
      concert: "Concert",
      projection: "Projection",
      exposition: "Exposition",
      autres: "Autres",
    };
    return styles[style] || style;
  };

  // Parse styles (can be comma-separated for multi-tags)
  const styleArray = concert.style ? concert.style.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <article
      onClick={onNavigate}
      className={`bg-card border-2 rounded-2xl animate-fade-in relative cursor-pointer border-muted overflow-hidden ${
        isMobile ? "flex flex-col" : "flex"
      }`}
    >
      {/* Image thumbnail */}
      {concert.imageUrl && (
        <div className={isMobile ? "w-full h-[100px]" : "w-[120px] flex-shrink-0"}>
          <img
            src={concert.imageUrl}
            alt={concert.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col">
        {/* Favorite button - 44x44 touch target */}
        <button
          onClick={toggleFavorite}
          className="absolute top-2 right-2 w-11 h-11 flex items-center justify-center text-primary"
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            size={24}
            strokeWidth={2}
            fill={isFavorite ? "hsl(259, 75%, 42%)" : "none"}
          />
        </button>

        {/* Organizer badge - square corners */}
        <div className="inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 mb-3 self-start">
          {concert.organizer}
        </div>

        {/* Concert name */}
        <h2 className="font-semibold text-lg text-primary leading-tight mb-4 pr-12">
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
              <CircleDollarSign
                size={14}
                strokeWidth={1.5}
                className="flex-shrink-0"
              />
              <span>{concert.price}</span>
            </div>
          </div>
        </div>

        {/* Style tags */}
        {styleArray.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {styleArray.map((s) => (
              <span key={s} className="h-6 px-3 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center">
                {getStyleLabel(s)}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
};

export default ConcertCard;
