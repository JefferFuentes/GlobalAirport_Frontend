export const ROLES = {
    ADMIN_GENERAL: "ADMIN_GENERAL",
    ADMIN_AEROPUERTO: "ADMIN_AEROPUERTO",
    EMPLEADO: "EMPLEADO",
};

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

export const PERMISOS = {
    inicio: {
        consultar: TODOS,
    },

    usuarios: {
        consultar: SOLO_ADMIN_GENERAL,
        crear: SOLO_ADMIN_GENERAL,
        editar: SOLO_ADMIN_GENERAL,
        eliminar: SOLO_ADMIN_GENERAL,
        cambiarEstado: SOLO_ADMIN_GENERAL,
        asignarAeropuerto: SOLO_ADMIN_GENERAL,
    },

    aeropuertos: {
        consultar: TODOS,
        crear: ADMINISTRADORES,
        editar: ADMINISTRADORES,
        eliminar: ADMINISTRADORES,
    },

    pasajeros: {
        consultar: TODOS,
        crear: TODOS,
        editar: TODOS,
        eliminar: TODOS,
    },

    vuelos: {
        consultar: TODOS,
        crear: ADMINISTRADORES,
        editar: ADMINISTRADORES,
        cambiarEstado: ADMINISTRADORES,
        asignarPiloto: ADMINISTRADORES,
        quitarPiloto: ADMINISTRADORES,
        eliminar: [],
    },

    reservaciones: {
        consultar: TODOS,
        crear: TODOS,
        cancelar: TODOS,
        consultarAsientos: TODOS,
        consultarComprobante: TODOS,
        registrarCheckIn: TODOS,
        consultarCheckIn: TODOS,
    },

    pilotos: {
        consultar: TODOS,
        crear: ADMINISTRADORES,
        editar: ADMINISTRADORES,
        desactivar: ADMINISTRADORES,
        reactivar: ADMINISTRADORES,
    },

    reportes: {
        consultar: ADMINISTRADORES,
    },
};

export function tienePermiso(rol, modulo, accion = "consultar") {
    return PERMISOS[modulo]?.[accion]?.includes(rol) ?? false;
}