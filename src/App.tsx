import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ConcertDetail from "./pages/ConcertDetail";
import Splash from "./pages/Splash";
import Auth from "./pages/Auth";
import Favorites from "./pages/Favorites";
import Compte from "./pages/Compte";
import CreateEvent from "./pages/CreateEvent";
import EditEvent from "./pages/EditEvent";
import EmailConfirmed from "./pages/EmailConfirmed";
import useThemeColor from "./hooks/useThemeColor";
import SeoManager from "./components/SeoManager";

const queryClient = new QueryClient();

const App = () => {
  // Dynamically updates status bar color based on system theme
  useThemeColor();
  
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SeoManager />
            <Routes>
              <Route path="/" element={<Splash />} />
              <Route path="/home" element={<Index />} />
              <Route path="/concert/:id" element={<ConcertDetail />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/favoris" element={<Favorites />} />
              <Route path="/compte" element={<Compte />} />
              <Route path="/creer-evenement" element={<CreateEvent />} />
              <Route path="/modifier-evenement/:id" element={<EditEvent />} />
              <Route path="/email-confirmed" element={<EmailConfirmed />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
