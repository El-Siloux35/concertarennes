import { useEffect } from "react";

/**
 * Fix for iOS PWA standalone mode where touch events pass through
 * the drawer overlay to the content behind.
 *
 * This hook adds a capturing event listener at the document level
 * that blocks touch events outside the drawer when it's open.
 */
export function usePWADrawerFix() {
  useEffect(() => {
    // Only apply fix in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (!isStandalone) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      // Check if drawer is open (vaul adds data-scroll-locked to body)
      const isDrawerOpen = document.body.hasAttribute('data-scroll-locked');

      if (!isDrawerOpen) {
        return;
      }

      // Check if touch is inside the drawer
      const target = e.target as HTMLElement;
      const isInsideDrawer = target.closest('[data-vaul-drawer]') !== null;
      const isInsideOverlay = target.closest('[data-vaul-overlay]') !== null;

      // If touch is on overlay, let it close the drawer
      if (isInsideOverlay && !isInsideDrawer) {
        return;
      }

      // If touch is inside drawer, allow it
      if (isInsideDrawer) {
        return;
      }

      // Block touch events outside drawer
      e.preventDefault();
      e.stopPropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const isDrawerOpen = document.body.hasAttribute('data-scroll-locked');

      if (!isDrawerOpen) {
        return;
      }

      const target = e.target as HTMLElement;
      const isInsideDrawer = target.closest('[data-vaul-drawer]') !== null;

      // Allow scrolling inside drawer
      if (isInsideDrawer) {
        return;
      }

      // Block all touch moves outside drawer
      e.preventDefault();
      e.stopPropagation();
    };

    // Use capturing phase to intercept events before they reach other handlers
    document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false });
    document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
    };
  }, []);
}
