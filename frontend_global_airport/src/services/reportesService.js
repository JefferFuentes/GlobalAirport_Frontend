import { api } from "./api";

function construirConsulta(filtros = {}) {

    const parametros = new URLSearchParams();

    if (filtros.fechaInicio) {
        parametros.set(
            "fechaInicio",
            filtros.fechaInicio
        );
    }

    if (filtros.fechaFin) {
        parametros.set(
            "fechaFin",
            filtros.fechaFin
        );
    }

    const consulta = parametros.toString();

    return consulta ? `?${consulta}` : "";
}

export const reportesService = {

    obtenerDashboard: (filtros = {}) =>
        api(
            `/dashboard${construirConsulta(filtros)}`
        ),

    obtenerVuelos: (filtros = {}) =>
        api(
            `/reportes/vuelos${construirConsulta(filtros)}`
        ),

    obtenerPasajeros: (filtros = {}) =>
        api(
            `/reportes/pasajeros${construirConsulta(filtros)}`
        ),

    obtenerPilotos: (filtros = {}) =>
        api(
            `/reportes/pilotos${construirConsulta(filtros)}`
        ),

    obtenerReservaciones: (filtros = {}) =>
        api(
            `/reportes/reservaciones${construirConsulta(filtros)}`
        ),

};