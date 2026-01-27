import { useState, useMemo, useEffect, useRef } from "react";
import Header from "../components/Header";
import FilterPills from "../components/FilterPills";
import ConcertList from "../components/ConcertList";
import FloatingAddButton from "../components/FloatingAddButton";
import Footer from "../components/Footer";
import ScrollingBanner, { BANNER_HEIGHT } from "../components/ScrollingBanner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

// Header section height (logo + connection icons)
const HEADER_SECTION_HEIGHT = 68;
// Filters section height
const FILTERS_HEIGHT = 70;

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

  const isMobile = useIsMobile();

  // Initialize visibility based on current scroll position (no animation on return)
  const [bannerVisible, setBannerVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY <= 50;
    }
    return true;
  });
  const [headerVisible, setHeaderVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.scrollY <= 50;
    }
    return true;
  });

  // Disable transitions on initial mount to prevent animation when returning to page
  const [transitionsEnabled, setTransitionsEnabled] = useState(false);

  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0);
  const scrollUpDistance = useRef(0);

  // Handle scroll to show/hide banner and header
  useEffect(() => {
    const handleScroll = () => {
      // Enable transitions after first scroll
      if (!transitionsEnabled) {
        setTransitionsEnabled(true);
      }

      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      // Ignore if at bottom (bounce effect)
      if (currentScrollY >= maxScroll - 5) {
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide banner and header (on mobile)
        if (currentScrollY > 50) {
          setBannerVisible(false);
          if (isMobile) {
            setHeaderVisible(false);
          }
        }
        scrollUpDistance.current = 0;
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - accumulate distance
        scrollUpDistance.current += lastScrollY.current - currentScrollY;

        // Only show after scrolling up at least 80px
        if (scrollUpDistance.current > 80) {
          setBannerVisible(true);
          setHeaderVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [transitionsEnabled, isMobile]);

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

    // Count by style (only future events) - case insensitive
    const concertCount = futureEvents.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim().toLowerCase()) || [];
      return styles.includes("concert");
    }).length;

    const projectionCount = futureEvents.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim().toLowerCase()) || [];
      return styles.includes("projection");
    }).length;

    const expositionCount = futureEvents.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim().toLowerCase()) || [];
      return styles.includes("exposition");
    }).length;

    const autresStyleCount = futureEvents.filter((event) => {
      const styles = event.style?.split(",").map(s => s.trim().toLowerCase()) || [];
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

  // Calculate the top position for filters (separate from transformed header)
  const getFiltersTop = () => {
    if (bannerVisible && headerVisible) {
      return BANNER_HEIGHT + HEADER_SECTION_HEIGHT;
    } else if (!bannerVisible && !headerVisible && isMobile) {
      return 0;
    } else if (!bannerVisible) {
      return HEADER_SECTION_HEIGHT;
    }
    return BANNER_HEIGHT + HEADER_SECTION_HEIGHT;
  };

  // Calculate transform for banner+header only
  const getHeaderTransform = () => {
    if (!bannerVisible && !headerVisible && isMobile) {
      return `translateY(-${BANNER_HEIGHT + HEADER_SECTION_HEIGHT}px)`;
    } else if (!bannerVisible) {
      return `translateY(-${BANNER_HEIGHT}px)`;
    }
    return 'translateY(0)';
  };

  // Calculate effective padding for main content
  const getEffectivePadding = () => {
    if (bannerVisible && headerVisible) {
      return BANNER_HEIGHT + HEADER_SECTION_HEIGHT + FILTERS_HEIGHT;
    } else if (!bannerVisible && !headerVisible && isMobile) {
      return FILTERS_HEIGHT;
    } else if (!bannerVisible) {
      return HEADER_SECTION_HEIGHT + FILTERS_HEIGHT;
    }
    return BANNER_HEIGHT + HEADER_SECTION_HEIGHT + FILTERS_HEIGHT;
  };

  return (
    <div className="min-h-screen bg-background border-muted">
      <div
        className={`max-w-[900px] mx-auto ${transitionsEnabled ? 'transition-[padding] duration-300' : ''}`}
        style={{ paddingTop: getEffectivePadding() }}
      >
        {/* Fixed header section (banner + logo/connection) - this transforms */}
        <div
          className={`fixed top-0 left-0 right-0 z-[100] flex flex-col will-change-transform ${transitionsEnabled ? 'transition-transform duration-300 ease-out' : ''}`}
          style={{
            paddingTop: 'env(safe-area-inset-top)',
            transform: getHeaderTransform(),
          }}
        >
          <ScrollingBanner />
          <div className="bg-background py-[12px] pb-[8px]">
            <div className="max-w-[900px] mx-auto px-4">
              <Header />
            </div>
          </div>
        </div>

        {/* Fixed filters section - NO transform, separate from header */}
        <div
          className={`fixed left-0 right-0 z-[99] bg-background py-3 ${transitionsEnabled ? 'transition-[top] duration-300 ease-out' : ''}`}
          style={{
            top: `calc(env(safe-area-inset-top) + ${getFiltersTop()}px)`,
          }}
        >
          <div className="max-w-[900px] mx-auto">
            <FilterPills
              onFilterChange={handleFilterChange}
              counts={counts}
            />
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
