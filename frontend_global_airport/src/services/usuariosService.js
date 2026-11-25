import { api } from "./api";

export const usuariosService = {
  obtenerTodos: () => api("/usuarios"),

  registrar: (datos) =>
    api("/usuarios", {
      method: "POST",
      body: JSON.stringify(datos),
    }),
};