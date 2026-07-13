import type { LapRecord } from "@gp/shared";

export interface LapFilters {
  simGameIds: string[];
  trackIds: string[];
  carIds: string[];
  onlyPersonalBests: boolean;
}

export const EMPTY_LAP_FILTERS: LapFilters = {
  simGameIds: [],
  trackIds: [],
  carIds: [],
  onlyPersonalBests: false,
};

export function hasActiveLapFilters(filters: LapFilters): boolean {
  return (
    filters.simGameIds.length > 0 ||
    filters.trackIds.length > 0 ||
    filters.carIds.length > 0 ||
    filters.onlyPersonalBests
  );
}

/** Misma forma que `filterGames`: función pura, lista para mudarse al backend. */
export function filterLaps(laps: readonly LapRecord[], filters: LapFilters): LapRecord[] {
  return laps.filter((lap) => {
    if (filters.onlyPersonalBests && !lap.isPersonalBest) return false;
    if (filters.simGameIds.length > 0 && !filters.simGameIds.includes(lap.simGame.id)) {
      return false;
    }
    if (filters.trackIds.length > 0 && !filters.trackIds.includes(lap.track.id)) return false;
    if (filters.carIds.length > 0 && !filters.carIds.includes(lap.car.id)) return false;

    return true;
  });
}
