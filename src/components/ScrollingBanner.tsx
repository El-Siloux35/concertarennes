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

  // Original SVG is 103px tall, doubled = 206px
  const mobileHeight = 206;

  // Hide banner on mobile
  if (isMobile) {
    return null;
  }

  return (
    <div 
      className={`w-full bg-background pt-4 overflow-hidden ${className}`}
    >
      <div className="flex animate-scroll-left gap-6">
        {/* Repeat the image multiple times to ensure seamless loop */}
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src={bannerLogo}
            alt=""
            className="flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;
