import { api } from "./api";

const ENDPOINT = "/asignaciones-administradores";

export const asignacionesAdministradoresService = {
    // Obtener todas las asignaciones
    obtenerTodos() {
        return api(ENDPOINT);
    },

    // Obtener una asignación por ID
    obtenerPorId(id) {
        return api(`${ENDPOINT}/${id}`);
    },

    // Registrar una asignación
    registrar(datos) {
        return api(ENDPOINT, {
            method: "POST",
            body: JSON.stringify(datos),
        });
    },

    // Actualizar una asignación
    actualizar(id, datos) {
        return api(`${ENDPOINT}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(datos),
        });
    },

    // Revocar una asignación
    eliminar(id) {
        return api(`${ENDPOINT}/${id}`, {
            method: "DELETE",
        });
    },
};