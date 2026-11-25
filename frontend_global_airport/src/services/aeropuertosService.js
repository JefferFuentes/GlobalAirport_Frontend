import { api } from "./api";

export const aeropuertosService = {

  // Obtener todos los aeropuertos
  obtenerTodos: () => api("/aeropuertos"),

  // Obtener un aeropuerto por su ID
  obtenerPorId: (id) => api(`/aeropuertos/${id}`),

};
