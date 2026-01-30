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
    // Apply on all touch devices (removed standalone-only check)
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (!isTouchDevice) {
      return;
    }

    const handleTouchStart = (e: TouchEvent) => {
      // Check if drawer is open (vaul adds data-scroll-locked to body)
      const isDrawerOpen = document.body.hasAttribute('data-scroll-locked');

      if (!isDrawerOpen) {
        return;
      }

      // Check if touch is inside the drawer or overlay
      const target = e.target as HTMLElement;
      const drawer = document.querySelector('[data-vaul-drawer]');
      const overlay = document.querySelector('[data-vaul-overlay]');

      // Check if target is inside drawer
      if (drawer && drawer.contains(target)) {
        return; // Allow
      }

      // Check if target is the overlay itself (to close drawer)
      if (overlay && (target === overlay || overlay.contains(target))) {
        return; // Allow overlay click to close
      }

      // Block touch events outside drawer
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    const handleTouchMove = (e: TouchEvent) => {
      const isDrawerOpen = document.body.hasAttribute('data-scroll-locked');

      if (!isDrawerOpen) {
        return;
      }

      const target = e.target as HTMLElement;
      const drawer = document.querySelector('[data-vaul-drawer]');

      // Allow scrolling inside drawer
      if (drawer && drawer.contains(target)) {
        return;
      }

      // Block all touch moves outside drawer
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    };

    // Use capturing phase to intercept events before they reach other handlers
    document.addEventListener('touchstart', handleTouchStart, { capture: true, passive: false });
    document.addEventListener('touchmove', handleTouchMove, { capture: true, passive: false });

    console.log('[PWA Fix] Touch event listeners attached');

    return () => {
      document.removeEventListener('touchstart', handleTouchStart, { capture: true });
      document.removeEventListener('touchmove', handleTouchMove, { capture: true });
      console.log('[PWA Fix] Touch event listeners removed');
    };
  }, []);
}
