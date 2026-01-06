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
  if (pathname.startsWith("/concert/")) {
    return {
      title: "Détail concert | Agenda concerts",
      description: "Détails du concert, infos pratiques et organisation.",
    };
  }

  if (pathname.startsWith("/modifier-evenement/")) {
    return {
      title: "Modifier événement | Agenda concerts",
      description: "Modifiez les informations de votre événement rapidement.",
    };
  }

  switch (pathname) {
    case "/":
      return {
        title: "Agenda concerts | Accueil",
        description: "Découvrez les concerts et événements, et organisez les vôtres.",
      };
    case "/home":
      return {
        title: "Agenda concerts | Événements",
        description: "Parcourez les événements, filtres, favoris et détails des concerts.",
      };
    case "/auth":
      return {
        title: "Connexion organisateur | Agenda concerts",
        description: "Connectez-vous ou créez un compte organisateur pour gérer vos événements.",
      };
    case "/favoris":
      return {
        title: "Favoris concerts | Agenda concerts",
        description: "Retrouvez vos concerts favoris et accédez vite aux détails.",
      };
    case "/compte":
      return {
        title: "Compte organisateur | Agenda concerts",
        description: "Gérez votre compte organisateur et vos informations.",
      };
    case "/creer-evenement":
      return {
        title: "Créer événement | Agenda concerts",
        description: "Créez un nouvel événement avec titre, date, lieu et infos.",
      };
    default:
      return {
        title: "Page introuvable | Agenda concerts",
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
