import { useState, useMemo, useEffect, useLayoutEffect, useRef } from "react";
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

  const headerRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  useLayoutEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const update = () => {
      setHeaderHeight(el.getBoundingClientRect().height);
    };

    update();

    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

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

    // Count by style (only future events)
    const concertCount = futureEvents.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("concert");
    }).length;

    const projectionCount = futureEvents.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("projection");
    }).length;

    const expositionCount = futureEvents.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("exposition");
    }).length;

    const autresStyleCount = futureEvents.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim()) || [];
      return styles.includes("autres");
    }).length;

    // Count by venue type (only future events)
    const barsCount = futureEvents.filter((event) => event.venue === "bars").length;
    const ombresCount = futureEvents.filter((event) => event.venue === "ombres-electriques").length;
    const autresVenueCount = futureEvents.filter((event) => event.venue === "autres").length;

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
      <div className="max-w-[900px] mx-auto" style={{ paddingTop: headerHeight }}>
        {/* Fixed header section */}
        <div ref={headerRef} className="fixed top-0 left-0 right-0 z-[100] flex flex-col will-change-transform" style={{ paddingTop: 'env(safe-area-inset-top)', transform: 'translateZ(0)' }}>
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

        <main className="flex flex-col gap-4 pt-4">
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
