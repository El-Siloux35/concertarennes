import { useState, useMemo } from "react";
import Header from "../components/Header";
import FilterPills from "../components/FilterPills";
import ConcertList from "../components/ConcertList";
import FloatingAddButton from "../components/FloatingAddButton";

// Helper pour générer des dates relatives
const getDateString = (daysFromNow: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

const getNextSaturday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  const date = new Date(today);
  date.setDate(today.getDate() + daysUntilSaturday);
  return date.toISOString().split('T')[0];
};

const getNextSunday = () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  const date = new Date(today);
  date.setDate(today.getDate() + daysUntilSunday);
  return date.toISOString().split('T')[0];
};

// Mock counts - synchronized with ConcertList
const mockConcerts = [
  { id: "1", date: getDateString(0) },
  { id: "2", date: getDateString(0) },
  { id: "3", date: getDateString(2) },
  { id: "4", date: getDateString(5) },
  { id: "5", date: getNextSaturday() },
  { id: "6", date: getNextSunday() },
  { id: "7", date: getDateString(10) },
  { id: "8", date: getDateString(3) },
  { id: "9", date: getNextSaturday() },
];

const Index = () => {
  const [filter, setFilter] = useState<"all" | "today" | "week" | "weekend">("all");

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

    const weekendCount = mockConcerts.filter((concert) => {
      const concertDate = new Date(concert.date);
      const day = concertDate.getDay();
      return concertDate >= today && (day === 0 || day === 6);
    }).length;

    return {
      all: mockConcerts.length,
      today: todayCount,
      week: weekCount,
      weekend: weekendCount,
    };
  }, []);

  const handleFilterChange = (newFilter: "all" | "today" | "week" | "weekend") => {
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
