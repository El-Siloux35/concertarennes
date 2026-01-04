import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  pseudo: string | null;
  avatar_url: string | null;
}

interface Event {
  id: string;
  title: string;
  created_at: string;
}

const Compte = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!session?.user) {
          navigate("/auth");
          return;
        }
        setUser(session.user);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchEvents();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    
    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
    }
    
    setProfile(data);
    setLoading(false);
  };

  const fetchEvents = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("events")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    
    if (error) {
      console.error("Error fetching events:", error);
      return;
    }
    
    setEvents(data || []);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive",
      });
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", user.id);

    if (updateError) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
      return;
    }

    setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : null);
    toast({
      title: "Succès",
      description: "Photo de profil mise à jour",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/home");
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    // Delete profile (cascade will handle related data)
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", user.id);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive",
      });
      return;
    }

    await supabase.auth.signOut();
    navigate("/home");
    toast({
      title: "Compte supprimé",
      description: "Votre compte a été supprimé avec succès",
    });
  };

  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", eventToDelete);

    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'évènement",
        variant: "destructive",
      });
      return;
    }

    setEvents(prev => prev.filter(e => e.id !== eventToDelete));
    setEventToDelete(null);
    toast({
      title: "Succès",
      description: "Évènement supprimé",
    });
  };

  const displayName = profile?.pseudo || user?.user_metadata?.pseudo || user?.email?.split("@")[0] || "Utilisateur";

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-[700px] mx-auto px-4">
        {/* Header */}
        <header className="py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
          >
            <ArrowLeft size={20} className="text-primary-foreground" />
          </button>
        </header>

        {/* Avatar */}
        <div className="flex flex-col items-center mt-6">
          <div className="relative">
            <Avatar className="w-40 h-40 border-4 border-card">
              <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
              <AvatarFallback className="bg-card text-primary text-4xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={handleAvatarClick}
              className="absolute top-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center"
            >
              <Pencil size={14} className="text-primary-foreground" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <p className="text-primary font-medium text-lg mt-4">[{displayName}]</p>
        </div>

        {/* Logout Button */}
        <div className="mt-8">
          <Button
            onClick={() => setShowLogoutModal(true)}
            variant="outline"
            className="w-full rounded-full h-14 border-2 border-primary text-primary bg-transparent font-medium"
          >
            Deconnexion
          </Button>
        </div>

        {/* Events Section */}
        <div className="mt-8">
          <h2 className="text-primary font-semibold text-center mb-4">Vos évènements crées</h2>
          
          {events.length === 0 ? (
            <p className="text-primary/60 text-center text-sm">Aucun évènement créé</p>
          ) : (
            <div className="flex flex-col gap-3">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="bg-card border-2 border-primary rounded-2xl p-4 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <h3 className="text-primary font-medium">{event.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-primary/70 text-sm">
                      <Calendar size={14} />
                      <span>Crée le {new Date(event.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEventToDelete(event.id);
                      setShowDeleteEventModal(true);
                    }}
                    className="text-destructive p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delete Account Link */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setShowDeleteAccountModal(true)}
            className="text-destructive text-sm underline"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Floating Add Button */}
      <div className="fixed bottom-6 left-4 right-4 max-w-[700px] mx-auto">
        <Button
          onClick={() => navigate("/creer-evenement")}
          className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
          </svg>
          Créer un évènement
        </Button>
      </div>

      {/* Modals */}
      <ConfirmModal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Se déconnecter"
        description="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmText="Se déconnecter"
        cancelText="Annuler"
        onConfirm={handleLogout}
      />

      <ConfirmModal
        open={showDeleteAccountModal}
        onOpenChange={setShowDeleteAccountModal}
        title="Supprimer le compte"
        description="Cette action est irréversible. Toutes vos données seront supprimées définitivement."
        confirmText="Supprimer mon compte"
        cancelText="Annuler"
        onConfirm={handleDeleteAccount}
        variant="destructive"
      />

      <ConfirmModal
        open={showDeleteEventModal}
        onOpenChange={setShowDeleteEventModal}
        title="Supprimer l'évènement"
        description="Êtes-vous sûr de vouloir supprimer cet évènement ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteEvent}
        variant="destructive"
      />
    </div>
  );
};

export default Compte;
