import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ConcertCard, { Concert } from "./ConcertCard";
import EmptyState from "./EmptyState";

interface ConcertListProps {
  filter: "all" | "today" | "week" | "weekend";
}

// Mock data for demonstration - dates relatives à aujourd'hui
const today = new Date();
const getDateString = (daysFromNow: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
};

// Trouver le prochain samedi
const getNextSaturday = () => {
  const date = new Date(today);
  const dayOfWeek = date.getDay();
  const daysUntilSaturday = (6 - dayOfWeek + 7) % 7 || 7;
  date.setDate(date.getDate() + daysUntilSaturday);
  return date.toISOString().split('T')[0];
};

// Trouver le prochain dimanche
const getNextSunday = () => {
  const date = new Date(today);
  const dayOfWeek = date.getDay();
  const daysUntilSunday = (7 - dayOfWeek) % 7 || 7;
  date.setDate(date.getDate() + daysUntilSunday);
  return date.toISOString().split('T')[0];
};

const mockConcerts: Concert[] = [
  {
    id: "1",
    organizer: "Capital Taboulé",
    name: "Culture Emotion - Toujours l'été - Nuage Noir",
    venue: "Le bois Harel",
    date: getDateString(0), // Aujourd'hui
    price: "Prix Libre",
  },
  {
    id: "2",
    organizer: "Transmusic",
    name: "Festival des Transmusicales",
    venue: "Parc Expo Rennes",
    date: getDateString(0), // Aujourd'hui
    price: "35€",
  },
  {
    id: "3",
    organizer: "Ubu Club",
    name: "Soirée Electro Underground",
    venue: "L'Ubu",
    date: getDateString(2), // Dans 2 jours
    price: "12€",
  },
  {
    id: "4",
    organizer: "Jazz à l'Ouest",
    name: "Quartet de Jazz Manouche",
    venue: "Le Liberté",
    date: getDateString(5), // Dans 5 jours
    price: "18€",
  },
  {
    id: "5",
    organizer: "Rock en Rennes",
    name: "Tribute to Queen",
    venue: "Le Triangle",
    date: getNextSaturday(), // Prochain samedi
    price: "25€",
  },
  {
    id: "6",
    organizer: "Acoustic Live",
    name: "Session Folk Acoustique",
    venue: "Bar Le Pastis",
    date: getNextSunday(), // Prochain dimanche
    price: "8€",
  },
  {
    id: "7",
    organizer: "Electro Nights",
    name: "Techno Marathon 12h",
    venue: "Warehouse District",
    date: getDateString(10), // Dans 10 jours
    price: "20€",
  },
  {
    id: "8",
    organizer: "Les Petits Concerts",
    name: "Chanson Française Intimiste",
    venue: "Café des Arts",
    date: getDateString(3), // Dans 3 jours
    price: "Prix Libre",
  },
  {
    id: "9",
    organizer: "Metal Factory",
    name: "Heavy Metal Night",
    venue: "L'Antipode",
    date: getNextSaturday(), // Prochain samedi
    price: "15€",
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
