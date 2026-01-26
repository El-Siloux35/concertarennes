import { MapPin, Calendar, CircleDollarSign, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

export interface Concert {
  id: string;
  organizer: string;
  name: string;
  venue: string;
  venueType?: string | null;
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

  const formatDate = (dateString: string, short: boolean = false) => {
    const date = new Date(dateString);
    if (short) {
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
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

  const getVenueLabel = (venue: string) => {
    const venues: Record<string, string> = {
      bars: "Bars",
      "ombres-electriques": "Ombres Électriques",
      autres: "Autres",
    };
    return venues[venue] || venue;
  };

  // Parse styles (can be comma-separated for multi-tags)
  const styleArray = concert.style ? concert.style.split(",").map(s => s.trim()).filter(Boolean) : [];

  return (
    <article
      onClick={onNavigate}
      className={`bg-card border-2 rounded-2xl relative cursor-pointer border-muted overflow-hidden ${
        isMobile ? "flex flex-col" : "flex h-[194px]"
      }`}
    >
      {/* Image thumbnail */}
      {concert.imageUrl && (
        <div className={isMobile ? "w-full h-[168px]" : "w-[184px] flex-shrink-0 self-stretch"}>
          <img
            src={concert.imageUrl}
            alt={concert.name}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className={`flex-1 ${isMobile ? "p-4" : "pt-4 pb-6 px-4"} flex flex-col`}>
        {/* Favorite button - 44x44 touch target */}
        <button
          onClick={toggleFavorite}
          className={`absolute top-2 right-2 w-[38px] h-[38px] flex items-center justify-center rounded-full ${
            isFavorite ? "bg-primary text-primary-foreground" : "bg-background text-primary"
          }`}
          aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            size={20}
            strokeWidth={isFavorite ? 0 : 2}
            fill={isFavorite ? "currentColor" : "none"}
            stroke={isFavorite ? "none" : "currentColor"}
          />
        </button>

        {/* Organizer badge - square corners */}
        <span className="inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 mb-3 self-start">
          {concert.organizer}
        </span>

        {/* Concert name */}
        <h2 className="font-semibold text-lg text-primary leading-tight mb-4">
          {concert.name}
        </h2>

        {/* Details */}
        <div className={isMobile ? "flex items-center gap-3 text-primary text-sm" : "flex items-center gap-4 mt-auto text-primary text-sm"}>
          <div className="flex items-center gap-[4px] min-w-0">
            <MapPin size={14} strokeWidth={1.5} className="flex-shrink-0" />
            <span className="truncate max-w-[100px]">{concert.venue}</span>
          </div>
          <div className="flex items-center gap-[4px] flex-shrink-0">
            <Calendar size={14} strokeWidth={1.5} className="flex-shrink-0" />
            <span>{formatDate(concert.date, isMobile)}</span>
          </div>
          <div className="flex items-center gap-[4px] min-w-0">
            <CircleDollarSign size={14} strokeWidth={1.5} className="flex-shrink-0" />
            <span className="truncate max-w-[60px]">{concert.price}</span>
          </div>
        </div>

        {/* Style and Venue tags */}
        {(styleArray.length > 0 || concert.venueType) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {styleArray.map((s) => (
              <span key={s} className="h-6 px-3 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center">
                {getStyleLabel(s)}
              </span>
            ))}
            {concert.venueType && (
              <span className="h-6 px-3 rounded-full bg-concert-purple-light text-primary text-xs font-medium flex items-center">
                {getVenueLabel(concert.venueType)}
              </span>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ConcertCard;
