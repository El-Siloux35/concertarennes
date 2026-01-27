import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

type PeriodFilter = "all" | "today" | "week" | "weekend" | "past";
type StyleFilter = "all" | "concert" | "projection" | "exposition" | "autres";
type VenueFilter = "bars" | "ombres-electriques" | "autres";

interface FilterPillsProps {
  onFilterChange: (periodFilter: PeriodFilter, styleFilters: StyleFilter[], venueFilters: string[]) => void;
  counts: {
    all: number;
    today: number;
    week: number;
    weekend: number;
    past: number;
    concert: number;
    projection: number;
    exposition: number;
    autres: number;
    bars: number;
    "ombres-electriques": number;
    autresVenue: number;
  };
}

const FilterPills = ({ onFilterChange, counts }: FilterPillsProps) => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [styleFilters, setStyleFilters] = useState<StyleFilter[]>([]);
  const [venueFilters, setVenueFilters] = useState<VenueFilter[]>([]);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);
  const [venueOpen, setVenueOpen] = useState(false);
  const isMobile = useIsMobile();

  const handlePeriodChange = (filter: PeriodFilter) => {
    setPeriodFilter(filter);
    onFilterChange(filter, styleFilters, venueFilters);
    setPeriodOpen(false);
  };

  const handleStyleToggle = (filter: StyleFilter) => {
    let newFilters: StyleFilter[];
    if (filter === "all") {
      newFilters = [];
    } else if (styleFilters.includes(filter)) {
      newFilters = styleFilters.filter(s => s !== filter);
    } else {
      newFilters = [...styleFilters, filter];
    }
    setStyleFilters(newFilters);
    onFilterChange(periodFilter, newFilters, venueFilters);
  };

  const handleVenueToggle = (venue: VenueFilter) => {
    let newFilters: VenueFilter[];
    if (venueFilters.includes(venue)) {
      newFilters = venueFilters.filter(v => v !== venue);
    } else {
      newFilters = [...venueFilters, venue];
    }
    setVenueFilters(newFilters);
    onFilterChange(periodFilter, styleFilters, newFilters);
  };

  const handleAllClick = () => {
    setPeriodFilter("all");
    setStyleFilters([]);
    setVenueFilters([]);
    onFilterChange("all", [], []);
  };

  const periodOptions: { key: PeriodFilter; label: string }[] = [
    { key: "today", label: "Aujourd'hui" },
    { key: "week", label: "Cette semaine" },
    { key: "weekend", label: "Ce week-end" },
    { key: "past", label: "Évènements passés" },
  ];

  const styleOptions: { key: StyleFilter; label: string }[] = [
    { key: "concert", label: "Concerts" },
    { key: "projection", label: "Projection" },
    { key: "exposition", label: "Exposition" },
    { key: "autres", label: "Autres" },
  ];

  const venueOptions: { key: VenueFilter; label: string }[] = [
    { key: "bars", label: "Bars" },
    { key: "ombres-electriques", label: "Ombres Électriques" },
    { key: "autres", label: "Autres" },
  ];

  const getPeriodLabel = () => {
    if (periodFilter === "all") return "Période";
    return periodOptions.find((o) => o.key === periodFilter)?.label || "Période";
  };

  const getStyleLabel = () => {
    if (styleFilters.length === 0) return "Style";
    if (styleFilters.length === 1) {
      return styleOptions.find((o) => o.key === styleFilters[0])?.label || "Style";
    }
    return `${styleFilters.length} styles`;
  };

  const getVenueLabel = () => {
    if (venueFilters.length === 0) return "Lieux";
    if (venueFilters.length === 1) {
      return venueOptions.find((o) => o.key === venueFilters[0])?.label || "Lieux";
    }
    return `${venueFilters.length} lieux`;
  };

  const isAllActive = periodFilter === "all" && styleFilters.length === 0 && venueFilters.length === 0;

  const getPeriodCount = (period: PeriodFilter) => {
    return counts[period] || 0;
  };

  const getVenueCount = (venue: VenueFilter) => {
    if (venue === "autres") return counts.autresVenue;
    return counts[venue] || 0;
  };

  const getStyleCount = (style: StyleFilter) => {
    if (style === "all") return counts.all;
    return counts[style] || 0;
  };

  const handleClearPeriod = () => {
    setPeriodFilter("all");
    onFilterChange("all", styleFilters, venueFilters);
    setPeriodOpen(false);
  };

  const handleClearStyles = () => {
    setStyleFilters([]);
    onFilterChange(periodFilter, [], venueFilters);
  };

  const handleClearVenues = () => {
    setVenueFilters([]);
    onFilterChange(periodFilter, styleFilters, []);
  };

  // Period filter content (shared between drawer and popover)
  const PeriodContent = () => (
    <div className="flex flex-col gap-1">
      {periodOptions.map((option) => (
        <button
          key={option.key}
          onClick={() => handlePeriodChange(option.key)}
          className={`text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center justify-between ${
            periodFilter === option.key
              ? "bg-primary text-primary-foreground"
              : "text-primary hover:bg-primary/10"
          }`}
        >
          <span>{option.label}</span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            periodFilter === option.key
              ? "bg-primary-foreground/20 text-primary-foreground"
              : "bg-accent text-accent-foreground"
          }`}>
            {getPeriodCount(option.key)}
          </span>
        </button>
      ))}
      <button
        onClick={handleClearPeriod}
        className={`text-left px-3 py-3 rounded-lg text-sm transition-colors mt-2 border-t border-primary/10 pt-4 ${
          periodFilter !== "all"
            ? "text-primary/60 hover:text-primary hover:bg-primary/5"
            : "invisible"
        }`}
      >
        Effacer le filtre
      </button>
    </div>
  );

  // Style filter content (shared between drawer and popover)
  const StyleContent = () => (
    <div className="flex flex-col gap-1">
      {styleOptions.map((option) => {
        const isSelected = styleFilters.includes(option.key);
        return (
          <button
            key={option.key}
            onClick={() => handleStyleToggle(option.key)}
            className={`text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center justify-between ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "text-primary hover:bg-primary/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected
                  ? "bg-primary-foreground border-primary-foreground"
                  : "border-primary"
              }`}>
                {isSelected && <Check size={14} className="text-primary" />}
              </div>
              <span>{option.label}</span>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isSelected
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-accent text-accent-foreground"
            }`}>
              {getStyleCount(option.key)}
            </span>
          </button>
        );
      })}
      <button
        onClick={handleClearStyles}
        className={`text-left px-3 py-3 rounded-lg text-sm transition-colors mt-2 border-t border-primary/10 pt-4 ${
          styleFilters.length > 0
            ? "text-primary/60 hover:text-primary hover:bg-primary/5"
            : "invisible"
        }`}
      >
        Effacer le filtre
      </button>
    </div>
  );

  // Venue filter content
  const VenueContent = () => (
    <div className="flex flex-col gap-1">
      {venueOptions.map((option) => {
        const isSelected = venueFilters.includes(option.key);
        return (
          <button
            key={option.key}
            onClick={() => handleVenueToggle(option.key)}
            className={`text-left px-3 py-3 rounded-lg text-sm transition-colors flex items-center justify-between ${
              isSelected
                ? "bg-primary text-primary-foreground"
                : "text-primary hover:bg-primary/10"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                isSelected
                  ? "bg-primary-foreground border-primary-foreground"
                  : "border-primary"
              }`}>
                {isSelected && <Check size={14} className="text-primary" />}
              </div>
              <span>{option.label}</span>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              isSelected
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-accent text-accent-foreground"
            }`}>
              {getVenueCount(option.key)}
            </span>
          </button>
        );
      })}
      <button
        onClick={handleClearVenues}
        className={`text-left px-3 py-3 rounded-lg text-sm transition-colors mt-2 border-t border-primary/10 pt-4 ${
          venueFilters.length > 0
            ? "text-primary/60 hover:text-primary hover:bg-primary/5"
            : "invisible"
        }`}
      >
        Effacer le filtre
      </button>
    </div>
  );

  return (
    <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] relative z-[100]" style={{ transform: 'translateZ(0)' }}>
      <div className="flex gap-2 px-4 w-max" style={{ touchAction: 'manipulation' }}>
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

        {/* Période - Drawer on mobile, Popover on desktop */}
        {isMobile ? (
          <Drawer open={periodOpen} onOpenChange={setPeriodOpen}>
            <DrawerTrigger asChild>
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
            </DrawerTrigger>
            <DrawerContent className="bg-background border-t-2 border-primary">
              <DrawerHeader>
                <DrawerTitle className="text-primary">Période</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8">
                <PeriodContent />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
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
            <PopoverContent className="w-56 p-2 bg-background border-2 border-primary z-50" align="start">
              <PeriodContent />
            </PopoverContent>
          </Popover>
        )}

        {/* Style - Drawer on mobile, Popover on desktop */}
        {isMobile ? (
          <Drawer open={styleOpen} onOpenChange={setStyleOpen}>
            <DrawerTrigger asChild>
              <button
                className={`flex items-center gap-1.5 pl-4 pr-3 h-[46px] rounded-full text-sm whitespace-nowrap transition-all ${
                  styleFilters.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-primary text-primary bg-transparent"
                }`}
              >
                {getStyleLabel()}
                <ChevronDown size={16} className="ml-1" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-background border-t-2 border-primary">
              <DrawerHeader>
                <DrawerTitle className="text-primary">Style</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8">
                <StyleContent />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Popover open={styleOpen} onOpenChange={setStyleOpen}>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1.5 pl-4 pr-3 h-[46px] rounded-full text-sm whitespace-nowrap transition-all ${
                  styleFilters.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-primary text-primary bg-transparent"
                }`}
              >
                {getStyleLabel()}
                <ChevronDown size={16} className="ml-1" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-background border-2 border-primary z-50" align="start">
              <StyleContent />
            </PopoverContent>
          </Popover>
        )}

        {/* Lieux - Drawer on mobile, Popover on desktop */}
        {isMobile ? (
          <Drawer open={venueOpen} onOpenChange={setVenueOpen}>
            <DrawerTrigger asChild>
              <button
                className={`flex items-center gap-1.5 pl-4 pr-3 h-[46px] rounded-full text-sm whitespace-nowrap transition-all ${
                  venueFilters.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-primary text-primary bg-transparent"
                }`}
              >
                {getVenueLabel()}
                <ChevronDown size={16} className="ml-1" />
              </button>
            </DrawerTrigger>
            <DrawerContent className="bg-background border-t-2 border-primary">
              <DrawerHeader>
                <DrawerTitle className="text-primary">Lieux</DrawerTitle>
              </DrawerHeader>
              <div className="px-4 pb-8">
                <VenueContent />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Popover open={venueOpen} onOpenChange={setVenueOpen}>
            <PopoverTrigger asChild>
              <button
                className={`flex items-center gap-1.5 pl-4 pr-3 h-[46px] rounded-full text-sm whitespace-nowrap transition-all ${
                  venueFilters.length > 0
                    ? "bg-primary text-primary-foreground"
                    : "border-2 border-primary text-primary bg-transparent"
                }`}
              >
                {getVenueLabel()}
                <ChevronDown size={16} className="ml-1" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 bg-background border-2 border-primary z-50" align="start">
              <VenueContent />
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};

export default FilterPills;
