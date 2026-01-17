import { useRef } from "react";
import bannerLogo from "@/assets/banner-logo.svg";
import musicNote from "@/assets/music-note.gif";

interface ScrollingBannerProps {
  className?: string;
  onHeightChange?: (height: number) => void;
}

// Export banner height so parent can use it
export const BANNER_HEIGHT = 123; // Height of the banner content + padding + 20px extra

const ScrollingBanner = ({ className = "" }: ScrollingBannerProps) => {
  const bannerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={bannerRef}
      className={`w-full bg-background overflow-hidden ${className}`}
      style={{ paddingTop: '16px' }}
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
