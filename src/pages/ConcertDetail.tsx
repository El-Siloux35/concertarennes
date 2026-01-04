import { ChevronLeft, MapPin, Calendar, CircleDollarSign, Heart, Share2, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import ConfirmModal from "@/components/ConfirmModal";
import { useIsAdmin } from "@/hooks/useIsAdmin";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string;
  price: string | null;
  organizer: string | null;
  image_url: string | null;
  contact: string | null;
  user_id: string;
}

const ConcertDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
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
      <div className="max-w-[700px] mx-auto">
        {/* Header with back and favorite buttons - fixed */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-background">
          <div className="max-w-[700px] mx-auto p-4 flex justify-between items-center">
            <button
              onClick={() => navigate(-1)}
              className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
              aria-label="Retour"
            >
              <ChevronLeft size={24} strokeWidth={2} />
            </button>
            <button
              onClick={toggleFavorite}
              className="w-12 h-12 rounded-full bg-card flex items-center justify-center text-primary"
              aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart size={24} strokeWidth={2} fill={isFavorite ? "currentColor" : "none"} />
            </button>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-20"></div>

        {/* Concert image */}
        <div className="px-4 mb-4">
          <div 
            className="w-full rounded-2xl overflow-hidden border-2 border-primary bg-muted"
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
        </div>

        {/* Content */}
        <div className="px-4">
          {/* Organizer badge */}
          <div className="inline-block bg-primary text-primary-foreground text-xs font-medium px-2 py-1 mb-3">
            {event.organizer || "Organisateur"}
          </div>

          {/* Concert title */}
          <h1 className="text-xl font-semibold text-primary leading-tight mb-3">
            {event.title}
          </h1>

          {/* Edit button if owner or admin */}
          {canEdit && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => navigate(`/modifier-evenement/${id}`)}
                className="text-primary"
                aria-label="Modifier"
              >
                <Pencil size={20} />
              </button>
            </div>
          )}

          {/* Description */}
          {event.description && (
            <p className="text-primary text-sm leading-relaxed">
              {event.description}
            </p>
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

          {/* Venue */}
          <div className="flex items-center text-primary text-sm gap-2 mb-2">
            <MapPin size={16} strokeWidth={1.5} className="flex-shrink-0" />
            <span>{event.location || "Lieu non spécifié"}</span>
          </div>

          {/* Date and price */}
          <div className="flex items-center gap-4 text-primary text-sm mb-4">
            <div className="flex items-center gap-2">
              <Calendar size={16} strokeWidth={1.5} className="flex-shrink-0" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CircleDollarSign size={16} strokeWidth={1.5} className="flex-shrink-0" />
              <span>{event.price || "Prix non spécifié"}</span>
            </div>
          </div>
        </div>

        {/* Floating action buttons */}
        <div className="fixed bottom-6 left-4 right-4 max-w-[700px] mx-auto flex flex-col gap-3">
          <Button
            onClick={handleShare}
            className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium text-base gap-2"
          >
            <Share2 size={20} strokeWidth={2} />
            Envoyer le lien
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
