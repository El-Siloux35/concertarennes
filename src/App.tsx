import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { lazy, Suspense } from "react";
import Splash from "./pages/Splash";
import Index from "./pages/Index";
import { StatusBarProvider } from "./contexts/StatusBarContext";
import { ScrollProvider } from "./contexts/ScrollContext";
import { UserProvider } from "./contexts/UserContext";
import SeoManager from "./components/SeoManager";
import SafeAreaBackground from "./components/SafeAreaBackground";
import { usePWADrawerFix } from "./hooks/use-pwa-drawer-fix";

// Lazy load pages for better performance
const ConcertDetail = lazy(() => import("./pages/ConcertDetail"));
const Auth = lazy(() => import("./pages/Auth"));
const Favorites = lazy(() => import("./pages/Favorites"));
const PushProfileLayout = lazy(() => import("./components/PushProfileLayout"));
const SlideCreateEventLayout = lazy(() => import("./components/SlideCreateEventLayout"));
const EditEvent = lazy(() => import("./pages/EditEvent"));
const EmailConfirmed = lazy(() => import("./pages/EmailConfirmed"));
const About = lazy(() => import("./pages/About"));
const Settings = lazy(() => import("./pages/Settings"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-primary">Chargement...</div>
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  // Fix iOS PWA drawer touch event issues
  usePWADrawerFix();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="theme">
      <SafeAreaBackground />
      <StatusBarProvider>
        <UserProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollProvider>
                  <SeoManager />
                  <Suspense fallback={<PageLoader />}>
                    <Routes>
                      <Route path="/" element={<Splash />} />
                      <Route path="/home" element={<Index />} />
                      <Route path="/concert/:id" element={<ConcertDetail />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/favoris" element={<Favorites />} />
                      <Route path="/compte" element={<PushProfileLayout />} />
                      <Route path="/creer-evenement" element={<SlideCreateEventLayout />} />
                      <Route path="/modifier-evenement/:id" element={<EditEvent />} />
                      <Route path="/email-confirmed" element={<EmailConfirmed />} />
                      <Route path="/a-propos" element={<About />} />
                      <Route path="/reglages" element={<Settings />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ScrollProvider>
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </UserProvider>
      </StatusBarProvider>
    </ThemeProvider>
  );
};

export default App;
