import { api } from "./api";

export const empleadosService = {

  // Consultar empleados
  obtenerTodos() {
    return api("/empleados");
  },

  // Consultar un empleado por ID
  obtenerPorId(id) {
    return api(`/empleados/${id}`);
  },

  // Registrar un empleado
  registrar(datos) {
    return api("/empleados", {
      method: "POST",
      body: JSON.stringify(datos),
    });
  },

  // Actualizar información del empleado
  actualizar(id, datos) {
    return api(`/empleados/${id}`, {
      method: "PATCH",
      body: JSON.stringify(datos),
    });
  },

  // Desactivar empleado
  desactivar(id) {
    return api(`/empleados/${id}/desactivar`, {
      method: "PATCH",
    });
  },

  // Reactivar empleado
  reactivar(id) {
    return api(`/empleados/${id}/reactivar`, {
      method: "PATCH",
    });
  },

};