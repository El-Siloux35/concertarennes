import { ChevronLeft, MapPin, Calendar, CircleDollarSign } from "lucide-react";
import { FavoriteIcon } from "@/components/icons/FavoriteIcon";
import { RetourIcon } from "@/components/icons/RetourIcon";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
import DesktopPageBanner, { DesktopPageBannerSpacer } from "@/components/DesktopPageBanner";
import EmptyState from "@/components/EmptyState";
import {
  isUuid,
  readFavoritesDetailed,
  writeFavorites,
  FAVORITES_UPDATED_EVENT,
} from "@/lib/favorites";

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
      const { ids, hadInvalid } = readFavoritesDetailed();

      if (hadInvalid) {
        writeFavorites(ids);

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
    window.addEventListener(FAVORITES_UPDATED_EVENT, syncFavorites);
    window.addEventListener("storage", syncFavorites);

    return () => {
      window.removeEventListener(FAVORITES_UPDATED_EVENT, syncFavorites);
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
        toast({
          title: "Erreur",
          description: "Impossible de charger vos favoris",
        });
        setEvents([]);
        setLoading(false);
        return;
      }

      const found = data || [];

      // Évènements supprimés depuis leur mise en favori : on retire les ids
      // orphelins du stockage, sinon le compteur du header continue de les
      // compter alors que plus rien ne peut s'afficher ici.
      const foundIds = new Set(found.map((event) => event.id));
      const stillExisting = favoriteIds.filter((id) => foundIds.has(id));
      if (stillExisting.length !== favoriteIds.length) {
        writeFavorites(stillExisting);
      }

      setEvents(found);
      setLoading(false);
    };

    fetchFavoriteEvents();
  }, [favorites, toast]);

  const removeFavorite = (id: string) => {
    const newFavorites = favorites.filter((favId) => favId !== id);
    setFavorites(newFavorites);
    writeFavorites(newFavorites);
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
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-[900px] mx-auto flex-1 flex flex-col w-full">
        {/* Fixed Header */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background">
          <DesktopPageBanner />
          <div className="max-w-[900px] mx-auto p-4 flex justify-between items-center">
            <button
              onClick={() => navigate("/home")}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Retour"
            >
              <RetourIcon size={24} />
            </button>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20"></div>
        <DesktopPageBannerSpacer />

        {/* Page Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-primary text-center mt-8 mb-8">Mes favoris</h1>

        {/* Filter Tabs */}
        <div className="px-6 mb-6">
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === "upcoming"
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-primary text-primary bg-transparent"
              }`}
            >
              À venir ({upcomingEvents.length})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
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
        <div className="px-6 space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-primary/60">Chargement...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState
              message={
                activeTab === "upcoming"
                  ? "Aucun évènement à venir dans vos favoris"
                  : "Aucun évènement passé dans vos favoris"
              }
            />
          ) : (
            filteredEvents.map((event) => (
              <article
                key={event.id}
                onClick={() => navigate(`/concert/${event.id}?from=favorites`)}
                className={`bg-card border-2 border-primary rounded-2xl p-4 cursor-pointer relative ${
                  activeTab === "past" ? "opacity-70" : ""
                }`}
              >
                {/* Remove favorite button - z-10 et zone de touch étendue pour décocher correctement */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFavorite(event.id);
                  }}
                  className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-background/80 text-primary touch-manipulation"
                  aria-label="Retirer des favoris"
                >
                  <FavoriteIcon size={20} fill="currentColor" />
                </button>

                {/* Organizer badge - hug content */}
                <div className="w-fit bg-primary text-primary-foreground text-xs font-medium px-2 py-1 mb-3">
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
                      strokeWidth={1.25}
                      className="flex-shrink-0"
                    />
                    <span>{event.location || "Lieu non spécifié"}</span>
                  </div>

                  <div className="flex items-center gap-4 text-primary text-sm">
                    <div className="flex items-center gap-[4px]">
                      <Calendar
                        size={14}
                        strokeWidth={1.25}
                        className="flex-shrink-0"
                      />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-[4px]">
                      <CircleDollarSign
                        size={14}
                        strokeWidth={1.25}
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

        <div className="px-6 mt-auto">
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Favorites;
