import { useLocation } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "@/pages/Index";
import Compte from "@/pages/Compte";

const CreateEvent = lazy(() => import("@/pages/CreateEvent"));

/**
 * Layout for /creer-evenement: background stays static, CreateEvent slides in from bottom and covers.
 */
const SlideCreateEventLayout = () => {
  const location = useLocation();
  const isCreateEvent = location.pathname === "/creer-evenement";
  const fromCompte = (location.state as { from?: string })?.from === "compte";

  if (!isCreateEvent) {
    return null;
  }

  return (
    <>
      {/* Background: stays static */}
      <div className="fixed inset-0 z-0 overflow-y-auto bg-background" aria-hidden="true">
        {fromCompte ? <Compte /> : <Index />}
      </div>

      {/* Foreground: CreateEvent slides in from bottom */}
      <Suspense
        fallback={
          <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
            <span className="text-primary">Chargement...</span>
          </div>
        }
      >
        <CreateEvent />
      </Suspense>
    </>
  );
};

export default SlideCreateEventLayout;
