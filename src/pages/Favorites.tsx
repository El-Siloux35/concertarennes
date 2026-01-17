import { ChevronLeft, MapPin, Calendar, CircleDollarSign, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string;
  price: string | null;
  organizer: string | null;
  image_url: string | null;
  venue: string | null;
}

type FilterTab = "upcoming" | "past";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isUuid = (value: string) => UUID_RE.test(value);

const readFavoritesFromStorage = (): { ids: string[]; hadInvalid: boolean } => {
  try {
    const raw = JSON.parse(localStorage.getItem("favorites") || "[]");
    if (!Array.isArray(raw)) return { ids: [], hadInvalid: false };

    const asStrings = raw.map((v) => String(v));
    const ids = asStrings.filter(isUuid);
    const hadInvalid = asStrings.length !== ids.length;
    return { ids, hadInvalid };
  } catch {
    return { ids: [], hadInvalid: false };
  }
};

const Favorites = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [favorites, setFavorites] = useState<string[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>("upcoming");

  const warnedInvalidRef = useRef(false);
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  useEffect(() => {
    const syncFavorites = () => {
      const { ids, hadInvalid } = readFavoritesFromStorage();

      if (hadInvalid) {
        localStorage.setItem("favorites", JSON.stringify(ids));

        if (!warnedInvalidRef.current) {
          warnedInvalidRef.current = true;
          toast({
            title: "Favoris mis à jour",
            description:
              "Certains anciens favoris n'étaient plus compatibles et ont été retirés.",
          });
        }
      }

      setFavorites(ids);
    };

    syncFavorites();
    window.addEventListener("favoritesUpdated", syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener("favoritesUpdated", syncFavorites);
      window.removeEventListener("storage", syncFavorites);
    };
  }, [toast]);

  useEffect(() => {
    const fetchFavoriteEvents = async () => {
      const favoriteIds = favorites.filter(isUuid);

      if (favoriteIds.length === 0) {
        setEvents([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", favoriteIds);

      if (error) {
        console.error("Error fetching favorite events:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos favoris",
        });
        setEvents([]);
        setLoading(false);
        return;
      }

      setEvents(data || []);
      setLoading(false);
    };

    fetchFavoriteEvents();
  }, [favorites, toast]);

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((favId) => favId !== id);
    localStorage.setItem("favorites", JSON.stringify(newFavorites));
    setFavorites(newFavorites);
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

  const upcomingEvents = events.filter((e) => e.date >= today);
  const pastEvents = events.filter((e) => e.date < today);
  const filteredEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-[900px] mx-auto">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background">
          <div className="max-w-[900px] mx-auto p-4 flex justify-between items-center">
            <button
              onClick={() => navigate("/home")}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Retour"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20"></div>

        {/* Page Title */}
        <h1 className="text-xl font-bold text-primary text-center mb-4">Mes favoris</h1>

        {/* Filter Tabs */}
        <div className="px-4 mb-4">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "upcoming"
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-primary text-primary bg-transparent"
              }`}
            >
              À venir ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "past"
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-primary text-primary bg-transparent"
              }`}
            >
              Passés ({pastEvents.length})
            </button>
          </div>
        </div>

        {/* Favorites list */}
        <div className="px-4 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary/60">Chargement...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={48} className="mx-auto text-primary/30 mb-4" />
              <p className="text-primary/60">
                {activeTab === "upcoming"
                  ? "Aucun évènement à venir dans vos favoris"
                  : "Aucun évènement passé dans vos favoris"}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <article
                key={event.id}
                onClick={() => navigate(`/concert/${event.id}?from=favorites`)}
                className={`bg-card border-2 border-primary rounded-2xl p-4 cursor-pointer relative ${
                  activeTab === "past" ? "opacity-70" : ""
                }`}
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
                    <MapPin
                      size={14}
                      strokeWidth={1.5}
                      className="flex-shrink-0"
                    />
                    <span>{event.location || "Lieu non spécifié"}</span>
                  </div>

                  <div className="flex items-center gap-4 text-primary text-sm">
                    <div className="flex items-center gap-[4px]">
                      <Calendar
                        size={14}
                        strokeWidth={1.5}
                        className="flex-shrink-0"
                      />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <CircleDollarSign
                        size={14}
                        strokeWidth={1.5}
                        className="flex-shrink-0"
                      />
                      <span>{event.price || "Prix non spécifié"}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Favorites;
