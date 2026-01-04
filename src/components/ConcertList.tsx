import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useVirtualizer } from "@tanstack/react-virtual";
import ConcertCard, { Concert } from "./ConcertCard";
import EmptyState from "./EmptyState";
import { supabase } from "@/integrations/supabase/client";

interface ConcertListProps {
  filter: "all" | "today" | "week" | "weekend";
}

const ConcertList = ({ filter }: ConcertListProps) => {
  const [allConcerts, setAllConcerts] = useState<Concert[]>([]);
  const [filteredConcerts, setFilteredConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);
  const parentRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Fetch all concerts from Supabase
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

      setAllConcerts(mappedConcerts);
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

    let filtered = [...allConcerts];

    if (filter === "today") {
      filtered = allConcerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        concertDate.setHours(0, 0, 0, 0);
        return concertDate.getTime() === today.getTime();
      });
    } else if (filter === "week") {
      filtered = allConcerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        return concertDate >= today && concertDate <= endOfWeek;
      });
    } else if (filter === "weekend") {
      filtered = allConcerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        const day = concertDate.getDay();
        return concertDate >= today && (day === 0 || day === 6);
      });
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setFilteredConcerts(filtered);
  }, [filter, allConcerts]);

  // Virtualizer configuration - only renders visible items + overscan
  const virtualizer = useVirtualizer({
    count: filteredConcerts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // Estimated height of each card
    overscan: 3, // Number of items to render outside visible area
  });

  const items = virtualizer.getVirtualItems();

  if (loading) {
    return (
      <div className="flex flex-col gap-4 px-4 pb-24">
        <div className="text-center py-8 text-primary">Chargement...</div>
      </div>
    );
  }

  if (filteredConcerts.length === 0) {
    return (
      <div className="flex flex-col gap-4 px-4 pb-24">
        <EmptyState />
      </div>
    );
  }

  return (
    <div 
      ref={parentRef}
      className="px-4 pb-24 overflow-auto"
      style={{ height: 'calc(100vh - 200px)' }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {items.map((virtualRow) => {
          const concert = filteredConcerts[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="pb-4">
                <ConcertCard 
                  concert={concert} 
                  onNavigate={() => navigate(`/concert/${concert.id}`)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConcertList;
