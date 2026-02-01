import { useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "@/pages/Index";

const Compte = lazy(() => import("@/pages/Compte"));

/**
 * Layout for /compte route: Index stays static in background, Compte slides in from right and covers.
 */
const PushProfileLayout = () => {
  const location = useLocation();
  const isCompte = location.pathname === "/compte";

  if (!isCompte) {
    return null;
  }

  return (
    <>
      {/* Background: Index stays static, no movement */}
      <div className="fixed inset-0 z-0 overflow-y-auto bg-background" aria-hidden="true">
        <Index />
      </div>

      {/* Foreground: Compte slides in from right and covers */}
      <Suspense fallback={<div className="fixed inset-0 bg-background z-50 flex items-center justify-center"><span className="text-primary">Chargement...</span></div>}>
        <Compte />
      </Suspense>
    </>
  );
};

export default PushProfileLayout;
