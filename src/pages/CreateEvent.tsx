import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
import StyleSelector from "@/components/StyleSelector";
import VenueSelector from "@/components/VenueSelector";

type StyleOption = "concert" | "projection" | "exposition" | "autres";
type VenueOption = "bars" | "ombres-electriques" | "autres";

const CreateEvent = () => {
  const navigate = useNavigate();
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

      const { error } = await supabase
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
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Succès",
        description: isDraft ? "Brouillon enregistré" : "Évènement créé avec succès",
      });

      navigate("/compte");
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'évènement",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-40">
      <div className="max-w-[900px] mx-auto px-4">
        {/* Header */}
        <header className="py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-primary flex items-center justify-center"
            aria-label="Fermer"
          >
            <X size={24} className="text-primary-foreground" />
          </button>
          <h1 className="text-primary font-semibold text-xl">Ajouter un évènement</h1>
          <div className="w-12" /> {/* Spacer for centering */}
        </header>

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
  );
};

export default CreateEvent;
