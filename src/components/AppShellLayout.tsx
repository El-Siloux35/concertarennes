import { useLocation, Outlet } from "react-router-dom";
import { lazy, Suspense, useLayoutEffect, useRef } from "react";
import Index from "@/pages/Index";
import Compte from "@/pages/Compte";
import CreateEvent from "@/pages/CreateEvent";
import { useScroll } from "@/contexts/ScrollContext";

const Auth = lazy(() => import("@/pages/Auth"));
const Favorites = lazy(() => import("@/pages/Favorites"));
const About = lazy(() => import("@/pages/About"));
const Settings = lazy(() => import("@/pages/Settings"));

/**
 * Layout that keeps Index mounted when navigating between home, profile, create event,
 * favorites, settings, and about. Prevents image reload/jump when returning to home.
 */
const AppShellLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  const isCompte = path === "/compte";
  const isCreateEvent = path === "/creer-evenement";
  const isAuth = path === "/auth";
  const fromCompte = (location.state as { from?: string })?.from === "compte";
  const isHomeFlow = ["/home", "/compte", "/creer-evenement", "/auth"].includes(path);
  const isSecondaryPage = ["/favoris", "/reglages", "/a-propos"].includes(path);
  const indexContainerRef = useRef<HTMLDivElement>(null);
  const { getScrollPosition } = useScroll();
  const isOverlayOpen = isCompte || isCreateEvent || isAuth;

  // Apply saved scroll to Index container when it becomes the background (overflow-y-auto)
  // useLayoutEffect = before paint, avoids flicker
  useLayoutEffect(() => {
    if (!isOverlayOpen || !indexContainerRef.current) return;
    const pos = getScrollPosition("/home");
    if (pos === undefined || pos <= 0) return;
    const el = indexContainerRef.current;
    el.scrollTop = pos;
    const id = requestAnimationFrame(() => { el.scrollTop = pos; });
    return () => cancelAnimationFrame(id);
  }, [isOverlayOpen, getScrollPosition]);

  const showCompteOverlay = isCompte || (isCreateEvent && fromCompte);

  // Index: hidden when on secondary pages (favoris, reglages, a-propos) but stays mounted
  // to keep images in DOM and prevent reload on return
  const indexContainerClass = isSecondaryPage
    ? "fixed inset-0 z-0 overflow-y-auto bg-background pointer-events-none invisible"
    : isCompte || isCreateEvent || isAuth
    ? "fixed inset-0 z-0 overflow-y-auto bg-background pointer-events-none"
    : "min-h-screen";

  return (
    <>
      {/* Index stays mounted - never unmounts, images stay loaded */}
      <div
        ref={indexContainerRef}
        className={indexContainerClass}
        aria-hidden={isCompte || isCreateEvent || isAuth || isSecondaryPage ? "true" : undefined}
      >
        <Index />
      </div>

      {/* Home flow overlays: Compte, CreateEvent - eager loaded to avoid first-click flash */}
      {showCompteOverlay && <Compte />}
      {isCreateEvent && <CreateEvent />}

      {/* Auth overlay - slides from right like profile */}
      {isAuth && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
              <span className="text-primary">Chargement...</span>
            </div>
          }
        >
          <Auth />
        </Suspense>
      )}

      {/* Secondary pages: Favorites, Settings, About - on top of hidden Index */}
      {isSecondaryPage && (
        <div className="relative z-10 min-h-screen">
          <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><span className="text-primary">Chargement...</span></div>}>
            <Outlet />
          </Suspense>
        </div>
      )}
    </>
  );
};

export default AppShellLayout;
