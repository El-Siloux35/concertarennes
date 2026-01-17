import bannerLogo from "@/assets/banner-logo.svg";
import musicNote from "@/assets/music-note.gif";

interface ScrollingBannerProps {
  className?: string;
}

const ScrollingBanner = ({ className = "" }: ScrollingBannerProps) => {

  return (
    <div
      className={`w-full bg-background pt-4 overflow-hidden ${className}`}
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
