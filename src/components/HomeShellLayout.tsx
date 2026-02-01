import { useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import Index from "@/pages/Index";

const Compte = lazy(() => import("@/pages/Compte"));
const CreateEvent = lazy(() => import("@/pages/CreateEvent"));

/**
 * Layout that keeps Index mounted when navigating between home, profile, and create event.
 * Prevents re-fetching, preserves scroll position, eliminates "reload" feeling in PWA.
 */
const HomeShellLayout = () => {
  const location = useLocation();
  const path = location.pathname;
  const isCompte = path === "/compte";
  const isCreateEvent = path === "/creer-evenement";
  const fromCompte = (location.state as { from?: string })?.from === "compte";

  // Preload overlay components on mount (reduces latency when user clicks)
  useEffect(() => {
    import("@/pages/Compte");
    import("@/pages/CreateEvent");
  }, []);

  const showCompteOverlay = isCompte || (isCreateEvent && fromCompte);

  return (
    <>
      {/* Index stays mounted - never unmounts when switching between home/compte/creer */}
      <div
        className={
          isCompte || isCreateEvent
            ? "fixed inset-0 z-0 overflow-y-auto bg-background pointer-events-none"
            : "min-h-screen"
        }
        aria-hidden={isCompte || isCreateEvent ? "true" : undefined}
      >
        <Index />
      </div>

      {/* Compte overlay - slides from right */}
      {showCompteOverlay && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-background z-40 flex items-center justify-center">
              <span className="text-primary">Chargement...</span>
            </div>
          }
        >
          <Compte />
        </Suspense>
      )}

      {/* CreateEvent overlay - slides from bottom (on top of Compte when from compte) */}
      {isCreateEvent && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
              <span className="text-primary">Chargement...</span>
            </div>
          }
        >
          <CreateEvent />
        </Suspense>
      )}
    </>
  );
};

export default HomeShellLayout;
