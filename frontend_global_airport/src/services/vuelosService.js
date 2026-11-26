import { api } from "./api";

export const vuelosService = {

  obtenerTodos: () =>
    api("/vuelos"),

  obtenerPorId: (id) =>
    api(`/vuelos/${id}`),

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

  cambiarEstado: (id, estado) =>
    api(`/vuelos/${id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado }),
    }),

  obtenerPilotos: () =>
    api("/pilotos"),

  obtenerAsignaciones: async () => {

    const vuelos = await api("/vuelos");

    if (!Array.isArray(vuelos)) {
      throw new Error(
        "La API no devolvió una lista de vuelos."
      );
    }

    return vuelos.flatMap((vuelo) =>
      Array.isArray(vuelo.pilotos)
        ? vuelo.pilotos.map((asignacion) => ({
          ...asignacion,
          vueloId: vuelo.id,
        }))
        : []
    );
  },

  asignarPiloto: (vueloId, pilotoId) =>
    api(`/vuelos/${vueloId}/pilotos`, {
      method: "POST",
      body: JSON.stringify({
        pilotoId: Number(pilotoId),
      }),
    }),

  quitarPiloto: (vueloId, pilotoId) =>
    api(
      `/vuelos/${vueloId}/pilotos/${pilotoId}`,
      {
        method: "DELETE",
      }
    ),

};