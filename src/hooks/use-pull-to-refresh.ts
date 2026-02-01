import { useCallback, useEffect, useRef } from "react";

const PULL_THRESHOLD = 70;
const TOP_THRESHOLD = 10;

/**
 * Pull-to-refresh for PWA homepage. Listens for touch pull-down at top of page.
 */
export function usePullToRefresh(onRefresh: () => void | Promise<void>) {
  const touchStartY = useRef(0);
  const pullDistance = useRef(0);
  const isPulling = useRef(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      // Only when at top of page
      const scrollY = window.scrollY ?? document.documentElement.scrollTop;
      if (scrollY > TOP_THRESHOLD) return;

      touchStartY.current = e.touches[0].clientY;
      pullDistance.current = 0;
      isPulling.current = true;
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isPulling.current) return;

      const currentY = e.touches[0].clientY;
      const scrollY = window.scrollY ?? document.documentElement.scrollTop;

      // Only count pull when still at top
      if (scrollY <= TOP_THRESHOLD && currentY > touchStartY.current) {
        pullDistance.current = currentY - touchStartY.current;
      }
    },
    []
  );

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling.current) return;
    isPulling.current = false;

    if (pullDistance.current >= PULL_THRESHOLD) {
      await onRefresh();
    }

    pullDistance.current = 0;
  }, [onRefresh]);

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);
}
