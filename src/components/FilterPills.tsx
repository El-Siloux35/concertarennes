import { useState } from "react";

type FilterType = "all" | "today" | "week";

interface FilterPillsProps {
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    today: number;
    week: number;
  };
}

const FilterPills = ({ onFilterChange, counts }: FilterPillsProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tout" },
    { key: "today", label: "Aujourd'hui" },
    { key: "week", label: "Semaine" },
  ];

  return (
    <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => handleFilterClick(filter.key)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-mono text-sm whitespace-nowrap transition-all ${
            activeFilter === filter.key
              ? "bg-primary text-primary-foreground"
              : "border-2 border-dashed border-primary text-primary bg-transparent hover:bg-secondary"
          }`}
        >
          {filter.label}
          <span
            className={`text-xs px-1.5 py-0.5 rounded-full ${
              activeFilter === filter.key
                ? "bg-accent text-accent-foreground"
                : "bg-accent text-accent-foreground"
            }`}
          >
            {counts[filter.key]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterPills;
