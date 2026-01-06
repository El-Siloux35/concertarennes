import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConcertCard, { Concert } from "./ConcertCard";
import EmptyState from "./EmptyState";
import { supabase } from "@/integrations/supabase/client";

type PeriodFilter = "all" | "today" | "week" | "weekend" | "past";
type StyleFilter = "all" | "concert" | "projection" | "exposition" | "autres";

interface ConcertListProps {
  periodFilter: PeriodFilter;
  styleFilters: StyleFilter[];
  venueFilters: string[];
}

const ConcertList = ({ periodFilter, styleFilters, venueFilters }: ConcertListProps) => {
  const navigate = useNavigate();
  const [allConcerts, setAllConcerts] = useState<Concert[]>([]);
  const [filteredConcerts, setFilteredConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConcerts = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*");

      if (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
        return;
      }

      const mappedConcerts: Concert[] = (data || []).map((event) => ({
        id: event.id,
        organizer: event.organizer || "Organisateur",
        name: event.title,
        venue: event.location || "Lieu non spécifié",
        venueType: event.venue || null,
        date: event.date,
        price: event.price || "Prix non spécifié",
        imageUrl: event.image_url,
        style: event.style,
      }));

      setAllConcerts(mappedConcerts);
      setLoading(false);
    };

    fetchConcerts();
  }, []);

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    let filtered = allConcerts;

    // Filter by period
    if (periodFilter === "past") {
      filtered = filtered.filter((concert) => {
        const eventDate = new Date(concert.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate < today;
      });
    } else {
      // First, filter to only future events for non-past filters
      filtered = filtered.filter((concert) => {
        const eventDate = new Date(concert.date);
        eventDate.setHours(0, 0, 0, 0);
        return eventDate >= today;
      });

      if (periodFilter === "today") {
        filtered = filtered.filter((concert) => {
          const eventDate = new Date(concert.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === today.getTime();
        });
      } else if (periodFilter === "week") {
        filtered = filtered.filter((concert) => {
          const eventDate = new Date(concert.date);
          return eventDate >= today && eventDate <= endOfWeek;
        });
      } else if (periodFilter === "weekend") {
        filtered = filtered.filter((concert) => {
          const eventDate = new Date(concert.date);
          const day = eventDate.getDay();
          // Include Friday (5), Saturday (6), and Sunday (0)
          return eventDate >= today && (day === 0 || day === 5 || day === 6);
        });
      }
    }

    // Filter by styles (multi-select)
    if (styleFilters.length > 0 && !styleFilters.includes("all")) {
      filtered = filtered.filter((concert) => {
        const concertStyles = concert.style?.split(",").map(s => s.trim()) || [];
        // Check if any of the concert's styles match any of the selected filters
        return styleFilters.some(sf => concertStyles.includes(sf));
      });
    }

    // Filter by venue type
    if (venueFilters.length > 0) {
      filtered = filtered.filter((concert) => {
        return concert.venueType && venueFilters.includes(concert.venueType);
      });
    }

    // Sort by date
    if (periodFilter === "past") {
      // Past events: most recent first
      filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else {
      // Future events: soonest first
      filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }

    setFilteredConcerts(filtered);
  }, [periodFilter, styleFilters, venueFilters, allConcerts]);

  if (loading) {
    return (
      <div className="px-4 py-8 text-center text-primary">
        Chargement...
      </div>
    );
  }

  if (filteredConcerts.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-32">
      {filteredConcerts.map((concert) => (
        <ConcertCard
          key={concert.id}
          concert={concert}
          onNavigate={() => navigate(`/concert/${concert.id}`)}
        />
      ))}
    </div>
  );
};

export default ConcertList;
