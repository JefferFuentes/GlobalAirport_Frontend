import { api } from "./api";

export const reservacionesService = {

  obtenerTodos: () =>
    api("/reservaciones"),

  obtenerPorId: (id) =>
    api(`/reservaciones/${id}`),

  obtenerPorCodigo: (codigo) =>
    api(`/reservaciones/codigo/${encodeURIComponent(codigo)}`),

  obtenerDisponibilidad: (vueloId) =>
    api(`/reservaciones/vuelos/${vueloId}/asientos`),

  registrar: (datos) =>
    api("/reservaciones", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  cancelar: (id, motivoCancelacion) =>
    api(`/reservaciones/${id}/cancelar`, {
      method: "PATCH",
      body: JSON.stringify({
        motivoCancelacion,
      }),
    }),

};