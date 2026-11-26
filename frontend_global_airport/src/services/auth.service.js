import { api } from "./api";

// =====================================
// INICIAR SESIÓN
// =====================================

export async function login(correo, password) {

    return api("/auth/login", {

        method: "POST",

        autenticado: false,

        notificar401: false,

        body: JSON.stringify({
            correo,
            password,
        }),

    });
}

// =====================================
// CONSULTAR USUARIO AUTENTICADO
// =====================================

export async function obtenerUsuario(token) {

    return api("/auth/me", {

        method: "GET",

        token,

    });
}

// =====================================
// SELECCIONAR AEROPUERTO ACTIVO
// =====================================

export async function seleccionarAeropuerto(
    token,
    aeropuertoId
) {

    return api(
        "/auth/seleccionar-aeropuerto",
        {

            method: "POST",

            token,

            notificar401: false,

            body: JSON.stringify({
                aeropuertoId,
            }),

        }
    );
}

// =====================================
// CERRAR SESIÓN
// =====================================

export async function logout(token) {

    return api("/auth/logout", {

        method: "POST",

        token,

        notificar401: false,

        signal: AbortSignal.timeout(8000),

    });
}