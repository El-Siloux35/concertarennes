import { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import FilterPills from "../components/FilterPills";
import ConcertList from "../components/ConcertList";
import FloatingAddButton from "../components/FloatingAddButton";
import { supabase } from "@/integrations/supabase/client";
const Index = () => {
  const [filter, setFilter] = useState<"all" | "today" | "week" | "weekend">("all");
  const [events, setEvents] = useState<{
    id: string;
    date: string;
  }[]>([]);
  useEffect(() => {
    const fetchEvents = async () => {
      const {
        data
      } = await supabase.from("events").select("id, date").gte("date", new Date().toISOString().split('T')[0]);
      setEvents(data || []);
    };
    fetchEvents();
  }, []);
  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    const todayCount = events.filter(event => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).length;
    const weekCount = events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= endOfWeek;
    }).length;
    const weekendCount = events.filter(event => {
      const eventDate = new Date(event.date);
      const day = eventDate.getDay();
      return eventDate >= today && (day === 0 || day === 6);
    }).length;
    return {
      all: events.length,
      today: todayCount,
      week: weekCount,
      weekend: weekendCount
    };
  }, [events]);
  const handleFilterChange = (newFilter: "all" | "today" | "week" | "weekend") => {
    setFilter(newFilter);
  };
  return <div className="min-h-screen bg-background border-muted">
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
          <ConcertList filter={filter} />
        </main>

        <FloatingAddButton />
      </div>
    </div>;
};
export default Index;