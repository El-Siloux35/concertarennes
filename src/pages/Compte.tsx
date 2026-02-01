import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Pencil, Calendar, Trash2, Check, LogOut, Plus, Camera, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import ConfirmModal from "@/components/ConfirmModal";
import EventEmptyState from "@/components/EventEmptyState";
import { useToast } from "@/hooks/use-toast";
import Footer from "@/components/Footer";
interface Profile {
  id: string;
  pseudo: string | null;
  avatar_url: string | null;
}
interface Event {
  id: string;
  title: string;
  date: string;
  created_at: string;
  is_draft: boolean;
}
const Compte = () => {
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past" | "drafts">("upcoming");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [showDeleteEventModal, setShowDeleteEventModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isEditingPseudo, setIsEditingPseudo] = useState(false);
  const [newPseudo, setNewPseudo] = useState("");
  const today = new Date().toISOString().split('T')[0];
  const publishedEvents = events.filter(e => !e.is_draft);
  const upcomingEvents = publishedEvents.filter(e => e.date >= today);
  const pastEvents = publishedEvents.filter(e => e.date < today);
  const draftEvents = events.filter(e => e.is_draft);
  useEffect(() => {
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
    });
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
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
    const {
      data,
      error
    } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
    if (error) {
      console.error("Error fetching profile:", error);
    }
    setProfile(data);
    setLoading(false);
  };
  const fetchEvents = async () => {
    if (!user) return;
    const {
      data,
      error
    } = await supabase.from("events").select("id, title, date, created_at, is_draft").eq("user_id", user.id).order("date", {
      ascending: false
    });
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
    const {
      error: uploadError
    } = await supabase.storage.from("avatars").upload(filePath, file);
    if (uploadError) {
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'image",
        variant: "destructive"
      });
      return;
    }
    const {
      data: {
        publicUrl
      }
    } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const {
      error: updateError
    } = await supabase.from("profiles").update({
      avatar_url: publicUrl
    }).eq("id", user.id);
    if (updateError) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
      return;
    }
    setProfile(prev => prev ? {
      ...prev,
      avatar_url: publicUrl
    } : null);
    // Notify other components that profile has been updated
    window.dispatchEvent(new Event('profileUpdated'));
    toast({
      title: "Succès",
      description: "Photo de profil mise à jour"
    });
  };
  const handleStartEditPseudo = () => {
    setNewPseudo(profile?.pseudo || "");
    setIsEditingPseudo(true);
  };
  const handleSavePseudo = async () => {
    if (!user || !newPseudo.trim()) {
      toast({
        title: "Erreur",
        description: "Le pseudo ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }
    const {
      error
    } = await supabase.from("profiles").update({
      pseudo: newPseudo.trim()
    }).eq("id", user.id);
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le pseudo",
        variant: "destructive"
      });
      return;
    }
    setProfile(prev => prev ? {
      ...prev,
      pseudo: newPseudo.trim()
    } : null);
    setIsEditingPseudo(false);
    // Notify other components that profile has been updated
    window.dispatchEvent(new Event('profileUpdated'));
    toast({
      title: "Succès",
      description: "Pseudo mis à jour"
    });
  };
  const handleCancelEditPseudo = () => {
    setIsEditingPseudo(false);
    setNewPseudo("");
  };
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/home");
  };
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    // Call the edge function to properly delete the auth user
    // This cascades to profiles, user_roles, and events
    const { error } = await supabase.functions.invoke("delete-account");
    
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le compte",
        variant: "destructive"
      });
      return;
    }
    
    await supabase.auth.signOut();
    navigate("/home");
    toast({
      title: "Compte supprimé",
      description: "Votre compte a été supprimé avec succès"
    });
  };
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    const {
      error
    } = await supabase.from("events").delete().eq("id", eventToDelete);
    if (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'évènement",
        variant: "destructive"
      });
      return;
    }
    setEvents(prev => prev.filter(e => e.id !== eventToDelete));
    setEventToDelete(null);
    toast({
      title: "Succès",
      description: "Évènement supprimé"
    });
  };
  const handleClose = () => {
    navigate("/home");
  };
  const displayName = profile?.pseudo || user?.user_metadata?.pseudo || user?.email?.split("@")[0] || "Utilisateur";
  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">Chargement...</div>
      </div>;
  }
  return <div className="fixed inset-0 bg-background flex flex-col animate-slide-up-full z-50 overflow-y-auto">
      <div className="max-w-[900px] mx-auto flex-1 flex flex-col w-full pt-[env(safe-area-inset-top)]">
        {/* Header with close button */}
        <header className="pt-4 pl-4 pb-4">
          <button onClick={handleClose} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center" aria-label="Fermer">
            <X size={24} className="text-primary-foreground" />
          </button>
        </header>

        <div className="px-6">

        {/* Avatar */}
        <div className="flex flex-col items-center mt-6">
          <div className="relative">
            <Avatar className="w-40 h-40 border-4 border-card">
              <AvatarImage 
                src={profile?.avatar_url || undefined} 
                alt={displayName} 
                className="object-cover"
              />
              <AvatarFallback className="bg-card text-primary text-4xl">
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button onClick={handleAvatarClick} className="absolute bottom-0 right-0 w-11 h-11 rounded-full bg-primary flex items-center justify-center" aria-label="Changer la photo">
              <Camera size={20} className="text-primary-foreground" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          
          {/* Pseudo with edit */}
          {isEditingPseudo ? <div className="flex items-center gap-2 mt-4">
              <Input type="text" value={newPseudo} onChange={e => setNewPseudo(e.target.value)} className="h-10 w-40 rounded-[8px] border-2 border-primary bg-transparent text-primary text-center focus-visible:ring-0 focus-visible:ring-offset-0" autoFocus />
              <button onClick={handleSavePseudo} className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Check size={14} className="text-primary-foreground" />
              </button>
              <button onClick={handleCancelEditPseudo} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                <X size={14} className="text-primary" />
              </button>
            </div> : <div className="flex items-center gap-2 mt-4">
              <p className="text-primary font-medium text-lg">[{displayName}]</p>
              <button onClick={handleStartEditPseudo} className="text-primary/60">
                <Pencil size={14} />
              </button>
            </div>}
        </div>


        {/* Create Event Button - above events */}
        <div className="mt-8 mb-6">
          <Button onClick={() => navigate("/creer-evenement")} className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2">
            <Plus size={20} strokeWidth={2} />
            Créer un évènement
          </Button>
        </div>

        {/* Events Section */}
        <div>
          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-4 flex-wrap">
            <button onClick={() => setActiveTab("upcoming")} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "upcoming" ? "bg-primary text-primary-foreground" : "border-2 border-primary text-primary bg-transparent"}`}>
              À venir ({upcomingEvents.length})
            </button>
            <button onClick={() => setActiveTab("past")} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "past" ? "bg-primary text-primary-foreground" : "border-2 border-primary text-primary bg-transparent"}`}>
              Passés ({pastEvents.length})
            </button>
            <button onClick={() => setActiveTab("drafts")} className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${activeTab === "drafts" ? "bg-primary text-primary-foreground" : "border-2 border-primary text-primary bg-transparent"}`}>
              Brouillons ({draftEvents.length})
            </button>
          </div>
          
          {activeTab === "upcoming" ? upcomingEvents.length === 0 ? <EventEmptyState /> : <div className="flex flex-col gap-3">
                {upcomingEvents.map(event => <div key={event.id} className="bg-card border-2 border-primary rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-primary font-medium">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-primary/70 text-sm">
                          <Calendar size={14} />
                          <span>{new Date(event.date).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                      <Button onClick={() => navigate(`/modifier-evenement/${event.id}?from=profile`)} variant="outline" className="w-10 h-10 rounded-full border-2 border-primary text-primary bg-transparent p-0" aria-label="Modifier">
                        <Pencil size={16} />
                      </Button>
                      <Button onClick={() => {
                setEventToDelete(event.id);
                setShowDeleteEventModal(true);
              }} variant="outline" className="w-10 h-10 rounded-full border-2 border-destructive text-destructive bg-transparent p-0" aria-label="Supprimer">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>)}
              </div> : activeTab === "past" ? pastEvents.length === 0 ? <div className="text-center py-8 text-primary/60">
                Aucun évènement passé
              </div> : <div className="flex flex-col gap-3">
                {pastEvents.map(event => <div key={event.id} className="bg-card border-2 border-primary/50 rounded-2xl p-4 opacity-70">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-primary font-medium">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-primary/70 text-sm">
                          <Calendar size={14} />
                          <span>{new Date(event.date).toLocaleDateString("fr-FR")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                      <Button onClick={() => {
                setEventToDelete(event.id);
                setShowDeleteEventModal(true);
              }} variant="outline" className="w-10 h-10 rounded-full border-2 border-destructive text-destructive bg-transparent p-0" aria-label="Supprimer">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>)}
              </div> : draftEvents.length === 0 ? <div className="text-center py-8 text-primary/60">
                Aucun brouillon
              </div> : <div className="flex flex-col gap-3">
                {draftEvents.map(event => <div key={event.id} className="bg-card border-2 border-dashed border-primary rounded-2xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-primary font-medium">{event.title || "Sans titre"}</h3>
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">Brouillon</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-primary/70 text-sm">
                          <Calendar size={14} />
                          <span>{event.date ? new Date(event.date).toLocaleDateString("fr-FR") : "Date non définie"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 justify-end">
                      <Button onClick={() => navigate(`/modifier-evenement/${event.id}?from=profile`)} variant="outline" className="w-10 h-10 rounded-full border-2 border-primary text-primary bg-transparent p-0" aria-label="Modifier">
                        <Pencil size={16} />
                      </Button>
                      <Button onClick={() => {
                setEventToDelete(event.id);
                setShowDeleteEventModal(true);
              }} variant="outline" className="w-10 h-10 rounded-full border-2 border-destructive text-destructive bg-transparent p-0" aria-label="Supprimer">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>)}
              </div>}
        </div>

        {/* Logout Button */}
        <div className="mt-12 flex justify-center">
          <Button onClick={() => setShowLogoutModal(true)} variant="outline" className="rounded-full h-10 px-6 border-2 border-primary text-primary bg-transparent font-medium flex items-center gap-2">
            <LogOut size={16} />
            Déconnexion
          </Button>
        </div>

        {/* Delete Account Link */}
        <div className="mt-8 text-center">
          <button onClick={() => setShowDeleteAccountModal(true)} className="text-destructive text-sm underline">
            Supprimer mon compte
          </button>
        </div>

        <Footer />
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal open={showLogoutModal} onOpenChange={setShowLogoutModal} title="Se déconnecter" description="Est-tu sûre de vouloir quitter ce monde de fou ?" confirmText="Se déconnecter" cancelText="Annuler" onConfirm={handleLogout} />

      <ConfirmModal open={showDeleteAccountModal} onOpenChange={setShowDeleteAccountModal} title="Supprimer le compte" description="Cette action est irréversible. Toutes vos données seront supprimées définitivement." confirmText="Supprimer mon compte" cancelText="Annuler" onConfirm={handleDeleteAccount} variant="destructive" />

      <ConfirmModal open={showDeleteEventModal} onOpenChange={setShowDeleteEventModal} title="Supprimer l'évènement" description="Êtes-vous sûr de vouloir supprimer cet évènement ?" confirmText="Supprimer" cancelText="Annuler" onConfirm={handleDeleteEvent} variant="destructive" />
    </div>;
};
export default Compte;