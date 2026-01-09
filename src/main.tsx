import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import App from "./App.tsx";
import "./index.css";

// Auto-reload quand une nouvelle version est disponible
registerSW({
  onNeedRefresh() {
    // Recharge automatiquement la page quand une nouvelle version est prête
    window.location.reload();
  },
});

createRoot(document.getElementById("root")!).render(<App />);
