import { useState } from "react";

type FilterType = "all" | "today" | "week" | "weekend";

interface FilterPillsProps {
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    today: number;
    week: number;
    weekend: number;
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
    { key: "weekend", label: "Week-end" },
  ];

  return (
    <div className="flex gap-2 px-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {filters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => handleFilterClick(filter.key)}
          className={`flex items-center gap-1.5 pl-4 pr-3 h-[46px] rounded-full text-sm whitespace-nowrap transition-all ${
            activeFilter === filter.key
              ? "bg-primary text-primary-foreground"
              : "border-2 border-primary text-primary bg-transparent"
          }`}
        >
          {filter.label}
          <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-accent text-accent-foreground">
            {counts[filter.key]}
          </span>
        </button>
      ))}
    </div>
  );
};

export default FilterPills;
