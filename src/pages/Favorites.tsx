import { ChevronLeft, MapPin, Calendar, CircleDollarSign, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string;
  price: string | null;
  organizer: string | null;
  image_url: string | null;
}

const Favorites = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedFavorites = JSON.parse(localStorage.getItem("favorites") || "[]");
    setFavorites(storedFavorites);
  }, []);

  useEffect(() => {
    const fetchFavoriteEvents = async () => {
      if (favorites.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", favorites);

      if (error) {
        console.error("Error fetching favorite events:", error);
        setLoading(false);
        return;
      }

      setEvents(data || []);
      setLoading(false);
    };

    fetchFavoriteEvents();
  }, [favorites]);

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((favId) => favId !== id);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
    window.dispatchEvent(new Event('favoritesUpdated'));
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
        {loading ? (
          <div className="text-center py-12">
            <p className="text-primary/60">Chargement...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <Heart size={48} className="mx-auto text-primary/30 mb-4" />
            <p className="text-primary/60">Aucun favori pour le moment</p>
          </div>
        ) : (
          events.map((event) => (
            <article
              key={event.id}
              onClick={() => navigate(`/concert/${event.id}`)}
              className="bg-card border-2 border-primary rounded-2xl p-4 cursor-pointer relative"
            >
              {/* Remove favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(event.id);
                }}
                className="absolute top-4 right-4 text-primary"
                aria-label="Retirer des favoris"
              >
                <Heart size={24} strokeWidth={2} fill="currentColor" />
              </button>

              {/* Organizer badge */}
              <div className="inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 mb-3">
                {event.organizer || "Organisateur"}
              </div>

              {/* Event name */}
              <h2 className="font-semibold text-lg text-primary leading-tight mb-4 pr-8">
                {event.title}
              </h2>

              {/* Details */}
              <div className="space-y-1.5">
                <div className="flex items-center text-primary text-sm gap-[4px]">
                  <MapPin size={14} strokeWidth={1.5} className="flex-shrink-0" />
                  <span>{event.location || "Lieu non spécifié"}</span>
                </div>

                <div className="flex items-center gap-4 text-primary text-sm">
                  <div className="flex items-center gap-[4px]">
                    <Calendar size={14} strokeWidth={1.5} className="flex-shrink-0" />
                    <span>{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-[4px]">
                    <CircleDollarSign size={14} strokeWidth={1.5} className="flex-shrink-0" />
                    <span>{event.price || "Prix non spécifié"}</span>
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
