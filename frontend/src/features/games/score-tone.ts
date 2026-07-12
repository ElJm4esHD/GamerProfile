/**
 * El color vive SOLO en la columna Overall.
 *
 * Los criterios individuales van en texto plano y a contraste total: son el
 * dato que más se lee de la tabla. Pintarlos los vuelve ilegibles y convierte
 * la pantalla en una planilla de Excel.
 *
 * Escala deliberadamente corta: verde solo arriba de 85, rojo solo abajo de
 * 55, y el medio en neutro. Un degradé de seis tonos no informa, decora.
 */
export function overallTone(value: number | null): string {
  if (value === null) return "text-muted";
  if (value >= 85) return "bg-emerald-400/15 text-emerald-50";
  if (value >= 70) return "bg-emerald-400/[0.06] text-ink";
  if (value >= 55) return "bg-slate-300/[0.04] text-ink";
  return "bg-rose-400/10 text-rose-50";
}
