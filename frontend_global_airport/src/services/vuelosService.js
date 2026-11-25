
import { api } from "./api";

export const vuelosService = {
  obtenerTodos: () => api("/vuelos"),

  obtenerPorId: (id) => api(`/vuelos/${id}`),

  registrar: (datos) =>
    api("/vuelos", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  modificar: (id, datos) =>
    api(`/vuelos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    }),

  obtenerPilotos: () => api("/pilotos"),

  obtenerAsignaciones: () =>
    api("/asignaciones-pilotos"),

  asignarPiloto: (vueloId, pilotoId) =>
    api("/asignaciones-pilotos", {
      method: "POST",
      body: JSON.stringify({ vueloId, pilotoId }),
    }),
};
