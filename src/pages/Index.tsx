import { useState, useMemo, useEffect } from "react";
import Header from "../components/Header";
import FilterPills from "../components/FilterPills";
import ConcertList from "../components/ConcertList";
import FloatingAddButton from "../components/FloatingAddButton";
import Footer from "../components/Footer";
import ScrollingBanner from "../components/ScrollingBanner";
import { supabase } from "@/integrations/supabase/client";

type PeriodFilter = "all" | "today" | "week" | "weekend" | "past";
type StyleFilter = "all" | "concert" | "projection" | "exposition" | "autres";

const Index = () => {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [styleFilters, setStyleFilters] = useState<StyleFilter[]>([]);
  const [venueFilters, setVenueFilters] = useState<string[]>([]);
  const [events, setEvents] = useState<{
    id: string;
    date: string;
    style: string | null;
    venue: string | null;
  }[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("events")
        .select("id, date, style, venue")
        .eq("is_draft", false);
      setEvents(data || []);
    };
    fetchEvents();
  }, []);

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

    const autresStyleCount = events.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("autres");
    }).length;

    // Count by venue type
    const barsCount = events.filter((event) => event.venue === "bars").length;
    const ombresCount = events.filter((event) => event.venue === "ombres-electriques").length;
    const autresVenueCount = events.filter((event) => event.venue === "autres").length;

    return {
      all: futureEvents.length,
      today: todayCount,
      week: weekCount,
      weekend: weekendCount,
      past: pastEvents.length,
      concert: concertCount,
      projection: projectionCount,
      exposition: expositionCount,
      autres: autresStyleCount,
      bars: barsCount,
      "ombres-electriques": ombresCount,
      autresVenue: autresVenueCount,
    };
  }, [events]);

  const handleFilterChange = (
    newPeriodFilter: PeriodFilter,
    newStyleFilters: StyleFilter[],
    newVenueFilters: string[]
  ) => {
    setPeriodFilter(newPeriodFilter);
    setStyleFilters(newStyleFilters);
    setVenueFilters(newVenueFilters);
  };

  return (
    <div className="min-h-screen bg-background border-muted">
      <div className="max-w-[900px] mx-auto">
        {/* Fixed header section */}
        <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
          <ScrollingBanner />
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
            venueFilters={venueFilters}
          />
        </main>

        <FloatingAddButton />
        <Footer />
      </div>
    </div>
  );
};

export default Index;
