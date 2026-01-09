import bannerLogo from "@/assets/banner-logo.svg";

const ScrollingBanner = () => {
  return (
    <div className="w-full overflow-hidden bg-background">
      <div className="flex animate-scroll-left">
        {/* Repeat the image multiple times to ensure seamless loop */}
        {[...Array(6)].map((_, i) => (
          <img
            key={i}
            src={bannerLogo}
            alt=""
            className="h-auto flex-shrink-0"
          />
        ))}
      </div>
    </div>
  );
};

export default ScrollingBanner;
