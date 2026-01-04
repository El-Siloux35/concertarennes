import { Check } from "lucide-react";

type StyleOption = "concert" | "projection" | "exposition" | "autres";

interface StyleSelectorProps {
  value: StyleOption | null;
  onChange: (style: StyleOption) => void;
}

const StyleSelector = ({ value, onChange }: StyleSelectorProps) => {
  const options: { key: StyleOption; label: string }[] = [
    { key: "concert", label: "Concert" },
    { key: "projection", label: "Projection" },
    { key: "exposition", label: "Exposition" },
    { key: "autres", label: "Autres" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <span className="text-primary text-sm font-medium">Type d'évènement</span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onChange(option.key)}
            className={`h-10 px-4 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              value === option.key
                ? "bg-primary text-primary-foreground"
                : "border-2 border-primary text-primary bg-transparent"
            }`}
          >
            {value === option.key && <Check size={16} />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
