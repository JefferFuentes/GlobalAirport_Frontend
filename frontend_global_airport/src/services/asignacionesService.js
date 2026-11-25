
import { api } from "./api";

export const asignacionesService = {

  // Obtener todas las asignaciones
  obtenerTodos: () => api("/asignaciones-pilotos"),

  // Obtener una asignación por su ID
  obtenerPorId: (id) =>
    api(`/asignaciones-pilotos/${id}`),

  // Asignar un piloto a un vuelo
  registrar: (vueloId, pilotoId) =>
    api("/asignaciones-pilotos", {
      method: "POST",
      body: JSON.stringify({
        vueloId,
        pilotoId,
      }),
    }),

  // Modificar una asignación existente
  modificar: (id, datos) =>
    api(`/asignaciones-pilotos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    }),

  // Retirar una asignación
  eliminar: (id) =>
    api(`/asignaciones-pilotos/${id}`, {
      method: "DELETE",
    }),

};
