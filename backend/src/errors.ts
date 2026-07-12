/** Error de dominio: el recurso pedido no existe. La capa HTTP lo mapea a 404. */
export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} no encontrado: ${id}`);
    this.name = "NotFoundError";
  }
}
