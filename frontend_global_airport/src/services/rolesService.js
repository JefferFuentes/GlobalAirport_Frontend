import { api } from "./api";

export const rolesService = {
  // Obtener todos los roles
  obtenerTodos: () => api("/roles"),
};