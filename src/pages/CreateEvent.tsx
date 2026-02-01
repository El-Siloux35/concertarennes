import { useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Upload, MapPin, CircleDollarSign, Calendar, Smartphone, Send, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { resizeImage } from "@/lib/imageUtils";
import { notifyNewEvent } from "@/lib/pushNotifications";
import StyleSelector from "@/components/StyleSelector";
import VenueSelector from "@/components/VenueSelector";

type StyleOption = "concert" | "projection" | "exposition" | "autres";
type VenueOption = "bars" | "ombres-electriques" | "autres";

// Input validation constants
const MAX_LENGTHS = {
  title: 200,
  description: 5000,
  organizer: 200,
  location: 300,
  price: 100,
  contact: 50,
};

const validatePhone = (phone: string) => /^[0-9\s\+\-\(\)]*$/.test(phone);

const CreateEvent = () => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  const [organizer, setOrganizer] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [venueType, setVenueType] = useState<VenueOption | null>(null);
  const [price, setPrice] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [contact, setContact] = useState("");
  const [styles, setStyles] = useState<StyleOption[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (isDraft: boolean = false) => {
    // For drafts, only require organizer name
    if (!isDraft && (!organizer.trim() || !name.trim() || !location.trim() || !date)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (isDraft && !name.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez au moins donner un nom à l'évènement",
        variant: "destructive",
      });
      return;
    }

    // Validate field lengths
    if (name.length > MAX_LENGTHS.title) {
      toast({ title: "Erreur", description: `Le nom est trop long (max ${MAX_LENGTHS.title} caractères)`, variant: "destructive" });
      return;
    }
    if (description.length > MAX_LENGTHS.description) {
      toast({ title: "Erreur", description: `La description est trop longue (max ${MAX_LENGTHS.description} caractères)`, variant: "destructive" });
      return;
    }
    if (organizer.length > MAX_LENGTHS.organizer) {
      toast({ title: "Erreur", description: `Le nom de l'organisateur est trop long (max ${MAX_LENGTHS.organizer} caractères)`, variant: "destructive" });
      return;
    }
    if (location.length > MAX_LENGTHS.location) {
      toast({ title: "Erreur", description: `L'adresse est trop longue (max ${MAX_LENGTHS.location} caractères)`, variant: "destructive" });
      return;
    }
    if (price.length > MAX_LENGTHS.price) {
      toast({ title: "Erreur", description: `Le prix est trop long (max ${MAX_LENGTHS.price} caractères)`, variant: "destructive" });
      return;
    }
    if (contact.length > MAX_LENGTHS.contact) {
      toast({ title: "Erreur", description: `Le contact est trop long (max ${MAX_LENGTHS.contact} caractères)`, variant: "destructive" });
      return;
    }
    if (contact && !validatePhone(contact)) {
      toast({ title: "Erreur", description: "Format de contact invalide (chiffres, espaces, +, -, (, ) uniquement)", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      let imageUrl = null;

      if (imageFile) {
        // Resize image before upload for better performance
        const resizedImage = await resizeImage(imageFile, 1200, 1200, 0.8);
        const filePath = `events/${user.id}/${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from("event-images")
          .upload(filePath, resizedImage);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("event-images")
            .getPublicUrl(filePath);
          imageUrl = publicUrl;
        }
      }

      const { error, data: insertedData } = await supabase
        .from("events")
        .insert({
          user_id: user.id,
          title: name.trim(),
          organizer: organizer.trim() || null,
          description: description.trim() || null,
          location: location.trim() || null,
          venue: venueType,
          price: price.trim() || null,
          date: date ? format(date, "yyyy-MM-dd") : new Date().toISOString().split('T')[0],
          contact: contact.trim() || null,
          image_url: imageUrl,
          style: styles.length > 0 ? styles.join(",") : null,
          is_draft: isDraft,
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création:', error);
        // Erreur de permission RLS
        if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('policy')) {
          throw new Error("Vous n'avez pas la permission de créer un évènement. Vérifiez que vous êtes bien connecté.");
        }
        throw new Error(error.message || "Impossible de créer l'évènement");
      }

      if (!insertedData) {
        throw new Error("La création a échoué - aucune donnée retournée");
      }

      // Send push notifications for published events (not drafts)
      if (!isDraft && insertedData.id) {
        notifyNewEvent({
          eventId: insertedData.id,
          eventTitle: name.trim(),
          eventLocation: location.trim() || undefined,
          eventDate: date ? format(date, "d MMMM yyyy", { locale: fr }) : undefined,
          eventPrice: price.trim() || undefined,
          eventImage: imageUrl || undefined,
          organizerName: organizer.trim() || undefined,
        });
      }

      toast({
        title: "Succès",
        description: isDraft ? "Brouillon enregistré" : "Évènement créé avec succès",
      });

      const fromCompte = (history.state as { from?: string })?.from === "compte";
      navigate(fromCompte ? "/compte" : "/home");
    } catch (error: any) {
      console.error("Error creating event:", error);
      const errorMessage = error?.message || error?.error_description || "Impossible de créer l'évènement";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fromCompte = (routerLocation.state as { from?: string })?.from === "compte";
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      navigate(fromCompte ? "/compte" : "/home");
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 bg-background flex flex-col z-50 overflow-y-auto ${
        isClosing ? "animate-slide-out-bottom" : "animate-slide-in-bottom"
      }`}
    >
      <div className="max-w-[900px] mx-auto flex-1 flex flex-col w-full pt-[env(safe-area-inset-top)] pb-40">
        {/* Header - same button as profile: w-10 h-10, X, pt-4 pl-4 */}
        <header className="pt-4 pl-4 pb-4">
          <button
            onClick={handleClose}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center"
            aria-label="Fermer"
          >
            <X size={24} className="text-primary-foreground" />
          </button>
        </header>

      <div className="max-w-[900px] mx-auto px-6 flex-1">

        {/* Image upload */}
        <div className="mt-4">
          <button
            onClick={handleImageClick}
            className="w-full h-[300px] border-2 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center gap-3 bg-transparent overflow-hidden"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <Upload size={32} strokeWidth={1.5} className="text-primary" />
                <span className="text-primary text-sm">ajouter une image</span>
              </>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Form fields */}
        <div className="mt-6 flex flex-col gap-4">
          <Input
            placeholder="Organisateur"
            value={organizer}
            onChange={(e) => setOrganizer(e.target.value)}
            className="h-14 rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 px-6"
          />

          <Input
            placeholder="Nom de l'évènement"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 px-6"
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[180px] rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 px-6 py-4 resize-none"
          />

          {/* Style selector - now supports multi-select */}
          <StyleSelector value={styles} onChange={setStyles} maxSelection={3} />

          {/* Venue type selector */}
          <VenueSelector value={venueType} onChange={setVenueType} />

          <div className="relative">
            <MapPin size={20} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
            <Input
              placeholder="Adresse / lieu"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="h-14 rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 pl-12 pr-4"
            />
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <CircleDollarSign size={20} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <Input
                placeholder="Prix"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-14 rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 pl-12 pr-4"
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <button className="h-14 px-6 rounded-2xl border-2 border-primary bg-transparent text-primary flex items-center gap-2 flex-[1.5]">
                  <Calendar size={20} strokeWidth={1.5} />
                  <span className="text-sm">
                    {date ? format(date, "dd/MM/yyyy") : "Date"}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-background border-2 border-primary" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={fr}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative">
            <Smartphone size={20} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
            <Input
              placeholder="Contact (optionnel)"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="h-14 rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 pl-12 pr-4"
            />
          </div>
        </div>

        {/* Submit buttons - floating */}
        <div className="fixed bottom-6 left-4 right-4 max-w-[900px] mx-auto flex flex-col gap-2">
          <Button
            onClick={() => handleSubmit(false)}
            disabled={isSubmitting}
            className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2"
          >
            <Send size={20} strokeWidth={2} />
            {isSubmitting ? "Création..." : "Publier l'évènement"}
          </Button>
          <Button
            onClick={() => handleSubmit(true)}
            disabled={isSubmitting}
            variant="secondary"
            className="w-full h-12 rounded-full font-medium flex items-center justify-center gap-2"
          >
            <Save size={18} strokeWidth={2} />
            Enregistrer en brouillon
          </Button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default CreateEvent;
