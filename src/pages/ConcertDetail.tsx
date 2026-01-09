import { ChevronLeft, MapPin, Calendar, CircleDollarSign, Heart, Share2, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConfirmModal from "@/components/ConfirmModal";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import Footer from "@/components/Footer";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  venue: string | null;
  date: string;
  price: string | null;
  organizer: string | null;
  image_url: string | null;
  contact: string | null;
  user_id: string;
  style: string | null;
}

const ConcertDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromPage = searchParams.get("from");
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { isAdmin } = useIsAdmin();

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        console.error("Error fetching event:", error);
        setLoading(false);
        return;
      }

      setEvent(data);
      setLoading(false);
    };

    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };

    fetchEvent();
    checkUser();
  }, [id]);

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

  const handleShare = async () => {
    if (!event) return;
    
    const shareData = {
      title: event.title,
      text: `${event.title} - ${event.location || ''} le ${formatDate(event.date)}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié",
          description: "Le lien a été copié dans le presse-papier",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleContactSignal = () => {
    if (event?.contact) {
      const signalUrl = `https://signal.me/#p/${event.contact.replace(/\+/g, '')}`;
      window.open(signalUrl, '_blank');
    } else {
      toast({
        title: "Contact non disponible",
        description: "L'organisateur n'a pas renseigné de numéro de contact",
      });
    }
  };

  const handleDelete = async () => {
    if (!id) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'évènement",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Succès",
      description: "Évènement supprimé",
    });
    navigate("/home");
  };

  const canEdit = (currentUserId && event?.user_id === currentUserId) || isAdmin;

  // Parse styles (can be comma-separated for multi-tags)
  const styleArray = event?.style ? event.style.split(",").map(s => s.trim()).filter(Boolean) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">Chargement...</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">Évènement non trouvé</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      <div className="max-w-[900px] mx-auto">
        {/* Header with back and favorite buttons - fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background">
          <div className="max-w-[900px] mx-auto p-4 flex justify-between items-center">
            <button
              onClick={() => navigate(fromPage === "favorites" ? "/favoris" : "/home")}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Retour"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <div className="flex items-center gap-2">
              {canEdit && (
                <button
                  onClick={() => navigate(`/modifier-evenement/${id}?from=event`)}
                  className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary"
                  aria-label="Modifier"
                >
                  <Pencil size={24} strokeWidth={2} />
                </button>
              )}
              <button
                onClick={toggleFavorite}
                className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary"
                aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
              >
                <Heart size={24} strokeWidth={2} fill={isFavorite ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20"></div>

        {/* Two-column layout on desktop, single column on mobile */}
        <div className="md:flex md:gap-8 px-4">
          {/* Left column - Image (376px on desktop) */}
          <div className="md:w-[376px] md:flex-shrink-0 mb-4 md:mb-0">
            <div 
              className="w-full overflow-hidden bg-muted"
              style={{ minHeight: event.image_url ? "auto" : "300px" }}
            >
              {event.image_url ? (
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-auto object-cover"
                />
              ) : (
                <div className="w-full h-[300px] flex items-center justify-center">
                  <span className="text-primary/50">Pas d'image</span>
                </div>
              )}
            </div>

            {/* Action buttons under image - desktop only */}
            <div className="hidden md:flex flex-col gap-3 mt-4">
              <Button
                onClick={handleShare}
                className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-base gap-2"
              >
                <Share2 size={20} strokeWidth={2} />
                Partager l'évènement
              </Button>

              {event.contact && (
                <Button
                  onClick={handleContactSignal}
                  variant="secondary"
                  className="w-full h-14 rounded-full bg-secondary text-secondary-foreground font-medium text-base"
                >
                  Obtenir plus d'infos
                </Button>
              )}
            </div>
          </div>

          {/* Right column - Content */}
          <div className="md:flex-1">
            {/* Organizer badge */}
            <div className="inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 mb-3">
              {event.organizer || "Organisateur"}
            </div>

            {/* Concert title */}
            <h1 className="text-xl font-semibold text-primary leading-tight mb-3">
              {event.title}
            </h1>

            {/* Description */}
            {event.description && (
              <p className="text-primary text-sm leading-relaxed mb-6 whitespace-pre-line">
                {event.description}
              </p>
            )}

            {/* Venue */}
            <div className="flex items-center text-primary text-sm gap-2 mb-2">
              <MapPin size={16} strokeWidth={1.5} className="flex-shrink-0" />
              <span>{event.location || "Lieu non spécifié"}</span>
            </div>

            {/* Date and price */}
            <div className="flex items-center gap-4 text-primary text-sm">
              <div className="flex items-center gap-2">
                <Calendar size={16} strokeWidth={1.5} className="flex-shrink-0" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <CircleDollarSign size={16} strokeWidth={1.5} className="flex-shrink-0" />
                <span>{event.price || "Prix non spécifié"}</span>
              </div>
            </div>

            {/* Style tags */}
            {styleArray.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {styleArray.map((s) => (
                  <span key={s} className="h-6 px-3 rounded-full bg-accent text-accent-foreground text-xs font-medium flex items-center">
                    {getStyleLabel(s)}
                  </span>
                ))}
              </div>
            )}

            {/* Venue tag in light purple */}
            {event.venue && (
              <div className="mt-3">
                <span className="h-6 px-3 rounded-full bg-concert-purple-light text-primary text-xs font-medium inline-flex items-center">
                  {getVenueLabel(event.venue)}
                </span>
              </div>
            )}

            {/* Delete button if owner or admin */}
            {canEdit && (
              <div className="mt-12">
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="destructive"
                  className="gap-2"
                >
                  <Trash2 size={20} />
                  Supprimer
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Floating action buttons - mobile only */}
        <div className="md:hidden fixed bottom-6 left-4 right-4 max-w-[900px] mx-auto flex flex-col gap-3">
          <Button
            onClick={handleShare}
            className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-base gap-2"
          >
            <Share2 size={20} strokeWidth={2} />
            Partager l'évènement
          </Button>

          {event.contact && (
            <Button
              onClick={handleContactSignal}
              variant="secondary"
              className="w-full h-14 rounded-full bg-secondary text-secondary-foreground font-medium text-base"
            >
              Obtenir plus d'infos
            </Button>
          )}
        </div>

        <div className="px-4">
          <Footer />
        </div>
      </div>

      <ConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Supprimer l'évènement"
        description="Êtes-vous sûr de vouloir supprimer cet évènement ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDelete}
        variant="destructive"
      />
    </div>
  );
};

export default ConcertDetail;
