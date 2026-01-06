import { Check } from "lucide-react";

type VenueOption = "bars" | "ombres-electriques" | "autres";

interface VenueSelectorProps {
  value: VenueOption | null;
  onChange: (value: VenueOption | null) => void;
}

const venueOptions: { key: VenueOption; label: string }[] = [
  { key: "bars", label: "Bars" },
  { key: "ombres-electriques", label: "Ombres Électriques" },
  { key: "autres", label: "Autres" },
];

const VenueSelector = ({ value, onChange }: VenueSelectorProps) => {
  const handleToggle = (option: VenueOption) => {
    if (value === option) {
      onChange(null);
    } else {
      onChange(option);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-primary text-sm font-medium">Type de lieu</span>
      <div className="flex flex-wrap gap-2">
        {venueOptions.map((option) => {
          const isSelected = value === option.key;
          return (
            <button
              key={option.key}
              type="button"
              onClick={() => handleToggle(option.key)}
              className={`h-10 px-4 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
                isSelected
                  ? "bg-concert-purple-light text-primary border-2 border-primary"
                  : "border-2 border-primary text-primary bg-transparent"
              }`}
            >
              {isSelected && <Check size={16} />}
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VenueSelector;
