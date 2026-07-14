/** Error de dominio: el recurso pedido no existe. La capa HTTP lo mapea a 404. */
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} no encontrado: ${id}`);
    this.name = "NotFoundError";
  }
}

/**
 * La operación es válida pero chocaría con datos existentes.
 * Se usa para impedir borrar algo que está en uso: la alternativa sería
 * romper una foreign key o, peor, arrastrar historial con un CASCADE.
 */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

/**
 * Un servicio externo (o su configuración) no está disponible.
 * La app entera funciona sin él: solo se apaga la función que lo necesita.
 */
export class UnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnavailableError";
  }
}
