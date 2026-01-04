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
const FilterPills = ({
  onFilterChange,
  counts
}: FilterPillsProps) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const handleFilterClick = (filter: FilterType) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };
  const filters: {
    key: FilterType;
    label: string;
  }[] = [{
    key: "all",
    label: "Tout"
  }, {
    key: "today",
    label: "Aujourd'hui"
  }, {
    key: "week",
    label: "Semaine"
  }, {
    key: "weekend",
    label: "Week-end"
  }];
  return;
};
export default FilterPills;