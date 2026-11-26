import { api } from "./api";

export const usuariosService = {
  // Obtener todos los usuarios
  obtenerTodos: () => api("/usuarios"),

  // Registrar un usuario
  registrar: (datos) =>
    api("/usuarios", {
      method: "POST",
      body: JSON.stringify(datos),
    }),

  // Actualizar un usuario
  actualizar: (id, datos) =>
    api(`/usuarios/${id}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    }),

  // Eliminar un usuario
  eliminar: (id) =>
    api(`/usuarios/${id}`, {
      method: "DELETE",
    }),

  // Desactivar un usuario
  desactivar: (id) =>
    api(`/usuarios/${id}/desactivar`, {
      method: "PATCH",
    }),

  // Reactivar un usuario
  reactivar: (id) =>
    api(`/usuarios/${id}/reactivar`, {
      method: "PATCH",
    }),

  // Consultar el perfil del usuario autenticado
  perfil: () => api("/usuarios/me"),
};