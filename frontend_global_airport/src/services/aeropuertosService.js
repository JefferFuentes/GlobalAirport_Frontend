import { api } from "./api";

export const aeropuertosService = {

  // ==========================================
  // DIRECTORIO ADMINISTRATIVO
  // ==========================================

  obtenerTodos() {
    return api("/aeropuertos");
  },

  // ==========================================
  // CATÁLOGO OPERATIVO
  // ==========================================

  obtenerCatalogo() {
    return api("/aeropuertos/catalogo");
  },

  // ==========================================
  // CONSULTAR DETALLES ADMINISTRATIVOS
  // ==========================================

  obtenerPorId(id) {
    return api(`/aeropuertos/${id}`);
  },

  // ==========================================
  // REGISTRAR AEROPUERTO
  // ==========================================

  registrar(datos) {
    return api("/aeropuertos", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  // ==========================================
  // ACTUALIZAR AEROPUERTO
  // ==========================================

  actualizar(id, datos) {
    return api(`/aeropuertos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    });
  },

  // ==========================================
  // ELIMINAR AEROPUERTO
  // ==========================================

  eliminar(id) {
    return api(`/aeropuertos/${id}`, {
      method: "DELETE",
    });
  },

};