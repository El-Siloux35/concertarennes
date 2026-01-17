import { useState, useEffect, useRef } from "react";
import bannerLogo from "@/assets/banner-logo.svg";
import musicNote from "@/assets/music-note.gif";

interface ScrollingBannerProps {
  className?: string;
}

const ScrollingBanner = ({ className = "" }: ScrollingBannerProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollUpDistance = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

      // Ignore if at bottom (bounce effect)
      if (currentScrollY >= maxScroll - 5) {
        lastScrollY.current = currentScrollY;
        return;
      }

      if (currentScrollY > lastScrollY.current) {
        // Scrolling down - hide immediately
        if (currentScrollY > 50) {
          setIsVisible(false);
        }
        scrollUpDistance.current = 0;
      } else if (currentScrollY < lastScrollY.current) {
        // Scrolling up - accumulate distance
        scrollUpDistance.current += lastScrollY.current - currentScrollY;

        // Only show after scrolling up at least 80px
        if (scrollUpDistance.current > 80) {
          setIsVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate banner height for transform
  const bannerHeight = 120; // Approximate height including padding

  return (
    <div
      className={`w-full bg-background overflow-hidden transition-transform duration-300 ease-out ${className}`}
      style={{
        transform: isVisible ? 'translateY(0)' : `translateY(-${bannerHeight}px)`,
        marginBottom: isVisible ? '0' : `-${bannerHeight}px`,
        paddingTop: '16px',
      }}
    >
      <div className="flex animate-scroll-left gap-6 items-center">
        {/* Repeat the images multiple times to ensure seamless loop */}
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-6 flex-shrink-0">
            <img
              src={bannerLogo}
              alt=""
              className="flex-shrink-0"
            />
            <img
              src={musicNote}
              alt=""
              className="flex-shrink-0 h-12"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;
