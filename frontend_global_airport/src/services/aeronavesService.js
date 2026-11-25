import { api } from "./api";

export const aeronavesService = {

  // Obtener todas las aeronaves
  obtenerTodos: () => api("/aeronaves"),

  // Obtener una aeronave por su ID
  obtenerPorId: (id) => api(`/aeronaves/${id}`),

};
