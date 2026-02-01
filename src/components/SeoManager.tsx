import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ensureMeta(name: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  return el;
}

function ensureLink(rel: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  return el;
}

function getSeo(pathname: string) {
  const baseDescription = "L'agenda des musiques alternatives à Rennes et aux alentours";

  if (pathname.startsWith("/concert/")) {
    return {
      title: "Détail concert | L'agenda du 35",
      description: "Détails du concert, infos pratiques et organisation.",
    };
  }

  if (pathname.startsWith("/modifier-evenement/") || pathname.startsWith("/compte/edit/")) {
    return {
      title: "Modifier événement | L'agenda du 35",
      description: "Modifiez les informations de votre événement rapidement.",
    };
  }

  switch (pathname) {
    case "/":
      return {
        title: "L'agenda du 35",
        description: baseDescription,
      };
    case "/home":
      return {
        title: "L'agenda du 35 | Événements",
        description: baseDescription,
      };
    case "/auth":
      return {
        title: "Connexion organisateur | L'agenda du 35",
        description: "Connectez-vous ou créez un compte organisateur pour gérer vos événements.",
      };
    case "/favoris":
      return {
        title: "Favoris | L'agenda du 35",
        description: "Retrouvez vos concerts favoris et accédez vite aux détails.",
      };
    case "/compte":
      return {
        title: "Compte organisateur | L'agenda du 35",
        description: "Gérez votre compte organisateur et vos informations.",
      };
    case "/creer-evenement":
      return {
        title: "Créer événement | L'agenda du 35",
        description: "Créez un nouvel événement avec titre, date, lieu et infos.",
      };
    case "/reglages":
      return {
        title: "Réglages | L'agenda du 35",
        description: "Personnalisez l'apparence et les notifications de l'application.",
      };
    default:
      return {
        title: "Page introuvable | L'agenda du 35",
        description: "Cette page n'existe pas. Revenez à l'accueil pour continuer.",
      };
  }
}

export default function SeoManager() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description } = getSeo(pathname);

    document.title = title;

    const metaDescription = ensureMeta("description");
    metaDescription.setAttribute("content", description);

    const canonical = ensureLink("canonical");
    canonical.setAttribute("href", `${window.location.origin}${pathname}`);
  }, [pathname]);

  return null;
}
