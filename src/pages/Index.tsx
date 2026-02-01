import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Header from "../components/Header";
import FilterPills from "../components/FilterPills";
import ConcertList from "../components/ConcertList";
import FloatingAddButton from "../components/FloatingAddButton";
import Footer from "../components/Footer";
import ScrollingBanner, { BANNER_HEIGHT } from "../components/ScrollingBanner";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";

// Header section height (desktop)
const HEADER_SECTION_HEIGHT = 68;
// Header section height mobile (4px + 52px + 4px)
const HEADER_SECTION_HEIGHT_MOBILE = 60;
// Filters section height
const FILTERS_HEIGHT = 70;
// Filters section height mobile (4px + 46px + 4px)
const FILTERS_HEIGHT_MOBILE = 54;

type PeriodFilter = "all" | "today" | "week" | "weekend" | "past";
type StyleFilter = "all" | "concert" | "projection" | "exposition" | "autres";

// Persist filters to localStorage
const FILTERS_STORAGE_KEY = "concertFilters";

const loadFilters = () => {
  try {
    const saved = localStorage.getItem(FILTERS_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}
  return { period: "all", styles: [], venues: [] };
};

const Index = () => {
  const savedFilters = loadFilters();
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>(savedFilters.period);
  const [styleFilters, setStyleFilters] = useState<StyleFilter[]>(savedFilters.styles);
  const [venueFilters, setVenueFilters] = useState<string[]>(savedFilters.venues);
  const [events, setEvents] = useState<{
    id: string;
    date: string;
    style: string | null;
    venue: string | null;
  }[]>([]);

  const isMobile = useIsMobile();

  // Header visibility states
  const [bannerVisible, setBannerVisible] = useState(true);
  const [headerVisible, setHeaderVisible] = useState(true);

  // Only enable scroll-based hiding after first intentional scroll
  const isScrollingRef = useRef(false);
  const lastScrollY = useRef(0);
  const scrollUpDistance = useRef(0);

  // Handle scroll to show/hide banner and header
  useEffect(() => {
    let scrollCount = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Ignore first few scroll events (browser scroll restoration)
      scrollCount++;
      if (scrollCount < 3) {
        lastScrollY.current = currentScrollY;
        return;
      }

      isScrollingRef.current = true;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      // Ignore if at bottom (bounce effect)
      if (currentScrollY >= maxScroll - 5) {
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide banner only (on desktop)
        // On mobile, header+filters stay always visible
        if (currentScrollY > 50 && !isMobile) {
          setBannerVisible(false);
        }
        scrollUpDistance.current = 0;
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - accumulate distance
        scrollUpDistance.current += lastScrollY.current - currentScrollY;

        // Only show banner after scrolling up at least 80px (desktop only)
        if (scrollUpDistance.current > 80 && !isMobile) {
          setBannerVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

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

  // Optimized: single pass through events array
  const counts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);
    const endOfWeekTime = endOfWeek.getTime();

    const result = {
      all: 0, today: 0, week: 0, weekend: 0, past: 0,
      concert: 0, projection: 0, exposition: 0, autres: 0,
      bars: 0, "ombres-electriques": 0, autresVenue: 0,
    };

    for (const event of events) {
      const eventDate = new Date(event.date);
      eventDate.setHours(0, 0, 0, 0);
      const eventTime = eventDate.getTime();
      const isFuture = eventTime >= todayTime;

      if (!isFuture) {
        result.past++;
        continue;
      }

      result.all++;
      if (eventTime === todayTime) result.today++;
      if (eventTime <= endOfWeekTime) result.week++;

      const day = eventDate.getDay();
      if (day === 0 || day === 5 || day === 6) result.weekend++;

      // Count styles
      const styles = event.style?.toLowerCase().split(",").map(s => s.trim()) || [];
      if (styles.includes("concert")) result.concert++;
      if (styles.includes("projection")) result.projection++;
      if (styles.includes("exposition")) result.exposition++;
      if (styles.includes("autres")) result.autres++;

      // Count venues
      if (event.venue === "bars") result.bars++;
      else if (event.venue === "ombres-electriques") result["ombres-electriques"]++;
      else if (event.venue === "autres") result.autresVenue++;
    }

    return result;
  }, [events]);

  const handleFilterChange = useCallback((
    newPeriodFilter: PeriodFilter,
    newStyleFilters: StyleFilter[],
    newVenueFilters: string[]
  ) => {
    setPeriodFilter(newPeriodFilter);
    setStyleFilters(newStyleFilters);
    setVenueFilters(newVenueFilters);
    // Persist filters to localStorage
    localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify({
      period: newPeriodFilter,
      styles: newStyleFilters,
      venues: newVenueFilters,
    }));
  }, []);

  // Calculate top position for header (using top instead of transform to not break Drawer)
  const getHeaderTop = () => {
    if (isMobile) {
      // Mobile: header+filters always visible, no banner
      return 0;
    }
    // Desktop: banner can hide
    if (!bannerVisible) {
      return -BANNER_HEIGHT;
    }
    return 0;
  };

  // Calculate effective padding for main content
  const getEffectivePadding = () => {
    if (isMobile) {
      // Mobile: header + filters always visible, no banner
      return HEADER_SECTION_HEIGHT_MOBILE + FILTERS_HEIGHT_MOBILE;
    }
    // Desktop: with banner
    if (!bannerVisible) {
      return HEADER_SECTION_HEIGHT + FILTERS_HEIGHT;
    }
    return BANNER_HEIGHT + HEADER_SECTION_HEIGHT + FILTERS_HEIGHT;
  };

  return (
    <div className="min-h-screen bg-background border-muted">
      <div
        className="max-w-[900px] mx-auto transition-[padding] duration-300"
        style={{ paddingTop: getEffectivePadding() }}
      >
        {/* Fixed header section */}
        <div
          className="fixed left-0 right-0 z-[100] flex flex-col transition-[top] duration-300 ease-out"
          style={{
            top: `calc(env(safe-area-inset-top) + ${getHeaderTop()}px)`,
          }}
        >
          {/* Banner only on desktop */}
          {!isMobile && <ScrollingBanner />}
          <div className={`bg-background ${isMobile ? 'py-[4px]' : 'py-[12px] pb-[8px]'}`}>
            <div className="max-w-[900px] mx-auto px-4">
              <Header />
            </div>
          </div>
          <div className={`bg-background ${isMobile ? 'py-[4px]' : 'py-3'}`}>
            <div className="max-w-[900px] mx-auto">
              <FilterPills
                onFilterChange={handleFilterChange}
                counts={counts}
                initialPeriod={periodFilter}
                initialStyles={styleFilters}
                initialVenues={venueFilters as any}
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
