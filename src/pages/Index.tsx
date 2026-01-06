import { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import FilterPills from "../components/FilterPills";
import ConcertList from "../components/ConcertList";
import FloatingAddButton from "../components/FloatingAddButton";
import { supabase } from "@/integrations/supabase/client";

type PeriodFilter = "all" | "today" | "week" | "weekend" | "past";
type StyleFilter = "all" | "concert" | "projection" | "exposition" | "autres";

const Index = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [styleFilters, setStyleFilters] = useState<StyleFilter[]>([]);
  const [organizerFilters, setOrganizerFilters] = useState<string[]>([]);
  const [events, setEvents] = useState<{
    id: string;
    date: string;
    style: string | null;
    organizer: string | null;
  }[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, date, style, organizer");
      setEvents(data || []);
    };
    fetchEvents();
  }, []);

  // Extract unique organizers
  const organizers = useMemo(() => {
    const uniqueOrganizers = new Set<string>();
    events.forEach((event) => {
      if (event.organizer && event.organizer.trim()) {
        uniqueOrganizers.add(event.organizer.trim());
      }
    });
    return Array.from(uniqueOrganizers).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [events]);

  // Count events per organizer
  const organizerCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    events.forEach((event) => {
      if (event.organizer && event.organizer.trim()) {
        const org = event.organizer.trim();
        counts[org] = (counts[org] || 0) + 1;
      }
    });
    return counts;
  }, [events]);

  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    
    // Filter only future events for counting periods
    const futureEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today;
    });

    const pastEvents = events.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate < today;
    });

    const todayCount = futureEvents.filter((event) => {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === today.getTime();
    }).length;

    const weekCount = futureEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return eventDate >= today && eventDate <= endOfWeek;
    }).length;

    const weekendCount = futureEvents.filter((event) => {
      const eventDate = new Date(event.date);
      const day = eventDate.getDay();
      // Include Friday (5), Saturday (6), and Sunday (0)
      return eventDate >= today && (day === 0 || day === 5 || day === 6);
    }).length;

    // Count by style
    const concertCount = events.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("concert");
    }).length;

    const projectionCount = events.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("projection");
    }).length;

    const expositionCount = events.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("exposition");
    }).length;

    const autresCount = events.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("autres");
    }).length;

    return {
      all: futureEvents.length,
      today: todayCount,
      week: weekCount,
      weekend: weekendCount,
      past: pastEvents.length,
      concert: concertCount,
      projection: projectionCount,
      exposition: expositionCount,
      autres: autresCount,
    };
  }, [events]);

  const handleFilterChange = (
    newPeriodFilter: PeriodFilter,
    newStyleFilters: StyleFilter[],
    newOrganizerFilters: string[]
  ) => {
    setPeriodFilter(newPeriodFilter);
    setStyleFilters(newStyleFilters);
    setOrganizerFilters(newOrganizerFilters);
  };

  return (
    <div className="min-h-screen bg-background border-muted">
      <div className="max-w-[900px] mx-auto">
        {/* Fixed header section */}
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
          <div className="bg-background py-[12px] pb-[8px]">
            <div className="max-w-[900px] mx-auto px-4">
              <Header />
            </div>
          </div>
          <div className="bg-background pt-3 pb-3">
            <div className="max-w-[900px] mx-auto">
              <FilterPills 
                onFilterChange={handleFilterChange} 
                counts={counts} 
                organizers={organizers}
                organizerCounts={organizerCounts}
              />
            </div>
          </div>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-40"></div>

        <main className="flex flex-col gap-4">
          <ConcertList 
            periodFilter={periodFilter} 
            styleFilters={styleFilters} 
            organizerFilters={organizerFilters}
          />
        </main>

        <FloatingAddButton />
      </div>
    </div>
  );
};

export default Index;
