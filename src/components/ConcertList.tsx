import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ConcertCard, { Concert } from "./ConcertCard";
import EmptyState from "./EmptyState";
import { supabase } from "@/integrations/supabase/client";

interface ConcertListProps {
  filter: "all" | "today" | "week" | "weekend";
}

const ConcertList = ({ filter }: ConcertListProps) => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [displayedConcerts, setDisplayedConcerts] = useState<Concert[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;
  const navigate = useNavigate();

  // Fetch concerts from Supabase
  useEffect(() => {
    const fetchConcerts = async () => {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("events")
        .select("id, title, organizer, location, date, price")
        .gte("date", new Date().toISOString().split('T')[0])
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching concerts:", error);
        setLoading(false);
        return;
      }

      // Map to Concert interface
      const mappedConcerts: Concert[] = (data || []).map((event) => ({
        id: event.id,
        organizer: event.organizer || "Organisateur",
        name: event.title,
        venue: event.location || "Lieu non spécifié",
        date: event.date,
        price: event.price || "Prix non spécifié",
      }));

      setConcerts(mappedConcerts);
      setLoading(false);
    };

    fetchConcerts();
  }, []);

  // Filter concerts based on selected filter
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    let filtered = [...concerts];

    if (filter === "today") {
      filtered = concerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        concertDate.setHours(0, 0, 0, 0);
        return concertDate.getTime() === today.getTime();
      });
    } else if (filter === "week") {
      filtered = concerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        return concertDate >= today && concertDate <= endOfWeek;
      });
    } else if (filter === "weekend") {
      filtered = concerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        const day = concertDate.getDay();
        return concertDate >= today && (day === 0 || day === 6);
      });
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setPage(1);
    setDisplayedConcerts(filtered.slice(0, ITEMS_PER_PAGE));
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [filter, concerts]);

  // Load more concerts for infinite scroll
  const loadMore = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    let filtered = [...concerts];

    if (filter === "today") {
      filtered = concerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        concertDate.setHours(0, 0, 0, 0);
        return concertDate.getTime() === today.getTime();
      });
    } else if (filter === "week") {
      filtered = concerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        return concertDate >= today && concertDate <= endOfWeek;
      });
    } else if (filter === "weekend") {
      filtered = concerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        const day = concertDate.getDay();
        return concertDate >= today && (day === 0 || day === 6);
      });
    }

    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newConcerts = filtered.slice(startIndex, endIndex);

    if (newConcerts.length > 0) {
      setDisplayedConcerts((prev) => [...prev, ...newConcerts]);
      setPage(nextPage);
      setHasMore(endIndex < filtered.length);
    } else {
      setHasMore(false);
    }
  }, [concerts, page, filter]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 px-4 pb-24">
        <div className="text-center py-8 text-primary">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pb-24">
      {displayedConcerts.map((concert) => (
        <ConcertCard 
          key={concert.id} 
          concert={concert} 
          onNavigate={() => navigate(`/concert/${concert.id}`)}
        />
      ))}

      {displayedConcerts.length === 0 && <EmptyState />}

      {hasMore && displayedConcerts.length > 0 && (
        <div ref={loaderRef} className="py-4 text-center">
          <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!hasMore && displayedConcerts.length > 0 && <EmptyState />}
    </div>
  );
};

export default ConcertList;
