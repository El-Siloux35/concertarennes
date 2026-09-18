import { supabase } from "@/integrations/supabase/client";

/**
 * Favoris : ids d'évènements stockés dans le localStorage du navigateur.
 *
 * Source unique de vérité pour la lecture/écriture, pour que le compteur du
 * header, les cards et la page favoris comptent toujours la même chose.
 */

const STORAGE_KEY = "favorites";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value: string) => UUID_RE.test(value);

/** Évènement interne : prévient le header et la page favoris d'un changement. */
export const FAVORITES_UPDATED_EVENT = "favoritesUpdated";

/**
 * Lit les favoris en ignorant les entrées invalides et les doublons.
 * `hadInvalid` signale qu'au moins une entrée a été écartée.
 */
export function readFavoritesDetailed(): { ids: string[]; hadInvalid: boolean } {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(raw)) return { ids: [], hadInvalid: false };

    const asStrings = raw.map((value) => String(value));
    const ids = [...new Set(asStrings.filter(isUuid))];
    return { ids, hadInvalid: asStrings.length !== ids.length };
  } catch {
    return { ids: [], hadInvalid: false };
  }
}

export function readFavorites(): string[] {
  return readFavoritesDetailed().ids;
}

/** Écrit les favoris et prévient le reste de l'app. */
export function writeFavorites(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage indisponible (navigation privée) : on ne bloque pas l'UI
  }
  window.dispatchEvent(new Event(FAVORITES_UPDATED_EVENT));
}

export function isFavorite(id: string): boolean {
  return readFavorites().includes(id);
}

/** Ajoute ou retire un favori. Retourne true si l'évènement est désormais favori. */
export function toggleFavorite(id: string): boolean {
  const favorites = readFavorites();
  const nowFavorite = !favorites.includes(id);
  writeFavorites(
    nowFavorite ? [...favorites, id] : favorites.filter((favId) => favId !== id)
  );
  return nowFavorite;
}

/**
 * Retire les favoris dont l'évènement n'existe plus en base (évènement supprimé
 * par son organisateur) : sans ça, l'id reste stocké et le compteur du header
 * annonce des favoris que la page favoris ne peut plus afficher.
 *
 * En cas d'erreur réseau on ne purge rien, pour ne pas perdre des favoris
 * valides sur un simple échec de requête.
 */
export async function pruneDeletedFavorites(): Promise<string[]> {
  const favorites = readFavorites();
  if (favorites.length === 0) return favorites;

  const { data, error } = await supabase
    .from("events")
    .select("id")
    .in("id", favorites);

  if (error || !data) return favorites;

  const existingIds = new Set(data.map((event) => event.id));
  const kept = favorites.filter((id) => existingIds.has(id));

  if (kept.length !== favorites.length) {
    writeFavorites(kept);
  }

  return kept;
}
