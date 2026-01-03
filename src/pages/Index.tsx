import { useState, useMemo } from "react";
import Header from "../components/Header";
import FilterPills from "../components/FilterPills";
import ConcertList from "../components/ConcertList";
import FloatingAddButton from "../components/FloatingAddButton";

// Mock counts - will be replaced with real data from Supabase
const mockConcerts = [
  { id: "1", date: "2025-12-13" },
  { id: "2", date: "2025-01-04" },
  { id: "3", date: "2025-01-03" },
  { id: "4", date: "2025-01-05" },
];

const Index = () => {
  const [filter, setFilter] = useState<"all" | "today" | "week">("all");

  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    const todayCount = mockConcerts.filter((concert) => {
      const concertDate = new Date(concert.date);
      concertDate.setHours(0, 0, 0, 0);
      return concertDate.getTime() === today.getTime();
    }).length;

    const weekCount = mockConcerts.filter((concert) => {
      const concertDate = new Date(concert.date);
      return concertDate >= today && concertDate <= endOfWeek;
    }).length;

    return {
      all: mockConcerts.length,
      today: todayCount,
      week: weekCount,
    };
  }, []);

  const handleFilterChange = (newFilter: "all" | "today" | "week") => {
    setFilter(newFilter);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[700px] mx-auto">
        <Header />

        <main className="flex flex-col gap-4 pt-2">
          <FilterPills onFilterChange={handleFilterChange} counts={counts} />
          <ConcertList filter={filter} />
        </main>

        <FloatingAddButton />
      </div>
    </div>
  );
};

export default Index;
