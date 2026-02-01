import { useLocation } from "react-router-dom";
import { useState, useCallback, lazy, Suspense } from "react";
import Index from "@/pages/Index";

const Compte = lazy(() => import("@/pages/Compte"));

/**
 * Layout for /compte route: shows Index in background (pushed left) + Compte overlay (slide-in from right).
 * Creates a "push" navigation effect where the profile screen covers the home.
 */
const PushProfileLayout = () => {
  const location = useLocation();
  const isCompte = location.pathname === "/compte";
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseStart = useCallback(() => {
    setIsClosing(true);
  }, []);

  if (!isCompte) {
    return null;
  }

  return (
    <>
      {/* Background: Index slides left and scales down */}
      <div
        className={`fixed inset-0 z-0 overflow-hidden bg-background ${
          isClosing ? "animate-push-back-reverse" : "animate-push-back"
        }`}
        aria-hidden="true"
      >
        <Index />
      </div>

      {/* Foreground: Compte slides in from right and covers */}
      <Suspense fallback={<div className="fixed inset-0 bg-background z-50 flex items-center justify-center"><span className="text-primary">Chargement...</span></div>}>
        <Compte onCloseStart={handleCloseStart} />
      </Suspense>
    </>
  );
};

export default PushProfileLayout;
