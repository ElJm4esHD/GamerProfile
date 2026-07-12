/**
 * Catálogos de la biblioteca.
 *
 * Todos comparten la misma forma: una entidad con nombre y una tabla puente
 * hacia `games`. Es el mismo patrón que `criteria` + `game_ratings`, que ya
 * está probado. Sin esto, "distribución de géneros" es imposible: no se puede
 * agrupar por texto libre donde escribiste "RPG", "rpg" y "R.P.G.".
 */

export interface Platform {
  id: string;
  name: string;
  position: number;
}

export interface Genre {
  id: string;
  name: string;
  position: number;
}

export interface Tag {
  id: string;
  name: string;
}

/** Developer y publisher salen de acá: una sola fuente, cero variantes tipeadas. */
export interface Company {
  id: string;
  name: string;
}
