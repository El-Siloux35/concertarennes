import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ConcertCard, { Concert } from "./ConcertCard";
import EmptyState from "./EmptyState";

interface ConcertListProps {
  filter: "all" | "today" | "week" | "weekend";
}

// Mock data for demonstration
const mockConcerts: Concert[] = [
  {
    id: "1",
    organizer: "Capital Taboulé",
    name: "Culture Emotion - Toujours l'été - Nuage Noir",
    venue: "Le bois Harel",
    date: "2025-12-13",
    price: "Prix Libre",
  },
  {
    id: "2",
    organizer: "Transmusic",
    name: "Festival des Transmusicales",
    venue: "Parc Expo Rennes",
    date: "2025-01-04",
    price: "35€",
  },
  {
    id: "3",
    organizer: "Ubu Club",
    name: "Soirée Electro Underground",
    venue: "L'Ubu",
    date: "2025-01-03",
    price: "12€",
  },
  {
    id: "4",
    organizer: "Jazz à l'Ouest",
    name: "Quartet de Jazz Manouche",
    venue: "Le Liberté",
    date: "2025-01-05",
    price: "18€",
  },
];

const ConcertList = ({ filter }: ConcertListProps) => {
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [displayedConcerts, setDisplayedConcerts] = useState<Concert[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = 10;

  // Filter concerts based on selected filter
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    let filtered = [...mockConcerts];

    if (filter === "today") {
      filtered = mockConcerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        concertDate.setHours(0, 0, 0, 0);
        return concertDate.getTime() === today.getTime();
      });
    } else if (filter === "week") {
      filtered = mockConcerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        return concertDate >= today && concertDate <= endOfWeek;
      });
    } else if (filter === "weekend") {
      filtered = mockConcerts.filter((concert) => {
        const concertDate = new Date(concert.date);
        const day = concertDate.getDay();
        return concertDate >= today && (day === 0 || day === 6);
      });
    }

    // Sort by date
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setConcerts(filtered);
    setPage(1);
    setDisplayedConcerts(filtered.slice(0, ITEMS_PER_PAGE));
    setHasMore(filtered.length > ITEMS_PER_PAGE);
  }, [filter]);

  // Load more concerts for infinite scroll
  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newConcerts = concerts.slice(startIndex, endIndex);

    if (newConcerts.length > 0) {
      setDisplayedConcerts((prev) => [...prev, ...newConcerts]);
      setPage(nextPage);
      setHasMore(endIndex < concerts.length);
    } else {
      setHasMore(false);
    }
  }, [concerts, page]);

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

  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 px-4 pb-24">
      {displayedConcerts.map((concert) => (
        <div 
          key={concert.id} 
          onClick={() => navigate(`/concert/${concert.id}`)}
          className="cursor-pointer"
        >
          <ConcertCard concert={concert} />
        </div>
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
