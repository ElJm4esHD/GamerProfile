import {
  dashboardLayoutSchema,
  EMPTY_DASHBOARD_LAYOUT,
  type DashboardBoard,
  type DashboardLayout,
} from "@gp/shared";
import * as preferencesRepository from "../repositories/preferences.repository.js";

const layoutKey = (board: DashboardBoard): string => `dashboard.${board}`;

/**
 * El layout guardado, o el vacío si no hay ninguno.
 *
 * Un JSON corrupto o de una versión vieja NO rompe el Dashboard: se descarta y
 * se cae al default. La preferencia es cosmética; nunca puede tapar los datos.
 */
export function getDashboardLayout(board: DashboardBoard): DashboardLayout {
  const raw = preferencesRepository.findValue(layoutKey(board));
  if (!raw) return EMPTY_DASHBOARD_LAYOUT;

  try {
    const parsed = dashboardLayoutSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : EMPTY_DASHBOARD_LAYOUT;
  } catch {
    return EMPTY_DASHBOARD_LAYOUT;
  }
}

export function saveDashboardLayout(
  board: DashboardBoard,
  layout: DashboardLayout,
): DashboardLayout {
  preferencesRepository.saveValue(layoutKey(board), JSON.stringify(layout));
  return layout;
}

/** Volver al orden del registro: se borra la preferencia, no se guarda una vacía. */
export function resetDashboardLayout(board: DashboardBoard): DashboardLayout {
  preferencesRepository.removeValue(layoutKey(board));
  return EMPTY_DASHBOARD_LAYOUT;
}
