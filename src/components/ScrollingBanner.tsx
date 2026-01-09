import { useState, useEffect } from "react";
import bannerLogo from "@/assets/banner-logo.svg";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScrollingBannerProps {
  className?: string;
}

const ScrollingBanner = ({ className = "" }: ScrollingBannerProps) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    if (!isMobile) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scrolling down
        setIsVisible(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile, lastScrollY]);

  return (
    <div 
      className={`w-full overflow-hidden bg-background pt-4 transition-all duration-300 ${
        isMobile && !isVisible ? "h-0 pt-0 opacity-0" : ""
      } ${className}`}
    >
      <div className="flex gap-6 animate-scroll-left">
        {/* Repeat the image multiple times to ensure seamless loop */}
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src={bannerLogo}
            alt=""
            className={`flex-shrink-0 ${isMobile ? "h-[206px]" : "h-auto"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;
