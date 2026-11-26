import { api } from "./api";

const ENDPOINT = "/pasajeros";

export const pasajerosService = {

  obtenerTodos() {
    return api(ENDPOINT);
  },

  obtenerPorId(id) {
    return api(`${ENDPOINT}/${id}`);
  },

  obtenerReservaciones(id) {
    return api(`${ENDPOINT}/${id}/reservaciones`);
  },

  registrar(datos) {
    return api(ENDPOINT, {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  actualizar(id, datos) {
    return api(`${ENDPOINT}/${id}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    });
  },

  eliminar(id) {
    return api(`${ENDPOINT}/${id}`, {
      method: "DELETE",
    });
  },

};