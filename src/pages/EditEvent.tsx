import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ChevronLeft, Upload, MapPin, CircleDollarSign, Calendar, Smartphone, Check, Send, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { resizeImage } from "@/lib/imageUtils";
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

const EditEvent = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const fromPage = searchParams.get("from");
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDraft, setIsDraft] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        toast({
          title: "Erreur",
          description: "Impossible de charger l'évènement",
          variant: "destructive",
        });
        navigate(-1);
        return;
      }

      setOrganizer(data.organizer || "");
      setName(data.title || "");
      setDescription(data.description || "");
      setLocation(data.location || "");
      setVenueType(data.venue as VenueOption | null);
      setPrice(data.price || "");
      setDate(data.date ? parseISO(data.date) : undefined);
      setContact(data.contact || "");
      // Parse styles from comma-separated string
      if (data.style) {
        const styleArray = data.style.split(",").map((s: string) => s.trim()).filter(Boolean) as StyleOption[];
        setStyles(styleArray);
      }
      setExistingImageUrl(data.image_url);
      setIsDraft(data.is_draft);
      setLoading(false);
    };

    fetchEvent();
  }, [id, navigate, toast]);

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

  const handleSubmit = async (saveAsDraft: boolean = false, publish: boolean = false) => {
    // For drafts, only require name
    if (!saveAsDraft && !publish) {
      // Regular save for non-draft
      if (!organizer.trim() || !name.trim() || !location.trim() || !date) {
        toast({
          title: "Erreur",
          description: "Veuillez remplir tous les champs obligatoires",
          variant: "destructive",
        });
        return;
      }
    }

    if (publish && (!organizer.trim() || !name.trim() || !location.trim() || !date)) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires pour publier",
        variant: "destructive",
      });
      return;
    }

    if (saveAsDraft && !name.trim()) {
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

      let imageUrl = existingImageUrl;

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

      const { error } = await supabase
        .from("events")
        .update({
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
          is_draft: saveAsDraft ? true : publish ? false : isDraft,
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      if (saveAsDraft) {
        toast({
          title: "Succès",
          description: "Brouillon enregistré",
        });
        navigate("/compte");
      } else if (publish) {
        toast({
          title: "Succès",
          description: "Évènement publié !",
        });
        navigate(`/concert/${id}`);
      } else {
        toast({
          title: "Succès",
          description: "Évènement modifié avec succès",
        });
        // Navigate based on origin
        if (fromPage === "profile") {
          navigate("/compte");
        } else {
          navigate(-1);
        }
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier l'évènement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Navigate based on origin
    if (fromPage === "profile") {
      navigate("/compte");
    } else {
      navigate(-1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary">Chargement...</div>
      </div>
    );
  }

  const displayImage = imagePreview || existingImageUrl;

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="max-w-[900px] mx-auto px-4">
        <header className="py-4 flex items-start">
          <button
            onClick={handleClose}
            className="flex items-center gap-2 text-primary"
            aria-label="Retour"
          >
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <ChevronLeft size={24} className="text-primary-foreground" />
            </div>
            <span className="font-medium">Retour</span>
          </button>
        </header>

        {/* Image upload */}
        <div className="mt-4">
          <button
            onClick={handleImageClick}
            className="w-full h-[300px] border-2 border-dashed border-primary rounded-2xl flex flex-col items-center justify-center gap-3 bg-transparent overflow-hidden"
          >
            {displayImage ? (
              <img
                src={displayImage}
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
            className="h-14 rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 px-4"
          />

          <Input
            placeholder="Nom de l'évènement"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-14 rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 px-4"
          />

          <Textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[180px] rounded-2xl border-2 border-primary bg-transparent text-primary placeholder:text-primary/50 px-4 py-4 resize-none"
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
                <button className="h-14 px-4 rounded-2xl border-2 border-primary bg-transparent text-primary flex items-center gap-2 flex-[1.5]">
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
          {isDraft ? (
            <>
              <Button
                onClick={() => handleSubmit(false, true)}
                disabled={isSubmitting}
                className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2"
              >
                <Send size={20} strokeWidth={2} />
                {isSubmitting ? "Publication..." : "Publier"}
              </Button>
              <Button
                onClick={() => handleSubmit(true, false)}
                disabled={isSubmitting}
                variant="secondary"
                className="w-full h-12 rounded-full font-medium flex items-center justify-center gap-2"
              >
                <Save size={18} strokeWidth={2} />
                Enregistrer le brouillon
              </Button>
            </>
          ) : (
            <Button
              onClick={() => handleSubmit(false, false)}
              disabled={isSubmitting}
              className="w-full h-14 rounded-full bg-accent text-accent-foreground font-medium flex items-center justify-center gap-2"
            >
              <Check size={20} strokeWidth={2} />
              {isSubmitting ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditEvent;
