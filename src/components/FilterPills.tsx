import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type PeriodFilter = "all" | "today" | "week" | "weekend";
type StyleFilter = "all" | "concert" | "projection" | "exposition" | "autres";

interface FilterPillsProps {
  onFilterChange: (periodFilter: PeriodFilter, styleFilter: StyleFilter) => void;
  counts: {
    all: number;
    today: number;
    week: number;
    weekend: number;
  };
}

const FilterPills = ({ onFilterChange, counts }: FilterPillsProps) => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("all");
  const [periodOpen, setPeriodOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

  const handlePeriodChange = (filter: PeriodFilter) => {
    setPeriodFilter(filter);
    onFilterChange(filter, styleFilter);
    setPeriodOpen(false);
  };

  const handleStyleChange = (filter: StyleFilter) => {
    setStyleFilter(filter);
    onFilterChange(periodFilter, filter);
    setStyleOpen(false);
  };

  const handleAllClick = () => {
    setPeriodFilter("all");
    setStyleFilter("all");
    onFilterChange("all", "all");
  };

  const periodOptions: { key: PeriodFilter; label: string }[] = [
    { key: "today", label: "Aujourd'hui" },
    { key: "week", label: "Cette semaine" },
    { key: "weekend", label: "Ce week-end" },
  ];

  const styleOptions: { key: StyleFilter; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "concert", label: "Concerts" },
    { key: "projection", label: "Projection" },
    { key: "exposition", label: "Exposition" },
    { key: "autres", label: "Autres" },
  ];

  const getPeriodLabel = () => {
    if (periodFilter === "all") return "Période";
    return periodOptions.find((o) => o.key === periodFilter)?.label || "Période";
  };

  const getStyleLabel = () => {
    if (styleFilter === "all") return "Style";
    return styleOptions.find((o) => o.key === styleFilter)?.label || "Style";
  };

  const isAllActive = periodFilter === "all" && styleFilter === "all";

  return (
    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="flex gap-2 px-4 w-max">
        {/* Tout button */}
        <button
          onClick={handleAllClick}
          className={`flex items-center gap-1.5 pl-4 pr-3 h-[46px] rounded-full text-sm whitespace-nowrap transition-all ${
            isAllActive
              ? "bg-primary text-primary-foreground"
              : "border-2 border-primary text-primary bg-transparent"
          }`}
        >
          Tout
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
            {counts.all}
          </span>
        </button>

        {/* Période dropdown */}
        <Popover open={periodOpen} onOpenChange={setPeriodOpen}>
          <PopoverTrigger asChild>
            <button
              className={`flex items-center gap-1.5 pl-4 pr-3 h-[46px] rounded-full text-sm whitespace-nowrap transition-all ${
                periodFilter !== "all"
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-primary text-primary bg-transparent"
              }`}
            >
              {getPeriodLabel()}
              <ChevronDown size={16} className="ml-1" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-background border-2 border-primary z-50" align="start">
            <div className="flex flex-col gap-1">
              {periodOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handlePeriodChange(option.key)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    periodFilter === option.key
                      ? "bg-primary text-primary-foreground"
                      : "text-primary hover:bg-primary/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Style dropdown */}
        <Popover open={styleOpen} onOpenChange={setStyleOpen}>
          <PopoverTrigger asChild>
            <button
              className={`flex items-center gap-1.5 pl-4 pr-3 h-[46px] rounded-full text-sm whitespace-nowrap transition-all ${
                styleFilter !== "all"
                  ? "bg-primary text-primary-foreground"
                  : "border-2 border-primary text-primary bg-transparent"
              }`}
            >
              {getStyleLabel()}
              <ChevronDown size={16} className="ml-1" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2 bg-background border-2 border-primary z-50" align="start">
            <div className="flex flex-col gap-1">
              {styleOptions.map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleStyleChange(option.key)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    styleFilter === option.key
                      ? "bg-primary text-primary-foreground"
                      : "text-primary hover:bg-primary/10"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default FilterPills;
