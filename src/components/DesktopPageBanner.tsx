import ScrollingBanner, { BANNER_HEIGHT } from "@/components/ScrollingBanner";

/**
 * Bandeau animé de la page d'accueil, repris en header des pages secondaires
 * (favoris, réglages, infos).
 *
 * Desktop uniquement : masqué en CSS sous 768px, le même seuil que useIsMobile.
 */
const DesktopPageBanner = () => (
  <div className="hidden md:block">
    <ScrollingBanner />
  </div>
);

/** Compense la hauteur du bandeau sous le header fixe, desktop uniquement. */
export const DesktopPageBannerSpacer = () => (
  <div className="hidden md:block" style={{ height: BANNER_HEIGHT }} aria-hidden />
);

export default DesktopPageBanner;
