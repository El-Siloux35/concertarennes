import { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import FilterPills from "../components/FilterPills";
import ConcertList from "../components/ConcertList";
import FloatingAddButton from "../components/FloatingAddButton";
import { supabase } from "@/integrations/supabase/client";

type PeriodFilter = "all" | "today" | "week" | "weekend";
type StyleFilter = "all" | "concert" | "projection" | "exposition" | "autres";

const Index = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [styleFilter, setStyleFilter] = useState<StyleFilter>("all");
  const [events, setEvents] = useState<{
    id: string;
    date: string;
  }[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, date")
        .gte("date", new Date().toISOString().split("T")[0]);
      setEvents(data || []);
    };
    fetchEvents();
  }, []);

  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    const todayCount = events.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).length;
    const weekCount = events.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= endOfWeek;
    }).length;
    const weekendCount = events.filter((event) => {
      const eventDate = new Date(event.date);
      const day = eventDate.getDay();
      // Include Friday (5), Saturday (6), and Sunday (0)
      return eventDate >= today && (day === 0 || day === 5 || day === 6);
    }).length;
    return {
      all: events.length,
      today: todayCount,
      week: weekCount,
      weekend: weekendCount,
    };
  }, [events]);

  const handleFilterChange = (
    newPeriodFilter: PeriodFilter,
    newStyleFilter: StyleFilter
  ) => {
    setPeriodFilter(newPeriodFilter);
    setStyleFilter(newStyleFilter);
  };

  return (
    <div className="min-h-screen bg-background border-muted">
      <div className="max-w-[700px] mx-auto">
        {/* Fixed header section */}
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
          <div className="bg-background py-[12px] pb-[8px]">
            <div className="max-w-[700px] mx-auto px-4">
              <Header />
            </div>
          </div>
          <div className="bg-background pt-3 pb-3">
            <div className="max-w-[700px] mx-auto">
              <FilterPills onFilterChange={handleFilterChange} counts={counts} />
            </div>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-40"></div>

        <main className="flex flex-col gap-4">
          <ConcertList periodFilter={periodFilter} styleFilter={styleFilter} />
        </main>

        <FloatingAddButton />
      </div>
    </div>
  );
};

export default Index;
