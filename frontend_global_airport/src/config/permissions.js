// =====================================
// ROLES DEL SISTEMA
// =====================================

export const ROLES = {
    ADMIN_GENERAL: "ADMIN_GENERAL",
    ADMIN_AEROPUERTO: "ADMIN_AEROPUERTO",
    EMPLEADO: "EMPLEADO",
};

// =====================================
// GRUPOS DE AUTORIZACIÓN
// =====================================

const TODOS = [
    ROLES.ADMIN_GENERAL,
    ROLES.ADMIN_AEROPUERTO,
    ROLES.EMPLEADO,
];

const ADMINISTRADORES = [
    ROLES.ADMIN_GENERAL,
    ROLES.ADMIN_AEROPUERTO,
];

const SOLO_ADMIN_GENERAL = [
    ROLES.ADMIN_GENERAL,
];

const NINGUNO = [];

// =====================================
// MATRIZ DE PERMISOS
// =====================================

export const PERMISOS = {

    // INICIO

    inicio: {
        consultar: TODOS,
    },

    // USUARIOS

    usuarios: {
        consultar: SOLO_ADMIN_GENERAL,
        crear: SOLO_ADMIN_GENERAL,
        editar: SOLO_ADMIN_GENERAL,
        eliminar: SOLO_ADMIN_GENERAL,
        cambiarEstado: SOLO_ADMIN_GENERAL,
        cambiarRol: NINGUNO,
        cambiarPassword: SOLO_ADMIN_GENERAL,
        asignarAeropuerto: SOLO_ADMIN_GENERAL,
    },

    // EMPLEADOS

    empleados: {
        consultar: ADMINISTRADORES,
        crear: ADMINISTRADORES,
        editar: ADMINISTRADORES,
        cambiarEstado: ADMINISTRADORES,
        trasladar: SOLO_ADMIN_GENERAL,
        cambiarPassword: SOLO_ADMIN_GENERAL,
        eliminar: NINGUNO,
    },

    // AEROPUERTOS

    aeropuertos: {
        consultar: ADMINISTRADORES,
        crear: SOLO_ADMIN_GENERAL,
        editar: ADMINISTRADORES,
        eliminar: SOLO_ADMIN_GENERAL,
        cambiarIata: SOLO_ADMIN_GENERAL,
        consultarRelaciones: ADMINISTRADORES,
        consultarCatalogo: TODOS,
    },

    // ASIGNACIONES DE ADMINISTRADORES

    asignacionesAdministradores: {
        consultar: SOLO_ADMIN_GENERAL,
        crear: SOLO_ADMIN_GENERAL,
        editar: SOLO_ADMIN_GENERAL,
        revocar: SOLO_ADMIN_GENERAL,
    },

    // PASAJEROS

    pasajeros: {
        consultar: TODOS,
        crear: TODOS,
        editar: TODOS,
        consultarHistorial: TODOS,
        eliminar: SOLO_ADMIN_GENERAL,
    },

    // VUELOS

    vuelos: {
        consultar: TODOS,
        crear: ADMINISTRADORES,
        editar: ADMINISTRADORES,
        cambiarEstado: ADMINISTRADORES,
        asignarPiloto: ADMINISTRADORES,
        quitarPiloto: ADMINISTRADORES,
        consultarAsientos: TODOS,
        eliminar: NINGUNO,
    },

    // RESERVACIONES

    reservaciones: {
        consultar: TODOS,
        crear: TODOS,
        cancelar: TODOS,
        consultarAsientos: TODOS,
        consultarComprobante: TODOS,
        registrarCheckIn: TODOS,
        consultarCheckIn: TODOS,
        generarPaseAbordaje: TODOS,
        eliminar: NINGUNO,
    },

    // PILOTOS

    pilotos: {
        consultar: TODOS,
        crear: ADMINISTRADORES,
        editar: ADMINISTRADORES,
        desactivar: ADMINISTRADORES,
        reactivar: ADMINISTRADORES,
        eliminar: NINGUNO,
    },

    // REPORTES E INDICADORES

    reportes: {
        consultar: ADMINISTRADORES,
        consultarDashboard: ADMINISTRADORES,
        consultarVuelos: ADMINISTRADORES,
        consultarReservaciones: ADMINISTRADORES,
        consultarPasajeros: ADMINISTRADORES,
        consultarPilotos: ADMINISTRADORES,
        exportar: ADMINISTRADORES,
    },
};

// =====================================
// VERIFICAR PERMISO
// =====================================

export function tienePermiso(
    rol,
    modulo,
    accion = "consultar"
) {
    if (!rol || !modulo || !accion) {
        return false;
    }

    const permisos = PERMISOS[modulo]?.[accion];

    return (
        Array.isArray(permisos) &&
        permisos.includes(rol)
    );
}