import { Check } from "lucide-react";

type StyleOption = "concert" | "projection" | "exposition" | "autres";

interface StyleSelectorProps {
  value: StyleOption[] | StyleOption | null;
  onChange: (styles: StyleOption[]) => void;
  maxSelection?: number;
}

const StyleSelector = ({ value, onChange, maxSelection = 3 }: StyleSelectorProps) => {
  const options: { key: StyleOption; label: string }[] = [
    { key: "concert", label: "Concert" },
    { key: "projection", label: "Projection" },
    { key: "exposition", label: "Exposition" },
    { key: "autres", label: "Autres" },
  ];

  // Normalize value to array
  const selectedStyles: StyleOption[] = Array.isArray(value) 
    ? value 
    : value 
      ? [value] 
      : [];

  const toggleStyle = (style: StyleOption) => {
    if (selectedStyles.includes(style)) {
      // Remove style
      onChange(selectedStyles.filter(s => s !== style));
    } else {
      // Add style if under max
      if (selectedStyles.length < maxSelection) {
        onChange([...selectedStyles, style]);
      }
    }
  };

  const isSelected = (style: StyleOption) => selectedStyles.includes(style);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-primary text-sm font-medium">
        Type d'évènement ({selectedStyles.length}/{maxSelection} max)
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => toggleStyle(option.key)}
            className={`h-10 px-4 rounded-full text-sm font-medium flex items-center gap-2 transition-all ${
              isSelected(option.key)
                ? "bg-concert-purple-light text-primary border-2 border-primary"
                : "border-2 border-primary text-primary bg-transparent"
            }`}
          >
            {isSelected(option.key) && <Check size={16} />}
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default StyleSelector;
