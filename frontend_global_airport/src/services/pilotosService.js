import { api } from "./api";

export const pilotosService = {
  // Obtener todos los pilotos
  obtenerTodos: () => api("/pilotos"),

  // Obtener un piloto por su ID
  obtenerPorId: (id) => api(`/pilotos/${id}`),

  // Registrar un nuevo piloto
  registrar: (datos) =>
    api("/pilotos", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  // Modificar un piloto existente
  modificar: (id, datos) =>
    api(`/pilotos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    }),

  // Eliminar piloto
  eliminar: (id) =>
    api(`/pilotos/${id}`, {
      method: "DELETE",
    }),

  // Reactivar piloto
  reactivar: (id) =>
    api(`/pilotos/${id}/reactivar`, {
      method: "PATCH",
    }),
};