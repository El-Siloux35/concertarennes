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

  return (
    <div 
      className={`w-full bg-background transition-all duration-300 ${
        isMobile ? "" : "pt-4"
      } ${
        isMobile && !isVisible ? "!h-0 overflow-hidden opacity-0" : "overflow-hidden"
      } ${className}`}
      style={isMobile && isVisible ? { height: mobileHeight } : undefined}
    >
      <div className={`flex animate-scroll-left ${isMobile ? "gap-12" : "gap-6"}`}>
        {/* Repeat the image multiple times to ensure seamless loop */}
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src={bannerLogo}
            alt=""
            style={isMobile ? { height: mobileHeight, width: 'auto' } : undefined}
            className="flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;
